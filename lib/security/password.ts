import { IS_DEV } from "@/lib/env/isDev";
import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;
const DEV_SCRYPT_PREFIX = "dev-scrypt";
const scryptAsync = promisify(nodeScrypt);

type Argon2Module = typeof import("argon2");
let argon2ModulePromise: Promise<Argon2Module> | null = null;

async function loadArgon2(): Promise<Argon2Module> {
  if (!argon2ModulePromise) {
    argon2ModulePromise = import("argon2");
  }

  try {
    return await argon2ModulePromise;
  } catch (error) {
    // Do not crash unrelated routes in dev-suite mode if native binary is unavailable.
    if (IS_DEV) {
      throw new Error("Argon2 native runtime is unavailable in dev-suite mode.");
    }
    throw error;
  }
}

export function validatePasswordPolicy(password: string): boolean {
  return PASSWORD_POLICY.test(password);
}

async function hashPasswordDev(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${DEV_SCRYPT_PREFIX}$${salt}$${derived.toString("hex")}`;
}

async function verifyPasswordDev(hash: string, password: string): Promise<boolean> {
  const [prefix, salt, digest] = hash.split("$");
  if (!prefix || !salt || !digest || prefix !== DEV_SCRYPT_PREFIX) {
    return false;
  }

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const original = Buffer.from(digest, "hex");

  if (derived.length !== original.length) {
    return false;
  }

  return timingSafeEqual(derived, original);
}

export async function hashPassword(password: string): Promise<string> {
  if (IS_DEV) {
    return hashPasswordDev(password);
  }

  const argon2 = await loadArgon2();
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (hash.startsWith(`${DEV_SCRYPT_PREFIX}$`)) {
    return verifyPasswordDev(hash, password);
  }

  const argon2 = await loadArgon2();
  return argon2.verify(hash, password);
}
