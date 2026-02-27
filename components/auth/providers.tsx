"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

type AuthProviderProps = PropsWithChildren<{
  session?: Session | null;
}>;

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  );
}
