import type {
  PortfolioSection,
  SectionSettings,
  SectionType,
} from "../types/portfolio";

export type SectionLayoutDefaults = Pick<
  SectionSettings,
  | "layoutMode"
  | "gridColumns"
  | "gridGapX"
  | "gridGapY"
  | "gridAlignItems"
  | "gridJustifyContent"
  | "stackDirection"
  | "stackAlign"
  | "stackJustify"
  | "stackGap"
  | "layoutWrap"
>;

export const stackDirectionOptions = [
  { label: "Horizontal", value: "row" },
  { label: "Vertical", value: "column" },
] as const;

export const stackAlignOptions = [
  { label: "Stretch", value: "stretch" },
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
] as const;

export const stackJustifyOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Space between", value: "space-between" },
  { label: "Space around", value: "space-around" },
  { label: "Space evenly", value: "space-evenly" },
] as const;

export const gridAlignItemsOptions = [
  { label: "Stretch", value: "stretch" },
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
] as const;

export const gridJustifyContentOptions = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
  { label: "Space between", value: "space-between" },
  { label: "Space around", value: "space-around" },
  { label: "Space evenly", value: "space-evenly" },
] as const;

const stackDefaults: SectionLayoutDefaults = {
  layoutMode: "stack",
  stackDirection: "column",
  stackAlign: "stretch",
  stackJustify: "flex-start",
  stackGap: 0,
  layoutWrap: false,
};

const defaultsBySection: Record<SectionType, SectionLayoutDefaults> = {
  header: {
    ...stackDefaults,
    stackDirection: "row",
    stackAlign: "center",
    stackJustify: "space-between",
    stackGap: 18,
    layoutWrap: true,
  },
  hero: {
    layoutMode: "grid",
    gridColumns: 2,
    gridGapX: 48,
    gridGapY: 32,
    gridAlignItems: "center",
    gridJustifyContent: "start",
    layoutWrap: true,
  },
  projects: stackDefaults,
  certifications: stackDefaults,
  services: stackDefaults,
  custom: {
    ...stackDefaults,
    stackGap: 16,
  },
  about: {
    layoutMode: "grid",
    gridColumns: 2,
    gridGapX: 34,
    gridGapY: 24,
    gridAlignItems: "stretch",
    gridJustifyContent: "start",
    layoutWrap: true,
  },
  footer: {
    layoutMode: "grid",
    gridColumns: 3,
    gridGapX: 14,
    gridGapY: 14,
    gridAlignItems: "stretch",
    gridJustifyContent: "start",
    layoutWrap: true,
  },
};

export function getSectionLayoutDefaults(
  type: SectionType,
  mode?: "grid" | "stack",
): SectionLayoutDefaults {
  const inferred = defaultsBySection[type];
  if (!mode || mode === inferred.layoutMode) return { ...inferred };
  if (mode === "grid") {
    return {
      layoutMode: "grid",
      gridColumns: 2,
      gridGapX: 16,
      gridGapY: 16,
      gridAlignItems: "stretch",
      gridJustifyContent: "start",
      layoutWrap: true,
    };
  }
  return { ...stackDefaults };
}

export function getSectionLayoutMode(
  section: Pick<PortfolioSection, "type" | "settings">,
) {
  return (
    section.settings.layoutMode ||
    getSectionLayoutDefaults(section.type).layoutMode ||
    "stack"
  );
}

export function resolveSectionLayoutSettings(
  section: Pick<PortfolioSection, "type" | "settings">,
): SectionLayoutDefaults {
  const mode = getSectionLayoutMode(section);
  return {
    ...getSectionLayoutDefaults(section.type, mode),
    ...section.settings,
    layoutMode: mode,
  };
}
