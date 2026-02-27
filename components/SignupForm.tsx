"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

type SignupFormProps = {
  isActive: boolean;
  onSuccess: () => void;
};

export default function SignupForm({ isActive, onSuccess }: SignupFormProps) {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data: { token: string }) => setCsrfToken(data.token))
      .catch(() => setError("Unable to initialize secure registration token."));
  }, []);

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
    setSuccess("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const cvFile = formData.get("cvFile");

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      setLoading(false);
      setError("CV file is required.");
      return;
    }

    if (cvFile.size > MAX_CV_SIZE_BYTES) {
      setLoading(false);
      setError("CV file must be 5MB or less.");
      return;
    }

    if (!ALLOWED_CV_MIME_TYPES.has(cvFile.type)) {
      setLoading(false);
      setError("Allowed file formats are PDF, DOC, and DOCX.");
      return;
    }

    const payload = {
      code: String(formData.get("accessCode") ?? "").toUpperCase(),
      email: String(formData.get("signupEmail") ?? ""),
      password: String(formData.get("signupPassword") ?? ""),
      fullName: String(formData.get("fullName") ?? "")
    };

    const registerResponse = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify(payload)
    });

    if (!registerResponse.ok) {
      const body = (await registerResponse.json()) as { error?: string };
      setLoading(false);
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
      setLoading(false);
      setError("Registration succeeded, but automatic sign-in failed.");
      return;
    }

    const csrfResponse = await fetch("/api/csrf");
    if (!csrfResponse.ok) {
      setLoading(false);
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

    setLoading(false);

    if (!uploadResponse.ok) {
      const body = (await uploadResponse.json()) as { error?: string };
      setError(body.error ?? "Registration completed, but CV upload failed.");
      return;
    }

    setSuccess("Registration complete. Redirecting to candidate portal...");
    onSuccess();
    router.push("/portal");
    router.refresh();
  }

  return (
    <form
      id="auth-tabpanel-signup"
      role="tabpanel"
      aria-labelledby="auth-tab-signup"
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="signupEmail" className="text-sm font-medium text-[#C3CDDA]">
          Email
        </label>
        <input
          ref={emailRef}
          id="signupEmail"
          name="signupEmail"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="name@organisation.gov.uk"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="signupPassword" className="text-sm font-medium text-[#C3CDDA]">
          Password
        </label>
        <input
          id="signupPassword"
          name="signupPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="Minimum 12 characters"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-[#C3CDDA]">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          required
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="Candidate full name"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="accessCode" className="text-sm font-medium text-[#C3CDDA]">
          Recruiter Access Code
        </label>
        <input
          id="accessCode"
          name="accessCode"
          required
          minLength={12}
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] uppercase text-[#E5E7EB] placeholder:text-[#6C7E95]"
          placeholder="Enter issued code"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cvFile" className="text-sm font-medium text-[#C3CDDA]">
          CV Upload
        </label>
        <input
          id="cvFile"
          name="cvFile"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="w-full rounded-lg border border-white/10 bg-[#0B1220] text-sm text-[#E5E7EB] file:mr-3 file:rounded-md file:border-0 file:bg-[#24364F] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#E5E7EB] hover:file:bg-[#2b3f5c]"
        />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-[#9CA3AF]">
        <input
          id="signupRememberMe"
          name="signupRememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border border-white/20 bg-[#0B1220] accent-[#5B7EA6]"
        />
        Remember me
      </label>
      <p className="text-xs text-[#7E8FA5]">Accepted CV formats: PDF, DOC, DOCX. Max size: 5MB.</p>
      {error ? <p className="text-sm text-[#FCA5A5]">{error}</p> : null}
      {success ? <p className="text-sm text-[#86EFAC]">{success}</p> : null}
      <button
        type="submit"
        disabled={loading || !csrfToken}
        className="h-11 w-full rounded-lg border border-[#5B7EA6]/60 bg-[#24364F] text-sm font-medium text-[#E5E7EB] transition-colors duration-200 hover:bg-[#2b3f5c] disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Sign Up"}
      </button>
    </form>
  );
}
