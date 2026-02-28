import Image from "next/image";
import AuthActionButton from "@/components/AuthActionButton";
import Reveal from "@/components/motion/Reveal";
import TestimonialCarousel, { TestimonialReview } from "@/components/home/TestimonialCarousel";
import FeatureCarousel, { FeatureSlide } from "@/components/home/FeatureCarousel";
import HeroQuoteRotator from "@/components/home/HeroQuoteRotator";
import HomeToneObserver from "@/components/home/HomeToneObserver";
import CinematicSection from "@/components/home/CinematicSection";
import ContinuityGridOverlay from "@/components/home/ContinuityGridOverlay";
import HeroSigninBlur from "@/components/home/HeroSigninBlur";
import HeroHashHandler from "@/components/HeroHashHandler";
import ReturnToTop from "@/components/ReturnToTop";
import VideoBackground from "@/components/hero/VideoBackground";
import { CTRL_EXPANSION } from "@/lib/brand";

type Panel = {
  id: "hero" | "about" | "features" | "security" | "intelligence" | "testimonials" | "contact";
  tone: "0" | "1" | "2" | "3";
  label: string;
  title: string;
  paragraph: string;
  bullets: string[];
  focus: "hero" | "about" | "features" | "security" | "intelligence" | "testimonials" | "contact";
  variant?: "standard" | "features" | "testimonials" | "contact";
};

const HERO_VIDEO_MP4 = "/hero/hero-optimized.mp4";
const HERO_VIDEO_WEBM = undefined;
const HERO_VIDEO_POSTER = "/hero/hero-poster.jpg";
const HERO_VIDEO_FALLBACK = "/hero/hero-fallback.jpg";

const HERO_QUOTES = [
  "Hiring the right candidate starts with the right intelligence.",
  "Operational recruitment should be evidence-led, reviewable, and defensible.",
  "The strongest hiring decisions come from structured signals, not assumption.",
  "Secure recruitment depends on disciplined inputs and accountable review.",
  "Reliable hiring outcomes come from governed process, not instinct alone.",
  "Every strong appointment begins with data that can withstand scrutiny.",
  "Assessment quality determines whether recruitment decisions remain defensible.",
  "The right candidate is identified through evidence, not speed.",
  "High-assurance hiring requires structure before it requires scale.",
  "Recruitment intelligence is only valuable when it is consistent and auditable.",
  "Better hiring decisions emerge when every stage produces reviewable evidence.",
  "Control over process is what turns recruitment into trusted selection.",
  "Candidate evaluation must be repeatable if it is to be credible.",
  "The strongest recruitment systems reduce ambiguity before decisions are made.",
  "Good hiring is not guesswork; it is disciplined operational judgment.",
  "A secure hiring process protects both decision quality and public trust.",
  "Institutional recruitment works best when evidence arrives in the right order.",
  "Confidence in hiring comes from traceability, not informal interpretation.",
  "The most dependable candidate decisions are built on structured assessment signals.",
  "Recruitment integrity is measured by how well every decision can be explained.",
  "The right intelligence turns candidate review into a controlled decision process."
];

const FEATURES: FeatureSlide[] = [
  {
    title: "Role-Isolated Portals",
    category: "Access Control",
    detail: "Candidate, recruiter, client, and admin views are separated with strict access boundaries.",
    screenshot: "/hero/frame-0.jpg",
    summary: ["Role-scoped routes", "Protected navigation", "Server enforcement"]
  },
  {
    title: "Access-Code Onboarding",
    category: "Onboarding Control",
    detail: "Candidate onboarding is gated through recruiter-issued codes with expiry and single-use controls.",
    screenshot: "/hero/frame-90.jpg",
    summary: ["Single-use issuance", "Expiry checks", "Recruiter ownership"]
  },
  {
    title: "Assessment Workflow",
    category: "Assessment Runtime",
    detail: "Structured question sets and server-side scoring provide consistent evaluation outcomes.",
    screenshot: "/hero/frame-150.jpg",
    summary: ["Managed question sets", "Server-side scoring", "Candidate progress state"]
  },
  {
    title: "Audit Visibility",
    category: "Governance",
    detail: "Critical actions are logged with actor context to support oversight and incident response.",
    screenshot: "/hero/frame-0.jpg",
    summary: ["Immutable records", "Actor attribution", "Review-ready evidence"]
  },
  {
    title: "Controlled Candidate Sharing",
    category: "Client Delivery",
    detail: "Recruiters can push reviewed candidates to approved clients with status traceability.",
    screenshot: "/hero/frame-90.jpg",
    summary: ["Approved handoff", "Shared status tracking", "Review gates"]
  },
  {
    title: "Secure CV Access",
    category: "Document Security",
    detail: "Candidate documents are shared through ownership-validated, short-lived signed retrieval.",
    screenshot: "/hero/frame-150.jpg",
    summary: ["Signed retrieval", "Ownership validation", "Private storage access"]
  }
];

