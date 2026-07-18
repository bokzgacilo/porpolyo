import { useEffect, useState } from "react";
import type { SelectedElement } from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";
import { createAnimationFrameScheduler } from "../../utils/animationFrameScheduler";

export type ComputedLayoutStructure = {
  type: "flex" | "grid" | "flow";
  direction: "row" | "column";
  columns: number;
  rows: number;
  gap: string;
  rowGap: string;
  columnGap: string;
  wrap: string;
  alignItems: string;
  justifyContent: string;
  childCount: number;
  childTags: string[];
};

export function useComputedLayoutStructure(
  selected: SelectedElement | null | undefined,
) {
  const [layout, setLayout] = useState<ComputedLayoutStructure>();
  const sectionId =
    selected && "sectionId" in selected ? selected.sectionId : undefined;
  const selectionKey =
    selected && selected.kind !== "head" && selected.kind !== "body"
      ? selectedElementKey(selected)
      : undefined;

  useEffect(() => {
    if (!sectionId || !selectionKey) {
      setLayout(undefined);
      return;
    }

    const viewport = document.querySelector<HTMLElement>(".canvas-viewport");
    const targetSelector = `[data-editor-section-id="${CSS.escape(sectionId)}"][data-editor-selection-key="${CSS.escape(selectionKey)}"]`;
    const targets = Array.from(
      viewport?.querySelectorAll<HTMLElement>(targetSelector) || [],
    );
    const target =
      targets.find((element) => element.getClientRects().length > 0) ||
      targets[0];

    if (!target) {
      setLayout(undefined);
      return;
    }

    const measure = () => {
      const style = window.getComputedStyle(target);
      const type = style.display.includes("flex")
        ? "flex"
        : style.display.includes("grid")
          ? "grid"
          : "flow";
      const children = Array.from(target.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const next: ComputedLayoutStructure = {
        type,
        direction: style.flexDirection.startsWith("column")
          ? "column"
          : "row",
        columns:
          type === "grid" ? countCssTracks(style.gridTemplateColumns) : 1,
        rows: type === "grid" ? countCssTracks(style.gridTemplateRows) : 1,
        gap: normalizeGap(style.gap),
        rowGap: normalizeGap(style.rowGap),
        columnGap: normalizeGap(style.columnGap),
        wrap: type === "flex" ? style.flexWrap : type === "grid" ? "rows" : "none",
        alignItems: normalizeCssValue(style.alignItems),
        justifyContent: normalizeCssValue(style.justifyContent),
        childCount: children.length,
        childTags: children.slice(0, 8).map((child) => child.tagName.toLowerCase()),
      };

      setLayout((current) => sameLayout(current, next) ? current : next);
    };

    measure();
    const measurement = createAnimationFrameScheduler(measure);
    const resizeObserver = new ResizeObserver(measurement.schedule);
    const mutationObserver = new MutationObserver(measurement.schedule);
    resizeObserver.observe(target);
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: true,
    });
    window.addEventListener("resize", measurement.schedule);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measurement.schedule);
      measurement.cancel();
    };
  }, [sectionId, selectionKey]);

  return layout;
}

function sameLayout(
  current: ComputedLayoutStructure | undefined,
  next: ComputedLayoutStructure,
) {
  if (!current) return false;
  return (
    current.type === next.type &&
    current.direction === next.direction &&
    current.columns === next.columns &&
    current.rows === next.rows &&
    current.gap === next.gap &&
    current.rowGap === next.rowGap &&
    current.columnGap === next.columnGap &&
    current.wrap === next.wrap &&
    current.alignItems === next.alignItems &&
    current.justifyContent === next.justifyContent &&
    current.childCount === next.childCount &&
    current.childTags.length === next.childTags.length &&
    current.childTags.every((tag, index) => tag === next.childTags[index])
  );
}

function countCssTracks(value: string) {
  if (!value || value === "none") return 1;
  let depth = 0;
  let tracks = 1;
  for (const character of value.trim()) {
    if (character === "(") depth += 1;
    if (character === ")") depth = Math.max(depth - 1, 0);
    if (character === " " && depth === 0) tracks += 1;
  }
  return Math.max(tracks, 1);
}

function normalizeGap(value: string) {
  return !value || value === "normal" ? "0px" : value;
}

function normalizeCssValue(value: string) {
  return !value || value === "normal" ? "default" : value;
}
