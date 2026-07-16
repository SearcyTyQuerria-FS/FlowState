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

// spotify wants client id + secret base64 encoded
function spotifyBasicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

// i stuck with google for app login since i already built this flow, spotify is just for music data
router.get("/google", (_req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account", // lets me pick which google account
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
});

// clears the jwt cookie when i want to switch accounts
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.json({ ok: true });
});

// google sends me back here with a code, i trade it for user info then save to mongo
router.get("/google/callback", async (req, res) => {
  console.log(">>> Google callback hit");
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No authorization code from Google" });
  }

  // step 1: trade code for google access token
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

  // step 2: use that token to get my email / name
  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const googleUser = await userResponse.json();

  if (!userResponse.ok) {
    console.error("Google userinfo error:", googleUser);
    return res.status(500).json({ error: "Failed to get user info from Google" });
  }

  const { id: googleId, email, name } = googleUser;

  // step 3: save me in the db, or update if i logged in before
  const user = await User.findOneAndUpdate(
    { googleId },
    { googleId, email, name },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(">>> Logged in:", user.email);

  // step 4: jwt in a cookie = my app session, keeps secrets out of frontend js
  const appToken = jwt.sign(
    { userId: user._id, googleId: user.googleId, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", appToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: SEVEN_DAYS_MS,
  });

  // land in search after login instead of the login page again
  res.redirect(`${process.env.CLIENT_URL}/search`);
});

// separate spotify connect: only for music data, not app login
router.get("/spotify", authMiddleware, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    // scopes for search + now playing later
    scope: [
      "user-read-email",
      "user-read-private",
      "user-read-currently-playing",
      "user-read-playback-state",
    ].join(" "),
    // state = my user id so callback knows who to save tokens on
    state: String(req.user._id),
    show_dialog: "true",
  });

  res.redirect(`${SPOTIFY_AUTH_URL}?${params}`);
});

// spotify callback: look up user from state, cookie was breaking with localhost vs 127.0.0.1
router.get("/spotify/callback", async (req, res) => {
  console.log(">>> Spotify callback hit");
  const { code, state, error } = req.query;

  if (error) {
    console.error("Spotify auth error:", error);
    return res.status(400).json({ error: "Spotify login was cancelled or failed" });
  }

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state from Spotify" });
  }

  const user = await User.findById(state);
  if (!user) {
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

  // store tokens on my user so search can use them later
  user.spotifyAccessToken = accessToken;
  if (refreshToken) {
    user.spotifyRefreshToken = refreshToken;
  }
  user.spotifyTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  await user.save();

  console.log(">>> Spotify connected for:", user.email);

  res.redirect(`${process.env.CLIENT_URL}/settings`);
});

module.exports = router;
