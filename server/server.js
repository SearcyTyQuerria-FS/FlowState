const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const spotifyRoutes = require("./routes/spotify");
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
app.use("/api", spotifyRoutes);

// health check so i know the api is up
app.get("/", (_req, res) => {
  res.json({ message: "Played & Felt API is running" });
});

// shows which env vars loaded without printing the actual secrets
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

// returns my account info, also shows if spotify is connected
app.get("/api/me", authMiddleware, (req, res) => {
  const spotifyConnected = Boolean(req.user.spotifyRefreshToken);

  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    googleId: req.user.googleId,
    // keep spotify tokens on the server only
    spotifyConnected,
    needsSpotifyAuth: !spotifyConnected,
  });
});

mongoose
  .connect(process.env.MONGO_URI, { dbName: "flowstateDB" })
  .then(() => console.log("MongoDB connected (flowstateDB)"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Played & Felt API running on http://127.0.0.1:${PORT}`);
});