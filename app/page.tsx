import Image from "next/image";
import AuthActionButton from "@/components/AuthActionButton";
import Reveal from "@/components/motion/Reveal";
import FeatureCarousel, { FeatureSlide } from "@/components/home/FeatureCarousel";
import HeroQuoteRotator from "@/components/home/HeroQuoteRotator";
import HeroScrollCue from "@/components/home/HeroScrollCue";
import HomeToneObserver from "@/components/home/HomeToneObserver";
import CinematicSection from "@/components/home/CinematicSection";
import ContinuityGridOverlay from "@/components/home/ContinuityGridOverlay";
import HeroSigninBlur from "@/components/home/HeroSigninBlur";
import HeroHashHandler from "@/components/HeroHashHandler";
import ReturnToTop from "@/components/ReturnToTop";
import HeroAmbientBackground from "@/components/hero/HeroAmbientBackground";

type Panel = {
  id: "hero" | "platform" | "security" | "intelligence" | "contact";
  tone: "0" | "1" | "2" | "3";
  label: string;
  title: string;
  paragraph: string;
};

type NarrativeItem = {
  title: string;
  detail: string;
};

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

const HERO_BRANDLINE = "Recruitment Intelligence Platform";
const HERO_SUPPORTING_COPY =
  "CTRL gives secure institutions one governed recruitment model for assessment, review, and decision-ready reporting.";
const HERO_TRUST_MARKERS = ["Role-isolated access", "Audit traceability", "Assessment intelligence"];

const FEATURES: FeatureSlide[] = [
  {
    title: "Role-Isolated Portals",
    category: "Access Control",
    detail: "Candidate, recruiter, client, and admin views are separated with explicit access boundaries and protected navigation.",
    screenshot: "/hero/frame-0.jpg",
    summary: ["Role-scoped routes", "Protected navigation", "Server enforcement"]
  },
  {
    title: "Access-Code Onboarding",
    category: "Onboarding Control",
    detail: "Candidate entry is governed through recruiter-issued codes with expiry, ownership, and single-use controls.",
    screenshot: "/hero/frame-90.jpg",
    summary: ["Single-use issuance", "Expiry checks", "Recruiter ownership"]
  },
  {
    title: "Assessment Workflow",
    category: "Assessment Runtime",
    detail: "Structured question sets and controlled assessment sessions provide consistent candidate evidence across every run.",
    screenshot: "/hero/frame-150.jpg",
    summary: ["Managed question sets", "Server-side scoring", "Candidate progress state"]
  },
  {
    title: "Audit Visibility",
    category: "Governance",
    detail: "Critical actions are recorded with actor context so every operational decision can be reviewed and defended.",
    screenshot: "/hero/frame-0.jpg",
    summary: ["Immutable records", "Actor attribution", "Review-ready evidence"]
  },
  {
    title: "Controlled Candidate Sharing",
    category: "Client Delivery",
    detail: "Recruiters can push reviewed candidates to approved clients with explicit state progression and handoff traceability.",
    screenshot: "/hero/frame-90.jpg",
    summary: ["Approved handoff", "Shared status tracking", "Review gates"]
  },
  {
    title: "External Document Assurance",
    category: "Third-Party Coordination",
    detail: "Supporting documents can remain off-platform while the review path and decision states stay attributable inside CTRL.",
    screenshot: "/hero/frame-150.jpg",
    summary: ["External references", "Governed review state", "Audit-linked decisions"]
  }
];

const PLATFORM_POINTS: NarrativeItem[] = [
  {
    title: "Controlled entry",
    detail: "Every candidate route begins with accountable ownership and a fixed recruiter-controlled intake step."
  },
  {
    title: "Structured review",
    detail: "Assessment evidence, recruiter notes, and state transitions move through one consistent internal path."
  },
  {
    title: "Client-ready handoff",
    detail: "Approved candidates move to client view only after internal review and status validation are complete."
  }
];

const PLATFORM_SUMMARY = [
  { label: "Intake", value: "Code-gated" },
  { label: "Review", value: "3-stage" },
  { label: "Handoff", value: "Tracked" }
];

const SECURITY_POINTS: NarrativeItem[] = [
  {
    title: "Role boundary",
    detail: "Protected actions are validated against session, role, and workflow ownership before operational data is returned."
  },
  {
    title: "Audit evidence",
    detail: "Every meaningful step remains attributable so review, escalation, and oversight do not depend on informal memory."
  },
  {
    title: "Governed record handling",
    detail: "Candidate workflows stay linked to controlled references even when supporting documents are managed off-platform."
  }
];

