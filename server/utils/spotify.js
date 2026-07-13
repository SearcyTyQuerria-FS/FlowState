const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

function spotifyBasicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// returns a usable spotify access token for this user
// refreshes it if it's expired / about to expire
async function getValidSpotifyToken(user) {
  if (!user.spotifyAccessToken || !user.spotifyRefreshToken) {
    const err = new Error("Spotify not connected");
    err.status = 400;
    throw err;
  }

  const expiresAt = user.spotifyTokenExpiresAt
    ? new Date(user.spotifyTokenExpiresAt).getTime()
    : 0;

  // still valid for at least another minute
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

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Spotify refresh error:", tokenData);
    const err = new Error("Failed to refresh Spotify token");
    err.status = 500;
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
};
