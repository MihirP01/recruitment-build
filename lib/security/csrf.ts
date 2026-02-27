import crypto from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf-token";

export function issueCsrfToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60
  });
  return token;
}

export function validateCsrfToken(headerToken?: string | null): boolean {
  if (!headerToken) {
    return false;
  }
  const cookieToken = cookies().get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    return false;
  }
  const headerBuffer = Buffer.from(headerToken);
  const cookieBuffer = Buffer.from(cookieToken);
  if (headerBuffer.length !== cookieBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(headerBuffer, cookieBuffer);
}
