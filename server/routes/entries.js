const express = require("express");
const authMiddleware = require("../middleware/auth");
const JournalEntry = require("../models/JournalEntry");
const { MOODS } = JournalEntry;

const router = express.Router();

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// keep the response shape clean for the frontend cards
function shapeEntry(entry) {
  return {
    id: entry._id,
    mood: entry.mood,
    note: entry.note,
    tags: entry.tags,
    track: entry.track?.name
      ? {
          spotifyId: entry.track.spotifyId || null,
          name: entry.track.name,
          artist: entry.track.artist || "",
          url: entry.track.url || null,
          image: entry.track.image || null,
        }
      : null,
    createdAt: entry.createdAt,
  };
}

// save a mood journal entry for whoever is logged in
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { mood, note = "", tags = [], track = null } = req.body;

    if (!mood || !MOODS.includes(mood)) {
      return res.status(400).json({
        error: `mood is required and must be one of: ${MOODS.join(", ")}`,
      });
    }

    const cleanTags = Array.isArray(tags)
      ? tags
          .filter((t) => typeof t === "string" && t.trim())
          .map((t) => t.trim())
      : [];

    // song is optional — only attach it if search sent a name
    let cleanTrack;
    if (track && typeof track === "object" && track.name) {
      cleanTrack = {
        spotifyId: track.spotifyId || track.id || "",
        name: String(track.name).trim(),
        artist: track.artist ? String(track.artist).trim() : "",
        url: track.url || "",
        image: track.image || "",
      };
    }

    const entry = await JournalEntry.create({
      userId: req.user._id,
      mood,
      note: typeof note === "string" ? note.trim() : "",
      tags: cleanTags,
      track: cleanTrack,
    });

    res.status(201).json(shapeEntry(entry));
  } catch (err) {
    console.error("Create entry error:", err.message);
    res.status(500).json({ error: "Could not save entry" });
  }
});

// just today's entries, newest first — for the Today page list
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const entries = await JournalEntry.find({
      userId: req.user._id,
      createdAt: { $gte: startOfToday(), $lte: endOfToday() },
    }).sort({ createdAt: -1 });

    res.json({
      count: entries.length,
      entries: entries.map(shapeEntry),
    });
  } catch (err) {
    console.error("Today entries error:", err.message);
    res.status(500).json({ error: "Could not load today's entries" });
  }
});

// all entries newest first — timeline can use this later
router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      count: entries.length,
      entries: entries.map(shapeEntry),
    });
  } catch (err) {
    console.error("List entries error:", err.message);
    res.status(500).json({ error: "Could not load entries" });
  }
});

// only delete my own entry — used by the Today card delete button
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ ok: true, id: entry._id });
  } catch (err) {
    console.error("Delete entry error:", err.message);
    res.status(500).json({ error: "Could not delete entry" });
  }
});

module.exports = router;
