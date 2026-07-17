import { useEffect, useState } from "react";
import type { BoxSpacing, SelectedElement } from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";

export type ComputedBoxModel = {
  margin: Required<BoxSpacing>;
  padding: Required<BoxSpacing>;
  borderWidth: number;
};

export function useComputedBoxModel(
  selected: SelectedElement | null | undefined,
  renderState: unknown,
) {
  const [boxModel, setBoxModel] = useState<ComputedBoxModel>();

  useEffect(() => {
    if (!selected || selected.kind === "head" || selected.kind === "body") {
      setBoxModel(undefined);
      return;
    }

    const selectionKey = selectedElementKey(selected);
    const target = Array.from(
      document.querySelectorAll<HTMLElement>("[data-editor-selection-key]"),
    ).find(
      (element) =>
        element.dataset.editorSectionId === selected.sectionId &&
        element.dataset.editorSelectionKey === selectionKey,
    );

    if (!target) {
      setBoxModel(undefined);
      return;
    }

    const measure = () => {
      const style = window.getComputedStyle(target);
      const next: ComputedBoxModel = {
        margin: {
          top: cssPixels(style.marginTop),
          right: cssPixels(style.marginRight),
          bottom: cssPixels(style.marginBottom),
          left: cssPixels(style.marginLeft),
        },
        padding: {
          top: cssPixels(style.paddingTop),
          right: cssPixels(style.paddingRight),
          bottom: cssPixels(style.paddingBottom),
          left: cssPixels(style.paddingLeft),
        },
        borderWidth: cssPixels(style.borderTopWidth),
      };

      setBoxModel((current) => (sameBoxModel(current, next) ? current : next));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    const mutationObserver = new MutationObserver(measure);
    resizeObserver.observe(target);
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selected, renderState]);

  return boxModel;
}

export function resolveBoxSpacing(
  saved?: BoxSpacing,
  computed?: BoxSpacing,
): BoxSpacing {
  return {
    top: saved?.top ?? computed?.top ?? 0,
    right: saved?.right ?? computed?.right ?? 0,
    bottom: saved?.bottom ?? computed?.bottom ?? 0,
    left: saved?.left ?? computed?.left ?? 0,
  };
}

function cssPixels(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function sameBoxModel(
  current: ComputedBoxModel | undefined,
  next: ComputedBoxModel,
) {
  if (!current || current.borderWidth !== next.borderWidth) return false;
  return (["top", "right", "bottom", "left"] as const).every(
    (side) =>
      current.margin[side] === next.margin[side] &&
      current.padding[side] === next.padding[side],
  );
}
