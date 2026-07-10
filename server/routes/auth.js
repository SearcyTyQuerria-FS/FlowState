const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

module.exports = router;