const SECURITY_STRIPS = ["Role checks", "Session rules", "Audit retention"];

const INTELLIGENCE_POINTS: NarrativeItem[] = [
  {
    title: "Consistent scoring",
    detail: "Assessment outputs remain structured so review quality does not depend on who happens to be operating the workflow."
  },
  {
    title: "Review conversion",
    detail: "Recruiter oversight turns raw candidate activity into decision-ready evidence with clear context and notes."
  },
  {
    title: "Client-ready reporting",
    detail: "Shared outputs remain aligned to source evidence instead of freeform summaries or disconnected interpretations."
  }
];

const INTELLIGENCE_METRICS = [
  { label: "Signals", value: "24" },
  { label: "In review", value: "05" },
  { label: "Client-ready", value: "11" }
];

const PROOF_METRICS = [
  { label: "Programme rating", value: "4.8 / 5" },
  { label: "Assurance score", value: "5.0 / 5" },
  { label: "Operational fit", value: "4.7 / 5" }
];

const PROOF_REFERENCE = {
  quote:
    "CTRL established one controlled operating model across screening, assessment review, and client handoff without governance drift.",
  name: "Recruitment Operations Lead",
  title: "Public Safety Directorate"
};

const CONTACT_PREPARATION = [
  "Organisation and team structure",
  "Current assessment workflow",
  "Security or assurance constraints",
  "Desired implementation timeline"
];

const PANELS: Panel[] = [
  {
    id: "hero",
    tone: "0",
    label: "Operational Recruitment Platform",
    title: "Control-grade hiring operations for secure institutions",
    paragraph:
      "CTRL provides a governed recruitment operating model with role isolation, audit traceability, and structured candidate progression for high-assurance environments."
  },
  {
    id: "platform",
    tone: "1",
    label: "Platform",
    title: "One operating model from intake to client handoff",
    paragraph:
      "CTRL combines onboarding control, recruiter review, assessment execution, and client delivery into one accountable workflow."
  },
  {
    id: "security",
    tone: "2",
    label: "Security",
    title: "Governance built into every protected action",
    paragraph:
      "Critical actions are attributable, access boundaries are explicit, and sensitive candidate records remain governed through controlled workflow references."
  },
  {
    id: "intelligence",
    tone: "3",
    label: "Intelligence",
    title: "Assessment evidence turned into decision-ready output",
    paragraph:
      "Structured scoring and recruiter-reviewed outputs support consistent evaluations and client-facing reporting without interpretation drift."
  },
  {
    id: "contact",
    tone: "1",
    label: "Proof & Contact",
    title: "Plan a secure rollout with the CTRL team",
    paragraph:
      "Discuss onboarding, secure deployment requirements, procurement alignment, and the operating model your organisation needs."
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
              <HeroAmbientBackground parallax />
              <HeroSigninBlur />
            </>
          ) : null}
          <SectionScene panel={panel} />
        </CinematicSection>
      ))}
      <ReturnToTop />
    </main>
  );
}

function SectionScene({ panel }: { panel: Panel }) {
  switch (panel.id) {
    case "hero":
      return <HeroSectionScene />;
    case "platform":
      return <PlatformSectionScene panel={panel} />;
    case "security":
      return <SecuritySectionScene panel={panel} />;
    case "intelligence":
      return <IntelligenceSectionScene panel={panel} />;
    case "contact":
      return <ContactSectionScene panel={panel} />;
    default:
      return null;
  }
}