const TESTIMONIALS: TestimonialReview[] = [
  {
    quote:
      "CTRL established one controlled operating model across screening, assessments, and final client handoff without process drift.",
    name: "Recruitment Operations Lead",
    title: "Operational Recruitment Lead",
    organisation: "Public Safety Directorate",
    rating: 5
  },
  {
    quote:
      "The platform gives our governance team immediate visibility of who accessed what, when, and under which operational role.",
    name: "Compliance Manager",
    title: "Compliance and Assurance",
    organisation: "Regional Service Command",
    rating: 5
  },
  {
    quote:
      "Assessment reporting arrives in a format our client stakeholders can action quickly while retaining full audit traceability.",
    name: "Client Delivery Manager",
    title: "Client Delivery Manager",
    organisation: "Government Workforce Partner",
    rating: 4.5
  }
];

const ABOUT_FLOW = [
  "Access codes are issued against a named workflow owner.",
  "Candidate onboarding remains controlled and traceable from first entry.",
  "Review and client handoff follow a fixed governance path."
];

const INTELLIGENCE_METRICS = [
  { label: "Completion Rate", value: "92%" },
  { label: "Reviewed", value: "18" },
  { label: "Avg. Score", value: "84" },
  { label: "Client Ready", value: "11" }
];

const PANELS: Panel[] = [
  {
    id: "hero",
    tone: "0",
    label: "Operational Recruitment Platform",
    title: "Control-grade hiring operations for secure institutions",
    paragraph:
      "CTRL provides a governed recruitment operating model with role isolation, audit traceability, and structured candidate progression for high-assurance environments.",
    bullets: [
      "Role-based operational boundaries across recruiter, candidate, client, and admin actors",
      "Evidence-oriented workflow progression with controlled state transitions",
      "Continuous audit visibility aligned to institutional oversight requirements"
    ],
    focus: "hero"
  },
  {
    id: "about",
    tone: "1",
    label: "About",
    title: "Designed for procedural integrity and operational continuity",
    paragraph:
      "From access code issuance to candidate submission and client sharing, each stage is structured for consistency, governance, and controlled accountability.",
    bullets: [
      "Code-gated onboarding and controlled candidate registration",
      "Deterministic workflow progression for recruiter teams",
      "Transparent handoff model between internal and client stakeholders"
    ],
    focus: "about"
  },
  {
    id: "features",
    tone: "2",
    label: "Features",
    title: "Operational capabilities built for controlled recruitment delivery",
    paragraph:
      "The platform provides modular controls for onboarding, evaluation, governance, and client delivery workflows in high-assurance environments.",
    bullets: [],
    focus: "features",
    variant: "features"
  },
  {
    id: "security",
    tone: "3",
    label: "Security",
    title: "Audit-first architecture with role isolation",
    paragraph:
      "Critical actions are attributable, access boundaries are explicit, and sensitive artifacts remain protected through controlled retrieval pathways.",
    bullets: [
      "Zero-trust authorization checks on protected actions",
      "Immutable activity records for oversight and response",
      "Short-lived, ownership-validated access to candidate documents"
    ],
    focus: "security"
  },
  {
    id: "intelligence",
    tone: "1",
    label: "Intelligence",
    title: "Assessment outcomes translated into decision-ready signals",
    paragraph:
      "Structured scoring and recruiter-reviewed outputs support consistent evaluations and client-facing reporting without informal interpretation drift.",
    bullets: [
      "Standardized assessment output collection",
      "Operational analytics for recruiter review workflows",
      "Client-ready summaries grounded in auditable assessment evidence"
    ],
    focus: "intelligence"
  },
  {
    id: "testimonials",
    tone: "2",
    label: "Testimonials",
    title: "Used by delivery teams that require control and accountability",
    paragraph:
      "Program teams and oversight stakeholders use CTRL to maintain process integrity while improving recruitment coordination speed.",
    bullets: [],
    focus: "testimonials",
    variant: "testimonials"
  },
  {
    id: "contact",
    tone: "3",
    label: "Contact Us",
    title: "Speak with the CTRL team",
    paragraph:
      "Discuss onboarding, secure deployment requirements, and procurement alignment for your organisation.",
    bullets: [],
    focus: "contact",
    variant: "contact"
  }
];

