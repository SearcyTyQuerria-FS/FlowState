const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// rote that sends user to google login
router.get("/google", (req, res) => {
  // grabbing params for urL
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_Client_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile",
  });
  // building login url then redirecting browser there
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth${params.toString()}`;

  res.redirect(googleAuthUrl);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "No authorization code from Google" });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_Client_ID,
      client_secret: process.env.GOOGLE_Client_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error("Google token error:", tokenData);
    return res.status(500).json({ error: "Failed to get token from Google" });
  }
  const userResponse = await fetch(
    "https://www.goggleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );
  const googleUser = await userResponse.json();
  console.log("Logged in:", googleUser.email);
});
