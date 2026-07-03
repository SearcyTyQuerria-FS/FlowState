const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'FlowState API is running' });
});

// Confirms env vars loaded from .env without exposing secret values
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || 'development',
      mongoUri: Boolean(process.env.MONGO_URI),
      spotifyClientId: Boolean(process.env.SPOTIFY_CLIENT_ID),
      spotifyClientSecret: Boolean(process.env.SPOTIFY_CLIENT_SECRET),
      spotifyRedirectUri: Boolean(process.env.SPOTIFY_REDIRECT_URI),
      jwtSecret: Boolean(process.env.JWT_SECRET),
    },
  });
});

app.listen(PORT, () => {
  console.log(`FlowState API running on http://127.0.0.1:${PORT}`);
});
