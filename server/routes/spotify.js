const express = require("express");
const authMiddleware = require("../middleware/auth");
const requireSpotify = require("../middleware/requireSpotify");
const { getValidSpotifyToken, readSpotifyBody } = require("../utils/spotify");

const router = express.Router();

// so the frontend can check if i need to log in or connect spotify
router.get("/status", authMiddleware, (req, res) => {
  const spotifyConnected = Boolean(req.user.spotifyRefreshToken);
  const tokenExpired = req.user.spotifyTokenExpiresAt
    ? new Date(req.user.spotifyTokenExpiresAt).getTime() <= Date.now()
    : true;

  res.json({
    loggedIn: true,
    spotifyConnected,
    needsSpotifyAuth: !spotifyConnected,
    spotifyTokenExpired: spotifyConnected ? tokenExpired : null,
  });
});

// custom search route: calls spotify and refreshes my token if it expired
router.get("/search", authMiddleware, requireSpotify, async (req, res) => {
  const q = (req.query.q || "").trim();

  if (!q) {
    return res.json({
      query: "",
      results: [],
      message: "No Results",
    });
  }

  try {
    const accessToken = await getValidSpotifyToken(req.user);

    const params = new URLSearchParams({
      q,
      type: "artist,album,track",
      limit: "10",
    });

    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await readSpotifyBody(spotifyRes);

    if (!spotifyRes.ok) {
      console.error("Spotify search error:", data);
      return res.status(spotifyRes.status).json({
        error: "Spotify search failed",
        details: data,
        needsSpotifyAuth: spotifyRes.status === 401 || spotifyRes.status === 403,
      });
    }

    // same shape as my frontend cards so its easy to map
    const artists = (data.artists?.items || []).map((item) => ({
      id: item.id,
      type: "Artist",
      title: item.name,
      subtitle: "Artist",
      url: item.external_urls?.spotify,
      image: item.images?.[0]?.url || null,
    }));

    const albums = (data.albums?.items || []).map((item) => ({
      id: item.id,
      type: "Album",
      title: item.name,
      subtitle: `Album · ${(item.artists || []).map((a) => a.name).join(", ")}`,
      url: item.external_urls?.spotify,
      image: item.images?.[0]?.url || null,
    }));

    const tracks = (data.tracks?.items || []).map((item) => ({
      id: item.id,
      type: "Song",
      title: item.name,
      subtitle: `Song · ${(item.artists || []).map((a) => a.name).join(", ")}`,
      url: item.external_urls?.spotify,
      image: item.album?.images?.[0]?.url || null,
    }));

    const results = [...artists, ...albums, ...tracks];

    res.json({
      query: q,
      results,
      message: results.length === 0 ? "No Results" : undefined,
    });
  } catch (err) {
    console.error("Search route error:", err.message);

    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || "Search failed",
      needsSpotifyAuth: Boolean(err.needsSpotifyAuth),
    });
  }
});

module.exports = router;
