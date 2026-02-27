import crypto from "crypto";

function getPiiEncryptionKey(): Buffer {
  const key = process.env.PII_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("PII_ENCRYPTION_KEY is required and must be a 64-character hex string.");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error("PII_ENCRYPTION_KEY format invalid. Expected 64-character hex (32 bytes).");
  }
  return Buffer.from(key, "hex");
}

export function encryptPii(plaintext: string): string {
  const key = getPiiEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}
