"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AuthMode } from "@/components/AuthUIProvider";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

type AuthFormProps = {
  mode: AuthMode;
  isActive: boolean;
  onSuccess: () => void;
};

export default function AuthForm({ mode, isActive, onSuccess }: AuthFormProps) {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    try {
      emailRef.current?.focus({ preventScroll: true });
    } catch {
      emailRef.current?.focus();
    }
  }, [isActive, mode]);

  useEffect(() => {
    if (mode !== "signup" || csrfToken) {
      return;
    }

    fetch("/api/csrf")
      .then((res) => {
        if (!res.ok) {
          throw new Error("token");
        }
        return res.json();
      })
      .then((data: { token: string }) => setCsrfToken(data.token))
      .catch(() => setError("Unable to initialize secure registration token."));
  }, [csrfToken, mode]);

  async function handleSignIn(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const remember = formData.get("rememberMe") === "on";

    const result = await signIn("credentials", {
      email,
      password,
      remember,
      callbackUrl: "/portal",
      redirect: false
    });

    if (result?.error) {
      setError("Invalid credentials, locked account, or role mismatch.");
      return;
    }

    onSuccess();
    router.push("/portal");
    router.refresh();
  }

  async function handleSignUp(formData: FormData) {
    const cvFile = formData.get("cvFile");

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      setError("CV file is required.");
      return;
    }

    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      setError("CV file must be 5MB or less.");
      return;
    }

    if (!ALLOWED_CV_MIME_TYPES.has(cvFile.type)) {
      setError("Allowed file formats are PDF, DOC, and DOCX.");
      return;
    }

    let activeCsrfToken = csrfToken;
    if (!activeCsrfToken) {
      const tokenResponse = await fetch("/api/csrf");
      if (!tokenResponse.ok) {
        setError("Unable to initialize secure registration token.");
        return;
      }
      const tokenPayload = (await tokenResponse.json()) as { token: string };
      activeCsrfToken = tokenPayload.token;
      setCsrfToken(tokenPayload.token);
    }

    const payload = {
      code: String(formData.get("accessCode") ?? "").toUpperCase(),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("fullName") ?? "")
    };

    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": activeCsrfToken
      },
      body: JSON.stringify(payload)
    });

    if (!registerResponse.ok) {
      const body = (await registerResponse.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Registration failed.");
      return;
    }

    const loginResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      role: "CANDIDATE",
      callbackUrl: "/portal",
      redirect: false
    });

    if (loginResult?.error) {
      setError("Registration succeeded, but automatic sign-in failed.");
      return;
    }

    const csrfResponse = await fetch("/api/csrf");
    if (!csrfResponse.ok) {
      setError("Registration succeeded, but CV upload token initialization failed.");
      return;
    }

    const { token: uploadCsrfToken } = (await csrfResponse.json()) as { token: string };
    const uploadFormData = new FormData();
    uploadFormData.append("cvFile", cvFile);

    const uploadResponse = await fetch("/api/upload/cv", {
      method: "POST",
      headers: {
        "X-CSRF-Token": uploadCsrfToken
      },
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      const body = (await uploadResponse.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Registration completed, but CV upload failed.");
      return;
    }

    setSuccess("Registration complete. Redirecting to candidate portal...");
    onSuccess();
    router.push("/portal");
    router.refresh();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (mode === "signin") {
        await handleSignIn(formData);
      } else {
        await handleSignUp(formData);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      id="auth-tabpanel"
      role="tabpanel"
      aria-labelledby={mode === "signin" ? "auth-tab-signin" : "auth-tab-signup"}
      onSubmit={onSubmit}
      layout
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 rounded-lg border border-[var(--color-border)] bg-white/5 p-5"
    >
      <motion.div layout className="space-y-1.5">
        <label htmlFor="authEmail" className="text-sm font-medium text-[var(--color-text-secondary)]">
          Email
        </label>
        <input
          ref={emailRef}
          id="authEmail"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)]"
          placeholder="name@organisation.gov.uk"
        />
      </motion.div>

      <motion.div layout className="space-y-1.5">
        <label htmlFor="authPassword" className="text-sm font-medium text-[var(--color-text-secondary)]">
          Password
        </label>
        <input
          id="authPassword"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)]"
          placeholder={mode === "signin" ? "Enter your password" : "Minimum 12 characters"}
        />
      </motion.div>

      <AnimatePresence initial={false}>
        {mode === "signup" ? (
          <motion.div
            key="signup-only-fields"
            initial={shouldReduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)]"
                placeholder="Candidate full name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="accessCode" className="text-sm font-medium text-[var(--color-text-secondary)]">
                Recruiter Access Code
              </label>
              <input
                id="accessCode"
                name="accessCode"
                required
                minLength={12}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] uppercase text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)]"
                placeholder="Enter issued code"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cvFile" className="text-sm font-medium text-[var(--color-text-secondary)]">
                CV Upload
              </label>
              <input
                id="cvFile"
                name="cvFile"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] text-sm text-[var(--color-text-primary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-accent-surface)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text-primary)] hover:file:bg-[var(--color-accent-surface-hover)]"
              />
            </div>
            <p className="text-xs text-[var(--color-text-subtle)]">Accepted CV formats: PDF, DOC, DOCX. Max size: 5MB.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.label layout className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border border-[var(--color-border-strong)] bg-[var(--color-surface-1)] accent-[var(--color-accent)]"
        />
        Remember me
      </motion.label>

      {error ? <p className="text-sm text-[#FCA5A5]">{error}</p> : null}
      {success ? <p className="text-sm text-[#86EFAC]">{success}</p> : null}
      <motion.button
        layout
        type="submit"
        disabled={loading || (mode === "signup" && !csrfToken)}
        className="h-11 w-full rounded-lg border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent-surface)] text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-accent-surface-hover)] disabled:opacity-60"
      >
        {loading ? (mode === "signin" ? "Signing in..." : "Submitting...") : mode === "signin" ? "Sign In" : "Sign Up"}
      </motion.button>
    </motion.form>
  );
}
