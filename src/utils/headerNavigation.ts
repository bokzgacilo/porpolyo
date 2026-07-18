import type { PortfolioSection, SectionType } from "../types/portfolio";
import { contentValue } from "./contentFields";

export interface HeaderNavigationLinkConfig {
  sectionType: SectionType;
  label?: string;
  href?: string;
}

export interface ResolvedHeaderNavigationLink {
  section: PortfolioSection;
  label: string;
  href: string;
}

export function resolveHeaderNavigationLinks(
  header: PortfolioSection,
  sections: PortfolioSection[],
): ResolvedHeaderNavigationLink[] {
  const navigation = contentValue(header, "navigation") as
    | { type?: string; links?: HeaderNavigationLinkConfig[] }
    | undefined;
  const configuredLinks = navigation?.links;

  if (Array.isArray(configuredLinks)) {
    return configuredLinks.flatMap((link) => {
      const section = sections.find(
        (candidate) =>
          candidate.type === link.sectionType &&
          candidate.visible &&
          !candidate.parentSectionId,
      );
      return section
        ? [
            {
              section,
              label: link.label || section.label,
              href: link.href || `#${section.type}`,
            },
          ]
        : [];
    });
  }

  return sections
    .filter(
      (section) =>
        section.visible &&
        !section.parentSectionId &&
        !["header", "footer"].includes(section.type),
    )
    .map((section) => ({
      section,
      label: section.label,
      href: `#${section.type}`,
    }));
}
