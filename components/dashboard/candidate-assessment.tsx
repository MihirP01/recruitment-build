"use client";

import { FormEvent, useEffect, useState } from "react";
import AssessmentEnvironmentRestrictionPanel from "@/components/assessments/AssessmentEnvironmentRestrictionPanel";
import { useAssessmentEnvironment } from "@/lib/hooks/useAssessmentEnvironment";

type Question = {
  id: string;
  questionText: string;
  options: string[];
  orderIndex: number;
};

type ActiveAssessment = {
  candidateAssessmentId: string;
  assessment: {
    id: string;
    title: string;
    questions: Question[];
  };
  completedAt: string | null;
};

export function CandidateAssessmentWidget({ initialScore }: { initialScore?: number }) {
  const [csrfToken, setCsrfToken] = useState("");
  const [activeAssessment, setActiveAssessment] = useState<ActiveAssessment | null>(null);
  const [score, setScore] = useState<number | null>(initialScore ?? null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const environment = useAssessmentEnvironment();

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.token))
      .catch(() => setError("Could not initialize secure session token."));
  }, []);

  async function startAssessment() {
    if (!environment.payload || !environment.valid) {
      setError("Assessment runtime is restricted on this environment.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/assessments/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ environment: environment.payload })
    });
    const body = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "Unable to start assessment");
      return;
    }

    setActiveAssessment(body);
  }

  async function submitAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeAssessment) return;

    const formData = new FormData(event.currentTarget);
    const answers = activeAssessment.assessment.questions.map((question) => ({
      questionId: question.id,
      selectedAnswer: String(formData.get(question.id) ?? "")
    }));

    const response = await fetch("/api/assessments/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        ...(environment.payload ? { "X-Assessment-Fingerprint": environment.payload.fingerprint } : {})
      },
      body: JSON.stringify({
        candidateAssessmentId: activeAssessment.candidateAssessmentId,
        answers
      })
    });

    const body = await response.json();

    if (!response.ok) {
      setError(body.error ?? "Submission failed");
      return;
    }

    setScore(body.score);
    setActiveAssessment(null);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-semibold">Assessment</h2>
        <p className="text-sm text-slate-600">Single attempt. Scoring is computed server-side.</p>

        {environment.ready && !environment.valid ? (
          <div className="mt-4">
            <AssessmentEnvironmentRestrictionPanel
              title="Assessment Runtime Restricted"
              reasons={environment.reasons}
              checks={environment.checks}
            />
          </div>
        ) : null}

        {score !== null ? <p className="mt-2 text-sm font-semibold text-emerald-700">Latest Score: {score}</p> : null}

        {!activeAssessment ? (
          <button
            type="button"
            onClick={startAssessment}
            disabled={loading || !environment.ready || !environment.valid}
            className="mt-4 bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60"
          >
            {loading ? "Starting..." : "Start Assessment"}
          </button>
        ) : null}
      </div>

      {activeAssessment ? (
        <form onSubmit={submitAssessment} className="space-y-4 rounded-xl border border-slate-200 p-4">
          <h3 className="text-base font-semibold">{activeAssessment.assessment.title}</h3>
          {activeAssessment.assessment.questions.map((question, idx) => (
            <div key={question.id} className="space-y-2 rounded-md border border-slate-200 p-3">
              <p className="text-sm font-medium">{idx + 1}. {question.questionText}</p>
              {question.options.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={question.id} value={option} required />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button type="submit" className="bg-brand-700 text-white hover:bg-brand-900" disabled={!csrfToken}>Submit Assessment</button>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
