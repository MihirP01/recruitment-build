import { AuditActionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { writeAuditLog } from "@/lib/services/audit";

const SESSION_COOKIE_NAMES = [
  "ctrl-auth.session-token",
  "__Secure-ctrl-auth.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "authjs.session-token",
  "__Secure-authjs.session-token"
];

const AUX_COOKIE_NAMES = [
  "ctrl-auth.callback-url",
  "__Secure-ctrl-auth.callback-url",
  "ctrl-auth.csrf-token",
  "__Host-ctrl-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Host-authjs.csrf-token"
];

function deleteCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: name.includes("session-token"),
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

async function clearSessionAndRedirect(request: Request) {
  const session = await getServerSession(authOptions);
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (session?.user) {
    await writeAuditLog({
      actorId: session.user.isDevSession ? undefined : session.user.id,
      actorRole: session.user.role,
      actionType: AuditActionType.LOGOUT,
      entityType: "User",
      entityId: session.user.isDevSession ? undefined : session.user.id,
      ipAddress,
      userAgent,
      metadata: session.user.isDevSession
        ? {
            devSession: true,
            email: session.user.email
          }
        : undefined
    }).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  for (const name of [...SESSION_COOKIE_NAMES, ...AUX_COOKIE_NAMES]) {
    deleteCookie(response, name);
  }

  return response;
}

export async function GET(request: Request) {
  return clearSessionAndRedirect(request);
}

export async function POST(request: Request) {
  return clearSessionAndRedirect(request);
}
