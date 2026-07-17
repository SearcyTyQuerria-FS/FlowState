const mongoose = require("mongoose");

const MOODS = ["Rage", "Focused", "Sad", "Faith", "Hype", "Chill"];

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: MOODS,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    // optional song from search (now playing can fill this later)
    track: {
      spotifyId: String,
      name: String,
      artist: String,
      url: String,
      image: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
module.exports.MOODS = MOODS;
