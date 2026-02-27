import { Role } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(12).max(200),
  role: z.nativeEnum(Role).optional()
});

export const registerSchema = z.object({
  code: z.string().min(12).max(32),
  email: z.string().email().max(200),
  password: z.string().min(12).max(200),
  fullName: z.string().min(2).max(120)
});
