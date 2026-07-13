const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// spotify needs basic auth for token requests
function spotifyBasicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// route that sends user to google login page
router.get("/google", (_req, res) => {
  // grabbing the params google needs for the auth url
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
  });

  // build the url then send the browser to google
  res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
});

// google sends the user back here after they log in
router.get("/google/callback", async (req, res) => {
  console.log(">>> Google callback hit");
  const { code } = req.query;

  // no code means something went wrong or user cancelled
  if (!code) {
    return res.status(400).json({ error: "No authorization code from Google" });
  }

  // trade the code for an access token
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Google token error:", tokenData);
    return res.status(500).json({ error: "Failed to get token from Google" });
  }

  const { access_token: accessToken } = tokenData;

  // use the access token to get user info (email, name, etc)
  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const googleUser = await userResponse.json();

  if (!userResponse.ok) {
    console.error("Google userinfo error:", googleUser);
    return res.status(500).json({ error: "Failed to get user info from Google" });
  }

  const { id: googleId, email, name } = googleUser;

  // save user if new, update if they already logged in before
  const user = await User.findOneAndUpdate(
    { googleId },
    { googleId, email, name },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(">>> Logged in:", user.email);

  // jwt uses db id so protected routes can load the user later
  const appToken = jwt.sign(
    { userId: user._id, googleId: user.googleId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // http-only cookie keeps the token out of frontend js
  res.cookie("token", appToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: SEVEN_DAYS_MS,
  });

  // send them back to the react app
  res.redirect(process.env.CLIENT_URL);
});

// must already be logged in with google before connecting spotify
router.get("/spotify", authMiddleware, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    // enough for search + now playing later
    scope: [
      "user-read-email",
      "user-read-private",
      "user-read-currently-playing",
      "user-read-playback-state",
    ].join(" "),
    // state = our user id so we know who this callback belongs to
    state: String(req.user._id),
    show_dialog: "true",
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params}`);
});

// spotify sends them back here after they approve the app
router.get("/spotify/callback", authMiddleware, async (req, res) => {
  console.log(">>> Spotify callback hit");
  const { code, state, error } = req.query;

  if (error) {
    console.error("Spotify auth error:", error);
    return res.status(400).json({ error: "Spotify login was cancelled or failed" });
  }

  if (!code) {
    return res.status(400).json({ error: "No authorization code from Spotify" });
  }

  // make sure the state matches the logged in user
  if (!state || state !== String(req.user._id)) {
    return res.status(400).json({ error: "Invalid Spotify state" });
  }

  // trade code for access + refresh tokens
  const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: spotifyBasicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Spotify token error:", tokenData);
    return res.status(500).json({ error: "Failed to get token from Spotify" });
  }

  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  } = tokenData;

  // save tokens on the user in mongo
  req.user.spotifyAccessToken = accessToken;
  if (refreshToken) {
    req.user.spotifyRefreshToken = refreshToken;
  }
  req.user.spotifyTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  await req.user.save();

  console.log(">>> Spotify connected for:", req.user.email);

  // back to the app (settings page later, home for now)
  res.redirect(`${process.env.CLIENT_URL}/settings`);
});

module.exports = router;
