const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/auth", authRoutes);

// quick check that the api is up
app.get("/", (_req, res) => {
  res.json({ message: "Played & Felt API is running" });
});

// checks env vars loaded without leaking secrets
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
      clientUrl: Boolean(process.env.CLIENT_URL),
      googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      googleRedirectUri: Boolean(process.env.GOOGLE_REDIRECT_URI),
      jwtSecret: Boolean(process.env.JWT_SECRET),
      mongoUri: Boolean(process.env.MONGO_URI),
      spotifyClientId: Boolean(process.env.SPOTIFY_CLIENT_ID),
      spotifyClientSecret: Boolean(process.env.SPOTIFY_CLIENT_SECRET),
      spotifyRedirectUri: Boolean(process.env.SPOTIFY_REDIRECT_URI),
    },
  });
});

// returns logged-in user info  proves auth + db persistence
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    googleId: req.user.googleId,
    // dont send actual tokens to the frontend
    spotifyConnected: Boolean(req.user.spotifyRefreshToken),
  });
});

mongoose
  .connect(process.env.MONGO_URI, { dbName: "flowstateDB" })
  .then(() => console.log("MongoDB connected (flowstateDB)"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Played & Felt API running on http://127.0.0.1:${PORT}`);
});