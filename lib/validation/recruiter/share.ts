import { z } from "zod";

export const shareCandidateSchema = z.object({
  candidateId: z.string().uuid(),
  clientUserId: z.string().uuid(),
  recruiterNotes: z.string().max(5000).optional()
});
