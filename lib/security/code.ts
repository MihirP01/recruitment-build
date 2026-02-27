import crypto from "crypto";

const CODE_LENGTH = 12;

export function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

export function hashAccessCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
