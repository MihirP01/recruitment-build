import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session;
  }

  redirect("/");
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    redirect("/");
  }
  return session;
}
