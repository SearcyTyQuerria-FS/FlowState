const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    // spotify tokens get saved here after i connect in settings
    spotifyAccessToken: String,
    spotifyRefreshToken: String,
    spotifyTokenExpiresAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
