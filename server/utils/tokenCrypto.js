const crypto = require("crypto");

// aes-256-gcm — same key encrypts + decrypts, and it catches tampering too
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended iv size for gcm

// pulls the key from env, throws if its missing/wrong size instead of
// quietly saving broken tokens
function getKey() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not set in .env — cannot encrypt/decrypt Spotify tokens",
    );
  }

  const key = Buffer.from(secret, "hex");

  if (key.length !== 32) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    );
  }

  return key;
}

// turns a token into "iv:authTag:ciphertext" so it still fits in a normal
// mongo string. random iv every time so the same token never looks the same twice
function encryptToken(value) {
  if (!value) return value; // nothing to encrypt

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    ciphertext.toString("hex"),
  ].join(":");
}

// undoes encryptToken
function decryptToken(value) {
  if (!value) return value;

  // tokens saved before encryption was added are still plain strings, so
  // just hand those back as-is instead of crashing
  const parts = value.split(":");
  if (parts.length !== 3) return value;

  const [ivHex, authTagHex, ciphertextHex] = parts;

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, "hex")),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  } catch (err) {
    // wrong key or corrupted data, dont hand back garbage
    console.error("Failed to decrypt stored token:", err.message);
    return null;
  }
}

module.exports = { encryptToken, decryptToken };
