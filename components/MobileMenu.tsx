"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { markNavigatingToHero, scrollToHero } from "@/utils/scrollToHero";
import { scrollToSection } from "@/utils/scrollToSection";
import AnimatedMenuButton from "@/components/ui/AnimatedMenuButton";

type SectionLink = {
  id: "about" | "features" | "security" | "intelligence" | "testimonials" | "contact";
  label: string;
};

const SECTION_LINKS: SectionLink[] = [
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "security", label: "Security" },
  { id: "intelligence", label: "Intelligence" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact Us" }
];

const PANEL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const scrollRoot = document.getElementById("app-scroll") ?? document.getElementById("system-snap-root");
    const mainContent = document.getElementById("public-home-main");
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = scrollRoot?.style.overflowY ?? "";

    document.body.style.overflow = "hidden";
    if (scrollRoot) {
      scrollRoot.style.overflowY = "hidden";
    }

    if (mainContent) {
      mainContent.setAttribute("aria-hidden", "true");
      if ("inert" in mainContent) {
        (mainContent as HTMLElement & { inert: boolean }).inert = true;
      }
    }

    const focusables = getFocusableElements(panelRef.current);
    focusables[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const nodes = getFocusableElements(panelRef.current);
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;
      const activeInsidePanel = activeElement ? panelRef.current?.contains(activeElement) : false;

      if (!activeInsidePanel) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (scrollRoot) {
        scrollRoot.style.overflowY = previousRootOverflow;
      }
      if (mainContent) {
        mainContent.removeAttribute("aria-hidden");
        if ("inert" in mainContent) {
          (mainContent as HTMLElement & { inert: boolean }).inert = false;
        }
      }
      previouslyFocused?.focus();
    };
  }, [open]);

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: SectionLink["id"]
  ) => {
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      scrollToSection(sectionId);
    });
  };

  const handleHomeLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setOpen(false);

    if (pathname === "/") {
      requestAnimationFrame(() => {
        scrollToHero();
        if (window.location.hash !== "#hero") {
          window.history.replaceState(null, "", "#hero");
        }
      });
      return;
    }

    markNavigatingToHero();
    router.push("/#hero");
  };

  return (
    <>
      {!open ? (
        <AnimatedMenuButton
          open={false}
          onClick={() => setOpen(true)}
          controlsId="mobile-nav-panel"
        />
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[70] pointer-events-none" aria-hidden={!open}>
          <motion.button
            type="button"
            aria-label="Close mobile menu"
            className="pointer-events-auto absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            id="mobile-nav-panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.32, ease: PANEL_EASE }}
            className="pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[85vw] max-w-sm flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-0)] shadow-2xl backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <Link href="/#hero" onClick={handleHomeLogoClick} className="flex items-center gap-3">
                <Image
                  src="/brand/ctrl-shield.png"
                  alt="CTRL Shield"
                  width={26}
                  height={30}
                  className="h-7 w-auto"
                />
                <Image src="/brand/ctrl-name.png" alt="CTRL" width={98} height={56} className="h-6 w-auto" />
              </Link>
              <AnimatedMenuButton
                open
                onClick={() => setOpen(false)}
                size="sm"
                openLabel="Close navigation"
                closedLabel="Open navigation"
              />
            </div>

            <nav className="px-6 py-7" aria-label="Mobile">
              <ul className="space-y-6 text-lg tracking-tight text-[var(--color-text-primary)]">
                {SECTION_LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      onClick={(event) => handleSectionClick(event, link.id)}
                      className="inline-flex items-center transition-all duration-300 hover:translate-x-1 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        </div>
      ) : null}
    </>
  );
}
