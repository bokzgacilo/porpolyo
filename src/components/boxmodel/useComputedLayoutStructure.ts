import { useEffect, useState } from "react";
import type { SelectedElement } from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";

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
  renderState: unknown,
) {
  const [layout, setLayout] = useState<ComputedLayoutStructure>();

  useEffect(() => {
    if (!selected || selected.kind === "head" || selected.kind === "body") {
      setLayout(undefined);
      return;
    }

    const selectionKey = selectedElementKey(selected);
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-editor-selection-key]"),
    ).filter(
      (element) =>
        element.dataset.editorSectionId === selected.sectionId &&
        element.dataset.editorSelectionKey === selectionKey,
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

      setLayout((current) =>
        current && JSON.stringify(current) === JSON.stringify(next)
          ? current
          : next,
      );
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    const mutationObserver = new MutationObserver(measure);
    resizeObserver.observe(target);
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: true,
    });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selected, renderState]);

  return layout;
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
