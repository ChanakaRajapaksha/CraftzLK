const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey() {
  const secret =
    process.env.EMAIL_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "EMAIL_ENCRYPTION_KEY (or JWT_SECRET) is required to encrypt stored email passwords."
    );
  }

  return crypto.createHash("sha256").update(String(secret)).digest();
}

function encrypt(plainText) {
  if (plainText === undefined || plainText === null || plainText === "") {
    return "";
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(String(plainText), "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  if (!encryptedText) return "";

  const parts = String(encryptedText).split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format.");
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
