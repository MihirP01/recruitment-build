import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { IS_DEV } from "@/lib/env/isDev";
import { type AuthRole } from "@/lib/auth/role";
import { resolveAuthSecret } from "@/lib/auth/secret";
import { loginSchema } from "@/lib/validation/auth";

type LockInfo = {
  failedCount: number;
  lockedUntil: Date;
};

type AuthUserRecord = {
  id: string;
  email: string;
  role: AuthRole;
  passwordHash: string;
  deletedAt: Date | null;
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 30;
const AUTH_SECRET = resolveAuthSecret();
const SESSION_MAX_AGE_SECONDS = process.env.NODE_ENV === "development" ? 8 * 60 * 60 : 15 * 60;

function ensureAuthOrigins() {
  if (process.env.NEXTAUTH_URL && process.env.APP_ORIGIN) {
    return;
  }

  const configuredOrigin =
    process.env.APP_ORIGIN ??
    process.env.NEXTAUTH_URL ??
    (process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT ?? "3000"}`
      : undefined);

  if (!configuredOrigin) {
    return;
  }

  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = configuredOrigin;
  }

  if (!process.env.APP_ORIGIN) {
    process.env.APP_ORIGIN = configuredOrigin;
  }
}

ensureAuthOrigins();

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = AUTH_SECRET;
}

async function getPrisma() {
  const { prisma } = await import("@/lib/db/prisma");
  return prisma;
}

async function getAuditService() {
  return import("@/lib/services/audit");
}

async function getPrismaEnums() {
  const { AuditActionType } = await import("@prisma/client");
  return { AuditActionType };
}

async function getPasswordService() {
  return import("@/lib/security/password");
}

async function getDevDataStore() {
  return import("@/lib/dev/csvStore");
}

async function isUserLocked(userId: string): Promise<boolean> {
  const prisma = await getPrisma();
  const lock = await prisma.accountLock.findUnique({ where: { userId } });
  return !!lock && lock.lockedUntil > new Date();
}

async function recordLoginFailure(
  user: Pick<AuthUserRecord, "id" | "role"> | null,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const prisma = await getPrisma();
  const { writeAuditLog } = await getAuditService();
  const { AuditActionType } = await getPrismaEnums();

  if (user) {
    const existingLock: LockInfo | null = await prisma.accountLock.findUnique({
      where: { userId: user.id },
      select: { failedCount: true, lockedUntil: true }
    });

    const nextFailedCount = (existingLock?.failedCount ?? 0) + 1;
    const shouldLock = nextFailedCount >= MAX_FAILED_ATTEMPTS;

    await prisma.accountLock.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        failedCount: nextFailedCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : new Date()
      },
      update: {
        failedCount: nextFailedCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : existingLock?.lockedUntil ?? new Date()
      }
    });
  }

  await prisma.loginAttempt.create({
    data: {
      email,
      userId: user?.id,
      success: false,
      ipAddress,
      userAgent
    }
  });

  await writeAuditLog({
    actorId: user?.id,
    actorRole: user?.role,
    actionType: AuditActionType.LOGIN_FAILED,
    entityType: "User",
    entityId: user?.id,
    ipAddress,
    userAgent,
    metadata: { email }
  });
}

async function recordLoginSuccess(user: AuthUserRecord, ipAddress?: string, userAgent?: string): Promise<void> {
  const prisma = await getPrisma();
  const { writeAuditLog } = await getAuditService();
  const { AuditActionType } = await getPrismaEnums();

  await prisma.accountLock.deleteMany({ where: { userId: user.id } });

  await prisma.loginAttempt.create({
    data: {
      email: user.email,
      userId: user.id,
      success: true,
      ipAddress,
      userAgent
    }
  });

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    actionType: AuditActionType.LOGIN_SUCCESS,
    entityType: "User",
    entityId: user.id,
    ipAddress,
    userAgent
  });
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 5 * 60
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS
  },
  pages: {
    signIn: "/"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password, role } = parsed.data;

        if (IS_DEV) {
          const { authenticateDevCredentials } = await getDevDataStore();
          const devUser = await authenticateDevCredentials({
            email,
            password,
            role: role as Role | undefined
          });
          if (devUser) {
            return {
              id: devUser.id,
              email: devUser.email,
              role: devUser.role,
              isDevSession: true
            };
          }

          // In CTRL dev-suite mode we do not fall back to database auth.
          return null;
        }

        const prisma = await getPrisma();
        const { verifyPassword } = await getPasswordService();
        const user = (await prisma.user.findUnique({ where: { email } })) as AuthUserRecord | null;
        const ipAddress = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
        const userAgent = (req?.headers?.["user-agent"] as string) ?? "unknown";

        if (!user || user.deletedAt) {
          await recordLoginFailure(null, email, ipAddress, userAgent);
          return null;
        }

        if (role && user.role !== role) {
          await recordLoginFailure(user, email, ipAddress, userAgent);
          return null;
        }

        if (await isUserLocked(user.id)) {
          await recordLoginFailure(user, email, ipAddress, userAgent);
          return null;
        }

        const isValid = await verifyPassword(user.passwordHash, password);
        if (!isValid) {
          await recordLoginFailure(user, email, ipAddress, userAgent);
          return null;
        }

        await recordLoginSuccess(user, ipAddress, userAgent);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isDevSession: false
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isDevSession = Boolean((user as { isDevSession?: boolean }).isDevSession);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isDevSession = Boolean(token.isDevSession);
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-ctrl-auth.session-token"
          : "ctrl-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-ctrl-auth.callback-url"
          : "ctrl-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-ctrl-auth.csrf-token"
          : "ctrl-auth.csrf-token",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
};
