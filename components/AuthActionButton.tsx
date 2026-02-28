"use client";

import Link from "next/link";
import { AnchorHTMLAttributes, MouseEvent as ReactMouseEvent } from "react";
import { AuthMode, useAuthUI } from "@/components/AuthUIProvider";

type AuthActionButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  mode: AuthMode;
  href?: string;
};

function fallbackHref(mode: AuthMode) {
  return mode === "signin" ? "/?auth=signin#hero" : "/?auth=signup#hero";
}

export default function AuthActionButton({ mode, onClick, href, ...props }: AuthActionButtonProps) {
  const { isOpen, mode: activeMode, openSignin, openSignup } = useAuthUI();
  const isExpanded = isOpen && activeMode === mode;

  return (
    <Link
      {...props}
      href={href ?? fallbackHref(mode)}
      role="button"
      aria-expanded={isExpanded}
      aria-controls="inline-auth-panel"
      onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          onClick?.(event);
          return;
        }

        event.preventDefault();
        if (mode === "signin") {
          openSignin();
        } else {
          openSignup();
        }
        onClick?.(event);
      }}
    />
  );
}
