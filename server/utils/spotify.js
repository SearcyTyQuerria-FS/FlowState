const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

function spotifyBasicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// spotify sometimes sends plain text errors, so i handle both
async function readSpotifyBody(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

// if my access token expired, use the refresh token before calling the api
async function getValidSpotifyToken(user) {
  if (!user.spotifyAccessToken || !user.spotifyRefreshToken) {
    const err = new Error("Spotify not connected");
    err.status = 400;
    err.needsSpotifyAuth = true;
    throw err;
  }

  const expiresAt = user.spotifyTokenExpiresAt
    ? new Date(user.spotifyTokenExpiresAt).getTime()
    : 0;

  // still good for another minute, so no need to refresh yet
  if (expiresAt > Date.now() + 60 * 1000) {
    return user.spotifyAccessToken;
  }

  const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: spotifyBasicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: user.spotifyRefreshToken,
    }),
  });

  const tokenData = await readSpotifyBody(tokenResponse);

  if (!tokenResponse.ok) {
    console.error("Spotify refresh error:", tokenData);

    const err = new Error(
      tokenData.error === "invalid_client"
        ? "Spotify client id/secret in .env do not match my developer app"
        : "Failed to refresh Spotify token, reconnect Spotify in Settings",
    );
    err.status = 401;
    err.needsSpotifyAuth = true;
    throw err;
  }

  user.spotifyAccessToken = tokenData.access_token;
  // spotify only sends a new refresh token sometimes
  if (tokenData.refresh_token) {
    user.spotifyRefreshToken = tokenData.refresh_token;
  }
  user.spotifyTokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
  await user.save();

  return user.spotifyAccessToken;
}

module.exports = {
  getValidSpotifyToken,
  readSpotifyBody,
};