export default function HomePage() {
  return (
    <main id="public-home-main" className="relative">
      <ContinuityGridOverlay />
      <HomeToneObserver />
      <HeroHashHandler />
      {PANELS.map((panel) => (
        <CinematicSection key={panel.id} id={panel.id} tone={panel.tone} isHero={panel.id === "hero"}>
          {panel.id === "hero" ? (
            <>
              <VideoBackground
                srcMp4={HERO_VIDEO_MP4}
                srcWebm={HERO_VIDEO_WEBM}
                poster={HERO_VIDEO_POSTER}
                fallback={HERO_VIDEO_FALLBACK}
                parallax
              />
              <HeroSigninBlur />
            </>
          ) : null}

          <div
            className={`relative z-10 mx-auto grid h-auto w-full max-w-7xl grid-cols-1 gap-8 px-6 pb-8 pt-6 md:h-full md:px-12 md:pb-10 md:pt-8 ${
              panel.id === "hero"
                ? "lg:grid-cols-1 lg:items-center"
                : panel.variant === "features"
                  ? "lg:grid-cols-1 lg:items-center"
                  : "lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16"
            }`}
          >
            <div
              className={`order-1 space-y-6 ${
                panel.variant === "features" ? "mx-auto w-full max-w-[1180px]" : ""
              }`}
            >
              {panel.id === "hero" ? (
                <Reveal delay={0}>
                  <div className="flex items-center gap-4">
                    <Image
                      src="/brand/ctrl-lockup.png"
                      alt="CTRL logo"
                      width={176}
                      height={70}
                      className="brand-asset h-9 w-auto"
                      priority
                    />
                    <span className="hidden text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)] md:inline">
                      {CTRL_EXPANSION}
                    </span>
                  </div>
                </Reveal>
              ) : null}

              <Reveal delay={0}>
                <p className="section-label text-[var(--color-text-muted)]">{panel.label}</p>
              </Reveal>

              {panel.id === "hero" ? (
                <Reveal delay={0.05}>
                  <HeroQuoteRotator quotes={HERO_QUOTES} />
                </Reveal>
              ) : (
                <>
                  <Reveal delay={0.05}>
                    <h1 className="max-w-[820px] text-4xl font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
                      {panel.title}
                    </h1>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <p className="max-w-[560px] text-base leading-relaxed text-[var(--color-text-muted)]">{panel.paragraph}</p>
                  </Reveal>
                </>
              )}

              <Reveal delay={panel.id === "hero" ? 0.22 : 0.15}>
                <SectionBody panel={panel} />
              </Reveal>

              {panel.id === "hero" ? (
                <Reveal delay={0.28}>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <AuthActionButton
                      mode="signin"
                      className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface-hover)]"
                    >
                      Access Platform
                    </AuthActionButton>
                    <AuthActionButton
                      mode="signup"
                      className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-button-ghost-hover)]"
                    >
                      Request Onboarding
                    </AuthActionButton>
                  </div>
                </Reveal>
              ) : null}
            </div>

            {panel.id === "hero" ? null : (
              <SectionAside panel={panel} />
            )}
          </div>
        </CinematicSection>
      ))}
      <ReturnToTop />
    </main>
  );
}

function SectionBody({ panel }: { panel: Panel }) {
  if (panel.id === "hero") {
    return null;
  }

  if (panel.variant === "features") {
    return (
      <div className="w-full max-w-[1180px]">
        <FeatureCarousel features={FEATURES} />
      </div>
    );
  }

  if (panel.variant === "testimonials") {
    return (
      <div className="space-y-4">
        <div className="flex max-w-[640px] flex-wrap items-end gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <p className="text-5xl font-semibold text-[var(--color-text-primary)]">4.8</p>
          <div className="pb-1">
            <p className="text-sm text-[var(--color-text-secondary)]">Average programme rating</p>
            <p className="text-xs text-[var(--color-text-muted)]">From operational and governance stakeholders</p>
          </div>
        </div>
        <div className="max-w-[640px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 lg:hidden">
          <TestimonialCarousel testimonials={TESTIMONIALS} />
        </div>
      </div>
    );
  }

  if (panel.variant === "contact") {
    return (
      <div className="max-w-[620px] space-y-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Secure Contact</p>
          <a href="mailto:contact@ctrl-platform.uk" className="mt-2 block text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            contact@ctrl-platform.uk
          </a>
          <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
            Include organisation name, deployment timeline, and required assurance controls in your message.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:contact@ctrl-platform.uk?subject=Request%20Demo"
            className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-strong)]"
          >
            Request Demo
          </a>
          <a
            href="mailto:contact@ctrl-platform.uk"
            className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface-hover)]"
          >
            Email CTRL
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ul className="max-w-[620px] space-y-3 text-sm text-[var(--color-text-primary)] md:text-[15px]">
        {panel.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {panel.id === "about" ? (
        <div className="max-w-[640px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 lg:hidden">
          <AboutOperationsPanel />
        </div>
      ) : null}

      {panel.id === "security" ? (
        <div className="max-w-[640px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 lg:hidden">
          <SecurityControlsPanel />
        </div>
      ) : null}

      {panel.id === "intelligence" ? (
        <div className="max-w-[640px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 lg:hidden">
          <IntelligencePanel />
        </div>
      ) : null}
    </>
  );
}

