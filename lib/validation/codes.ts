import { z } from "zod";

export const generateCodeSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30),
  assessmentId: z.string().uuid()
});

export const validateCodeSchema = z.object({
  code: z.string().min(12).max(32)
});
