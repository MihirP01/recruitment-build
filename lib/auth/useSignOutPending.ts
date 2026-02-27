"use client";

import { useEffect, useState } from "react";
import { getSignOutInProgress, onSignOutStateChange } from "@/lib/auth/clientSignOut";

export function useSignOutPending() {
  const [pending, setPending] = useState<boolean>(() => getSignOutInProgress());

  useEffect(() => {
    const unsubscribe = onSignOutStateChange(setPending);
    return unsubscribe;
  }, []);

  return pending;
}