function SectionAside({ panel }: { panel: Panel }) {
  if (panel.id === "security") {
    return (
      <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
          <SecurityControlsPanel />
        </div>
      </Reveal>
    );
  }

  if (panel.id === "about") {
    return (
      <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
          <AboutOperationsPanel />
        </div>
      </Reveal>
    );
  }

  if (panel.id === "intelligence") {
    return (
      <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
          <IntelligencePanel />
        </div>
      </Reveal>
    );
  }

  if (panel.id === "testimonials") {
    return (
      <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
            <TestimonialsSummaryPanel />
          </div>
          <TestimonialCarousel testimonials={TESTIMONIALS} className="max-w-none" />
        </div>
      </Reveal>
    );
  }

  if (panel.id === "contact") {
    return (
      <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5">
          <ContactEngagementPanel />
        </div>
      </Reveal>
    );
  }

  return null;
}

function AboutOperationsPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--color-text-muted)]">Operational Model</p>
        <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
          Controlled
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {ABOUT_FLOW.map((item, index) => (
          <div key={item} className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] text-xs font-semibold text-[var(--color-text-primary)]">
              {index + 1}
            </span>
            <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["Issue", "Review", "Handoff"].map((item) => (
          <div
            key={item}
            className="rounded-md border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-2 text-center text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
          >
            {item}
          </div>
        ))}
      </div>
    </>
  );
}

function SecurityControlsPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--color-text-muted)]">Control Safeguards</p>
        <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
          Live Policy
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {[
          {
            title: "Access Boundary",
            detail: "Every protected route is role-checked and ownership-validated before data is returned."
          },
          {
            title: "Evidence Record",
            detail: "Critical actions are attributable, timestamped, and preserved as review-ready event evidence."
          },
          {
            title: "Document Retrieval",
            detail: "Sensitive candidate files are delivered through short-lived, validated access windows only."
          }
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Integrity Posture</span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Policy Enforced</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[rgb(var(--color-accent-rgb)/0.1)]">
          <div className="h-2 w-[86%] rounded-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </>
  );
}

function IntelligencePanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--color-text-muted)]">Assessment Signal Board</p>
        <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
          Live
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {INTELLIGENCE_METRICS.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
        <div className="flex items-end gap-2">
          {[42, 58, 74, 63, 88, 79].map((height, index) => (
            <div key={`${height}-${index}`} className="flex-1 rounded-t-sm bg-[rgb(var(--color-accent-rgb)/0.18)]" style={{ height: `${height}px` }} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          <span>Capture</span>
          <span>Review</span>
          <span>Report</span>
        </div>
      </div>
    </>
  );
}

function TestimonialsSummaryPanel() {
  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <p className="text-5xl font-semibold text-[var(--color-text-primary)]">4.8</p>
        <div className="pb-1">
          <p className="text-sm text-[var(--color-text-secondary)]">Average programme rating</p>
          <p className="text-xs text-[var(--color-text-muted)]">From operational and governance stakeholders</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Assurance", value: "5.0" },
          { label: "Usability", value: "4.7" },
          { label: "Oversight", value: "4.8" }
        ].map((metric) => (
          <div key={metric.label} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{metric.label}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ContactEngagementPanel() {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--color-text-muted)]">Engagement Window</p>
        <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.35)] bg-[rgb(var(--color-accent-rgb)/0.12)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
          1 Working Day
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {[
          { label: "Procurement", value: "Requirement fit and governance scope" },
          { label: "Technical", value: "Environment, deployment, and assurance review" },
          { label: "Demonstration", value: "Guided walkthrough aligned to your operating model" }
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{item.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="mailto:contact@ctrl-platform.uk?subject=Request%20Demo"
          className="inline-flex rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-strong)]"
        >
          Request Demo
        </a>
        <a
          href="mailto:contact@ctrl-platform.uk"
          className="inline-flex rounded-md border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-button-ghost-hover)]"
        >
          Contact Team
        </a>
      </div>
    </>
  );
}
