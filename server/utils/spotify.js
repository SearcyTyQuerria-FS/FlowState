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

// tracks refreshes in progress per user. if two requests both hit an
// expired token at the same time (today.jsx fires a couple api calls at
// once), this stops them from both hitting spotify's refresh endpoint and
// racing to save() last
const refreshesInFlight = new Map();

// actual network call + save, split out so getValidSpotifyToken can dedupe it
async function refreshSpotifyToken(user) {
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

  // fall back to spotify's normal 1hr if expires_in ever comes back weird,
  // instead of saving an invalid date
  const expiresInSeconds = Number.isFinite(tokenData.expires_in)
    ? tokenData.expires_in
    : 3600;

  user.spotifyAccessToken = tokenData.access_token;
  // spotify only sends a new refresh token sometimes
  if (tokenData.refresh_token) {
    user.spotifyRefreshToken = tokenData.refresh_token;
  }
  user.spotifyTokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);
  await user.save();

  return user.spotifyAccessToken;
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
  if (Number.isFinite(expiresAt) && expiresAt > Date.now() + 60 * 1000) {
    return user.spotifyAccessToken;
  }

  const userId = String(user._id);

  // someone's already refreshing this user, just wait on that instead of
  // hitting spotify twice
  if (refreshesInFlight.has(userId)) {
    return refreshesInFlight.get(userId);
  }

  const refreshPromise = refreshSpotifyToken(user).finally(() => {
    refreshesInFlight.delete(userId);
  });

  refreshesInFlight.set(userId, refreshPromise);

  return refreshPromise;
}

module.exports = {
  getValidSpotifyToken,
  readSpotifyBody,
};
