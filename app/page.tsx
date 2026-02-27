import Image from "next/image";
import AuthActionButton from "@/components/AuthActionButton";
import SystemCanvas from "@/components/system/SystemCanvas";
import Reveal from "@/components/motion/Reveal";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import FeatureCarousel from "@/components/home/FeatureCarousel";
import HomeToneObserver from "@/components/home/HomeToneObserver";
import CinematicSection from "@/components/home/CinematicSection";
import ContinuityGridOverlay from "@/components/home/ContinuityGridOverlay";
import HeroSigninBlur from "@/components/home/HeroSigninBlur";
import HeroHashHandler from "@/components/HeroHashHandler";
import ReturnToTop from "@/components/ReturnToTop";
import VideoBackground from "@/components/hero/VideoBackground";

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

const FEATURES = [
  {
    title: "Role-Isolated Portals",
    detail: "Candidate, recruiter, client, and admin views are separated with strict access boundaries."
  },
  {
    title: "Access-Code Onboarding",
    detail: "Candidate onboarding is gated through recruiter-issued codes with expiry and single-use controls."
  },
  {
    title: "Assessment Workflow",
    detail: "Structured question sets and server-side scoring provide consistent evaluation outcomes."
  },
  {
    title: "Audit Visibility",
    detail: "Critical actions are logged with actor context to support oversight and incident response."
  },
  {
    title: "Controlled Candidate Sharing",
    detail: "Recruiters can push reviewed candidates to approved clients with status traceability."
  },
  {
    title: "Secure CV Access",
    detail: "Candidate documents are shared through ownership-validated, short-lived signed retrieval."
  }
];

const TESTIMONIALS = [
  {
    quote:
      "CTRL established one controlled operating model across screening, assessments, and final client handoff without process drift.",
    name: "Recruitment Operations Lead",
    organisation: "Public Safety Directorate"
  },
  {
    quote:
      "The platform gives our governance team immediate visibility of who accessed what, when, and under which operational role.",
    name: "Compliance Manager",
    organisation: "Regional Service Command"
  },
  {
    quote:
      "Assessment reporting arrives in a format our client stakeholders can action quickly while retaining full audit traceability.",
    name: "Client Delivery Manager",
    organisation: "Government Workforce Partner"
  }
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
        <CinematicSection
          key={panel.id}
          id={panel.id}
          tone={panel.tone}
          isHero={panel.id === "hero"}
        >
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
          <div className="relative z-10 mx-auto grid h-full w-full max-w-7xl grid-cols-1 gap-8 px-6 pb-8 pt-6 md:px-12 md:pb-10 md:pt-8 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16">
            <div className="order-1 space-y-6">
              {panel.id === "hero" ? (
                <Reveal delay={0}>
                  <div className="flex items-center gap-4">
                    <Image
                      src="/brand/ctrl-lockup.png"
                      alt="CTRL logo"
                      width={176}
                      height={70}
                      className="h-9 w-auto"
                      priority
                    />
                    <span className="hidden text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)] md:inline">
                      Control Room Talent, Recruitment and Logic
                    </span>
                  </div>
                </Reveal>
              ) : null}
              <Reveal delay={0}>
                <p className="section-label text-[var(--color-text-muted)]">{panel.label}</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="max-w-[820px] text-4xl font-semibold leading-[1.08] text-[var(--color-text-primary)] md:text-5xl lg:text-6xl">
                  {panel.title}
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="max-w-[560px] text-base leading-relaxed text-[var(--color-text-muted)]">{panel.paragraph}</p>
              </Reveal>

              <Reveal delay={0.15}>
                {panel.variant === "features" ? (
                  <>
                    <FeatureCarousel features={FEATURES} className="md:hidden" />
                    <div className="hidden max-w-[740px] grid-cols-2 gap-3 md:grid">
                      {FEATURES.map((feature) => (
                        <article key={feature.title} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{feature.title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">{feature.detail}</p>
                        </article>
                      ))}
                    </div>
                  </>
                ) : panel.variant === "testimonials" ? (
                  <TestimonialCarousel testimonials={TESTIMONIALS} />
                ) : panel.variant === "contact" ? (
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
                        href="mailto:contact@ctrl-platform.uk"
                        className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface-hover)]"
                      >
                        Email CTRL
                      </a>
                      <AuthActionButton
                        mode="signup"
                        className="rounded-md border border-[var(--color-border-strong)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-white/5"
                      >
                        Request Onboarding
                      </AuthActionButton>
                    </div>
                  </div>
                ) : (
                  <ul className="max-w-[620px] space-y-3 text-sm text-[var(--color-text-primary)] md:text-[15px]">
                    {panel.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>

              {panel.id === "hero" ? (
                <Reveal delay={0.2}>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <AuthActionButton
                      mode="signin"
                      className="rounded-md border border-[rgb(var(--color-accent-rgb)/0.6)] bg-[var(--color-accent-surface)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent-surface-hover)]"
                    >
                      Access Platform
                    </AuthActionButton>
                    <AuthActionButton
                      mode="signup"
                      className="rounded-md border border-[var(--color-border-strong)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-white/5"
                    >
                      Request Onboarding
                    </AuthActionButton>
                  </div>
                </Reveal>
              ) : null}
            </div>

            <Reveal delay={0.12} className="order-2 hidden lg:order-2 lg:block">
              <SystemCanvas focus={panel.focus} />
            </Reveal>
          </div>
        </CinematicSection>
      ))}
      <ReturnToTop />
    </main>
  );
}
