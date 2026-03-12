"use client";

import { MouseEvent } from "react";
import { scrollToSection as scrollToSectionById } from "@/utils/scrollToSection";

type SectionLink = {
  id: "platform" | "security" | "intelligence" | "contact";
  label: string;
};

const SECTION_LINKS: SectionLink[] = [
  { id: "platform", label: "Platform" },
  { id: "security", label: "Security" },
  { id: "intelligence", label: "Intelligence" },
  { id: "contact", label: "Contact Us" }
];

function handleSectionLinkClick(event: MouseEvent<HTMLAnchorElement>, sectionId: SectionLink["id"]) {
  event.preventDefault();
  scrollToSectionById(sectionId);
}

export default function NavSectionLinks() {
  return (
    <>
      {SECTION_LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(event) => handleSectionLinkClick(event, link.id)}
          className="transition-colors duration-300 ease-in-out hover:text-[var(--color-text-primary)]"
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
