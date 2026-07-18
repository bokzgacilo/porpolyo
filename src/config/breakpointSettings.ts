import type { BreakpointWidths, PreviewMode } from "../types/portfolio";

export const defaultBreakpointWidths: BreakpointWidths = {
  tablet: 768,
  mobile: 390,
};

export function resolveBreakpointWidths(
  saved?: Partial<BreakpointWidths>,
): BreakpointWidths {
  const mobile = Math.max(saved?.mobile ?? defaultBreakpointWidths.mobile, 240);
  const tablet = Math.max(
    saved?.tablet ?? defaultBreakpointWidths.tablet,
    mobile,
  );
  return { tablet, mobile };
}

export function breakpointWidth(
  mode: PreviewMode,
  saved?: Partial<BreakpointWidths>,
) {
  if (mode === "desktop") return "100vw";
  return `${resolveBreakpointWidths(saved)[mode]}px`;
}
