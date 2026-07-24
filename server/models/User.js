const mongoose = require("mongoose");
const { encryptToken, decryptToken } = require("../utils/tokenCrypto");

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
    // spotify tokens get saved here after i connect in settings.
    // set/get run automatically on assign/read, so the rest of the app just
    // uses plain tokens like normal, but mongo only ever sees it encrypted
    spotifyAccessToken: {
      type: String,
      set: encryptToken,
      get: decryptToken,
    },
    spotifyRefreshToken: {
      type: String,
      set: encryptToken,
      get: decryptToken,
    },
    spotifyTokenExpiresAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
