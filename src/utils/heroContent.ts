import type { PortfolioSection } from "../types/portfolio";
import { contentValue } from "./contentFields";

export function getHeroActionContent(
  section: PortfolioSection,
  field: "primaryCta" | "secondaryCta",
  fallback: string,
) {
  const actions = contentValue<
    { primaryCta?: unknown; secondaryCta?: unknown }
  >(section, "actions") as
    | { primaryCta?: unknown; secondaryCta?: unknown }
    | undefined;
  return String(contentValue(section, field) ?? actions?.[field] ?? fallback);
}
