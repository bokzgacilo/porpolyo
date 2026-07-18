import { useEffect, useState } from "react";
import type { BoxSpacing, SelectedElement } from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";
import { createAnimationFrameScheduler } from "../../utils/animationFrameScheduler";

export type ComputedBoxModel = {
  margin: BoxSpacing & Required<Pick<BoxSpacing, "top" | "right" | "bottom" | "left">>;
  padding: BoxSpacing & Required<Pick<BoxSpacing, "top" | "right" | "bottom" | "left">>;
  borderWidth: number;
  width: number;
  height: number;
  minHeight?: number;
};

export function useComputedBoxModel(
  selected: SelectedElement | null | undefined,
) {
  const [boxModel, setBoxModel] = useState<ComputedBoxModel>();
  const sectionId =
    selected && "sectionId" in selected ? selected.sectionId : undefined;
  const selectionKey =
    selected && selected.kind !== "head" && selected.kind !== "body"
      ? selectedElementKey(selected)
      : undefined;

  useEffect(() => {
    if (!sectionId || !selectionKey) {
      setBoxModel(undefined);
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
        width: roundedPixels(target.offsetWidth),
        height: roundedPixels(target.offsetHeight),
        minHeight: optionalPositivePixels(style.minHeight),
      };

      setBoxModel((current) => (sameBoxModel(current, next) ? current : next));
    };

    measure();
    const measurement = createAnimationFrameScheduler(measure);
    const resizeObserver = new ResizeObserver(measurement.schedule);
    const mutationObserver = new MutationObserver(measurement.schedule);
    resizeObserver.observe(target);
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("resize", measurement.schedule);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measurement.schedule);
      measurement.cancel();
    };
  }, [sectionId, selectionKey]);

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
    unit: saved?.unit || "px",
  };
}

function cssPixels(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function roundedPixels(value: number) {
  return Math.round(value * 100) / 100;
}

function optionalPositivePixels(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0
    ? roundedPixels(parsed)
    : undefined;
}

function sameBoxModel(
  current: ComputedBoxModel | undefined,
  next: ComputedBoxModel,
) {
  if (
    !current ||
    current.borderWidth !== next.borderWidth ||
    current.width !== next.width ||
    current.height !== next.height ||
    current.minHeight !== next.minHeight
  ) {
    return false;
  }
  return (["top", "right", "bottom", "left"] as const).every(
    (side) =>
      current.margin[side] === next.margin[side] &&
      current.padding[side] === next.padding[side],
  );
}
