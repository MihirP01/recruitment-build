"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type LoginFormProps = {
  isActive: boolean;
  onSuccess: () => void;
};

export default function LoginForm({ isActive, onSuccess }: LoginFormProps) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isActive) {
      try {
        emailRef.current?.focus({ preventScroll: true });
      } catch {
        emailRef.current?.focus();
      }
    }
  }, [isActive]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("signinEmail") ?? "");
    const password = String(formData.get("signinPassword") ?? "");
    const remember = formData.get("rememberMe") === "on";

    const result = await signIn("credentials", {
      email,
      password,
      remember,
      callbackUrl: "/portal",
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials, locked account, or role mismatch.");
      return;
    }

    onSuccess();
    router.push("/portal");
    router.refresh();
  }

  return (
    <form
      id="auth-tabpanel-signin"
      role="tabpanel"
      aria-labelledby="auth-tab-signin"
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="signinEmail" className="text-sm font-medium text-[#C3CDDA]">
          Email
        </label>
        <input
          ref={emailRef}
          id="signinEmail"
          name="signinEmail"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="name@organisation.gov.uk"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="signinPassword" className="text-sm font-medium text-[#C3CDDA]">
          Password
        </label>
        <input
          id="signinPassword"
          name="signinPassword"
          type="password"
          required
          minLength={12}
          autoComplete="current-password"
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="Enter your password"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-[#9CA3AF]">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border border-white/20 bg-[#0B1220] accent-[#5B7EA6]"
        />
        Remember me
      </label>
      {error ? <p className="text-sm text-[#FCA5A5]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-lg border border-[#5B7EA6]/60 bg-[#24364F] text-sm font-medium text-[#E5E7EB] transition-colors duration-200 hover:bg-[#2b3f5c] disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