function HeroSectionScene() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center px-6 py-8 md:px-12 md:py-10">
      <div className="max-w-[920px] space-y-5">
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
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)] md:inline">
              {HERO_BRANDLINE}
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <HeroQuoteRotator quotes={HERO_QUOTES} />
        </Reveal>

        <Reveal delay={0.12}>
          <p className="max-w-[640px] text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            {HERO_SUPPORTING_COPY}
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
            {HERO_TRUST_MARKERS.map((marker, index) => (
              <div key={marker} className="flex items-center gap-4">
                <span>{marker}</span>
                {index < HERO_TRUST_MARKERS.length - 1 ? (
                  <span className="h-1 w-1 rounded-full bg-[rgb(var(--color-accent-rgb)/0.45)]" />
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.24}>
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
              Request Demonstration
            </AuthActionButton>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.32}>
        <div className="mt-8 flex w-full justify-center">
          <HeroScrollCue targetId="platform" label="Explore Workflow" />
        </div>
      </Reveal>
    </div>
  );
}

function PlatformSectionScene({ panel }: { panel: Panel }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-12 md:px-12 md:py-16">
      <SectionBackdrop variant="platform" />
      <div className="relative z-10">
        <div className="max-w-[760px] space-y-7">
          <SectionHeading panel={panel} />
          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_SUMMARY.map((signal) => (
                <span
                  key={signal.label}
                  className="rounded-full border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
                >
                  {signal.label}: {signal.value}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10">
            <FeatureCarousel features={FEATURES} />
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PLATFORM_POINTS.map((item, index) => (
              <div key={item.title} className="rounded-[26px] border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.04)] p-5 backdrop-blur-[2px]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--color-accent-rgb)/0.3)] bg-[rgb(var(--color-accent-rgb)/0.1)] text-[11px] font-semibold text-[var(--color-text-primary)]">
                    0{index + 1}
                  </span>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function SecuritySectionScene({ panel }: { panel: Panel }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-12 md:px-12 md:py-16">
      <SectionBackdrop variant="security" />
      <div className="relative z-10">
        <div className="max-w-[760px] space-y-7">
          <SectionHeading panel={panel} />
          <Reveal delay={0.2}>
            <div className="flex flex-wrap gap-2">
              {SECURITY_STRIPS.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <Reveal delay={0.24}>
            <div className="min-w-0 space-y-3">
              {SECURITY_POINTS.map((item, index) => (
                <div
                  key={item.title}
                  className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.04)] px-4 py-4 backdrop-blur-[2px] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--color-accent-rgb)/0.3)] bg-[rgb(var(--color-accent-rgb)/0.1)] text-[11px] font-semibold text-[var(--color-text-primary)]">
                    0{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="min-w-0 rounded-[30px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(180deg,rgb(var(--color-accent-rgb)/0.04)_0%,var(--color-surface-2)_100%)] p-5 md:p-6">
              <SecurityPreview />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function IntelligenceSectionScene({ panel }: { panel: Panel }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-12 md:px-12 md:py-16">
      <SectionBackdrop variant="intelligence" />
      <div className="relative z-10 space-y-10">
        <div className="max-w-[720px] space-y-7">
          <SectionHeading panel={panel} />
          <Reveal delay={0.15}>
            <div className="grid gap-3 sm:grid-cols-3">
              {INTELLIGENCE_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.05)] px-4 py-4 backdrop-blur-[2px]"
                >
                  <p className="section-label text-[var(--color-text-muted)]">{metric.label}</p>
                  <p className="mt-3 text-[1.65rem] font-semibold leading-none text-[var(--color-text-primary)]">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <Reveal delay={0.12}>
            <div className="min-w-0 rounded-[30px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(180deg,rgb(var(--color-accent-rgb)/0.03)_0%,var(--color-surface-2)_100%)] p-5 md:p-6">
              <IntelligencePreview />
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="space-y-3">
              {INTELLIGENCE_POINTS.map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-4 backdrop-blur-[2px]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgb(var(--color-accent-rgb)/0.3)] bg-[rgb(var(--color-accent-rgb)/0.1)] text-[11px] font-semibold text-[var(--color-text-primary)]">
                      0{index + 1}
                    </span>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function ContactSectionScene({ panel }: { panel: Panel }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-12 md:px-12 md:py-16">
      <SectionBackdrop variant="contact" />
      <div className="relative z-10">
        <div className="max-w-[760px] space-y-7">
          <SectionHeading panel={panel} />
          <Reveal delay={0.15}>
            <div className="flex flex-wrap gap-2">
              {PROOF_METRICS.map((metric) => (
                <span
                  key={metric.label}
                  className="rounded-full border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]"
                >
                  {metric.label}: {metric.value}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
          <div className="min-w-0 space-y-6">
            <Reveal delay={0.24}>
              <div className="rounded-[28px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(180deg,rgb(var(--color-accent-rgb)/0.04)_0%,var(--color-surface-2)_100%)] p-6 backdrop-blur-[2px]">
                <p className="section-label text-[var(--color-text-muted)]">Reference</p>
                <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-primary)]">
                  &ldquo;{PROOF_REFERENCE.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{PROOF_REFERENCE.name}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    {PROOF_REFERENCE.title}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="mailto:contact@ctrl-platform.uk?subject=Request%20Demo"
                  className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-strong)]"
                >
                  Request Demo
                </a>
                <a
                  href="mailto:contact@ctrl-platform.uk"
                  className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-button-ghost-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-button-ghost-hover)]"
                >
                  Email CTRL
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="min-w-0 rounded-[30px] border border-[rgb(var(--color-accent-rgb)/0.16)] bg-[linear-gradient(135deg,rgb(var(--color-accent-rgb)/0.03)_0%,var(--color-surface-2)_100%)] p-5 md:p-6">
              <ContactPreview />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ panel }: { panel: Panel }) {
  return (
    <>
      <Reveal delay={0}>
        <p className="section-label text-[var(--color-text-muted)]">{panel.label}</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="max-w-[620px] text-4xl font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-5xl lg:text-[3.2rem]">
          {panel.title}
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="max-w-[560px] text-base leading-relaxed text-[var(--color-text-muted)]">{panel.paragraph}</p>
      </Reveal>
    </>
  );
}

function SectionBackdrop({ variant }: { variant: Exclude<Panel["id"], "hero"> }) {
  if (variant === "platform") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6%] top-[18%] h-48 w-48 rounded-full bg-[rgb(var(--color-accent-rgb)/0.12)] blur-3xl animate-premium-pulse" />
        <div className="absolute right-[2%] top-[14%] hidden h-[23rem] w-[30rem] rounded-[44px] border border-[rgb(var(--color-accent-rgb)/0.12)] bg-[linear-gradient(135deg,rgb(var(--color-accent-rgb)/0.05)_0%,transparent_72%)] opacity-80 lg:block animate-premium-tilt" />
        <div className="absolute right-[10%] top-[22%] hidden h-[18rem] w-[22rem] rounded-[34px] border border-[rgb(var(--color-accent-rgb)/0.08)] opacity-70 lg:block" />
        <div className="absolute left-[18%] top-[58%] hidden h-px w-[18rem] bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.2)] to-transparent lg:block" />
      </div>
    );
  }

  if (variant === "security") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-4%] top-[28%] h-56 w-56 rounded-full bg-[rgb(var(--color-accent-rgb)/0.09)] blur-3xl animate-premium-drift-x" />
        <div className="absolute right-[6%] top-[10%] hidden h-[28rem] w-[28rem] rounded-full border border-[rgb(var(--color-accent-rgb)/0.1)] opacity-35 lg:block animate-premium-orbit" />
        <div className="absolute right-[0] top-[18%] hidden h-[22rem] w-[34rem] lg:block">
          <div className="absolute inset-0 rounded-[36px] border border-[rgb(var(--color-accent-rgb)/0.08)]" />
          <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.16)] to-transparent" />
          <div className="absolute inset-x-8 top-20 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.12)] to-transparent" />
          <div className="absolute inset-x-8 top-32 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.12)] to-transparent" />
          <div className="absolute inset-x-8 top-44 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.12)] to-transparent" />
          <div className="absolute inset-x-8 top-56 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.12)] to-transparent" />
        </div>
      </div>
    );
  }

  if (variant === "intelligence") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[4%] top-[14%] h-44 w-44 rounded-full bg-[rgb(var(--color-accent-rgb)/0.1)] blur-3xl animate-premium-pulse" />
        <div className="absolute right-[4%] top-[18%] hidden h-[22rem] w-[34rem] lg:block">
          <div className="absolute inset-0 rounded-[36px] border border-[rgb(var(--color-accent-rgb)/0.08)]" />
          <div className="absolute bottom-8 left-10 right-10 flex items-end gap-4">
            {[24, 44, 68, 52, 84, 62].map((height, index) => (
              <span
                key={height}
                className={`block flex-1 rounded-t-md bg-[rgb(var(--color-accent-rgb)/0.12)] ${index % 2 === 0 ? "animate-premium-pulse" : "animate-premium-drift-y"}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="absolute left-12 right-12 top-[34%] h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.14)] to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[8%] top-[16%] h-52 w-52 rounded-full bg-[rgb(var(--color-accent-rgb)/0.09)] blur-3xl animate-premium-pulse" />
      <div className="absolute left-[2%] bottom-[10%] h-44 w-72 rounded-full bg-[rgb(var(--color-accent-rgb)/0.06)] blur-3xl animate-premium-drift-y" />
      <div className="absolute right-[8%] top-[14%] hidden h-[14rem] w-[26rem] rounded-[36px] border border-[rgb(var(--color-accent-rgb)/0.08)] opacity-80 lg:block animate-premium-tilt" />
      <div className="absolute left-[12%] top-[56%] hidden h-px w-[14rem] bg-gradient-to-r from-transparent via-[rgb(var(--color-accent-rgb)/0.16)] to-transparent lg:block" />
    </div>
  );
}

function SecurityPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label text-[var(--color-text-muted)]">Access matrix</p>
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Enforced</span>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ["Candidate", "Restricted", "44%"],
            ["Client", "Read only", "68%"],
            ["Admin", "Privileged", "92%"]
          ].map(([role, state, width]) => (
            <div key={role} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">{role}</span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">{state}</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-[rgb(var(--color-accent-rgb)/0.08)]">
                <div className="h-1.5 rounded-full bg-[var(--color-accent)]" style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label text-[var(--color-text-muted)]">Audit ledger</p>
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">5 tracked events</span>
        </div>
        <div className="mt-5 space-y-3">
          {[
            ["09:41:08", "Access code issued", "Recruiter"],
            ["09:47:21", "Candidate registered", "Candidate"],
            ["10:06:12", "Assessment submitted", "Candidate"],
            ["10:14:45", "Review approved", "Recruiter"],
            ["10:22:03", "Client handoff", "Client"]
          ].map(([time, action, actor], index) => (
            <div key={`${time}-${action}`} className="grid grid-cols-[72px_12px_minmax(0,1fr)] gap-3">
              <span className="pt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{time}</span>
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                {index < 4 ? <span className="mt-1 h-full w-px bg-[rgb(var(--color-accent-rgb)/0.2)]" /> : null}
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{action}</span>
                  <span className="rounded-full border border-[rgb(var(--color-accent-rgb)/0.25)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                    {actor}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntelligencePreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label text-[var(--color-text-muted)]">Assessment signal map</p>
          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">Current cycle</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[92, 84, 76, 96].map((height, index) => (
            <div key={height} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
              <div className="flex h-36 items-end gap-2">
                <div
                  className="w-full rounded-t-md bg-[linear-gradient(180deg,rgb(var(--color-accent-rgb)/0.9)_0%,rgb(var(--color-accent-rgb)/0.22)_100%)]"
                  style={{ height: `${height}px` }}
                />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Band {index + 1}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Capture", "Review", "Client output"].map((stage, index) => (
            <div key={stage} className="rounded-xl border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.05)] px-3 py-3">
              <p className="section-label text-[var(--color-text-muted)]">0{index + 1}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[
          ["High match", "7", "Ready for client review"],
          ["Further review", "5", "Recruiter note required"],
          ["Escalated", "2", "Manual oversight triggered"]
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
              <span className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{hint}</p>
          </div>
        ))}
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[rgb(var(--color-accent-rgb)/0.08)] p-5">
          <p className="section-label text-[var(--color-text-muted)]">Report posture</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Shared reports remain linked to source assessments, recruiter review notes, and final progression state.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactPreview() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
        <p className="section-label text-[var(--color-text-muted)]">Secure contact</p>
        <a
          href="mailto:contact@ctrl-platform.uk"
          className="mt-4 block text-[1.65rem] font-semibold leading-tight text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)]"
        >
          contact@ctrl-platform.uk
        </a>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Responses are structured around procurement fit, deployment constraints, and demonstration scope.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
          <p className="section-label text-[var(--color-text-muted)]">Engagement track</p>
          <div className="mt-5 space-y-3">
            {[
              ["01", "Discovery", "Requirement fit and workflow scope"],
              ["02", "Assurance review", "Security posture and deployment constraints"],
              ["03", "Demonstration", "Guided walkthrough aligned to your process"]
            ].map(([step, title, detail]) => (
              <div
                key={step}
                className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgb(var(--color-accent-rgb)/0.3)] bg-[rgb(var(--color-accent-rgb)/0.1)] text-[11px] font-semibold text-[var(--color-text-primary)]">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-1)] p-5">
          <p className="section-label text-[var(--color-text-muted)]">Prepare for discussion</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CONTACT_PREPARATION.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-secondary)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
