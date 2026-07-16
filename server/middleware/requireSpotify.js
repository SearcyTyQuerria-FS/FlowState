// blocks music routes until i connect spotify
const requireSpotify = (req, res, next) => {
  const connected = Boolean(req.user?.spotifyRefreshToken);

  if (!connected) {
    return res.status(403).json({
      error: "Spotify not connected",
      needsSpotifyAuth: true,
      loggedIn: true,
      spotifyConnected: false,
    });
  }

  next();
};

module.exports = requireSpotify;
