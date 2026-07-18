import type { ElementSettings } from "../types/portfolio";

export const defaultBodyLayout: ElementSettings = {
  layoutMode: "stack",
  stackDirection: "column",
  stackAlign: "stretch",
  stackJustify: "flex-start",
  stackGap: 0,
  layoutWrap: false,
};

export function resolveBodyLayout(
  saved?: ElementSettings,
): ElementSettings {
  return { ...defaultBodyLayout, ...saved };
}
