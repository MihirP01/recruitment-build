import { z } from "zod";

export const cvViewSchema = z.object({
  candidateId: z.string().uuid()
});
