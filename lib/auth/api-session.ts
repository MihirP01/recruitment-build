import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export type CandidateApiUser = {
  id: string;
  email: string;
  role: Role;
};

export async function getCandidateApiUser(): Promise<CandidateApiUser | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === Role.CANDIDATE) {
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    };
  }
  return null;
}
