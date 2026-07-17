import {
  ActionBar,
  Box,
  HStack,
  IconButton,
  NativeSelect,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { LuShare, LuSquareDot, LuTrash } from "react-icons/lu";
import { Portfolio, PreviewMode, SelectedElement } from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";
import { PortfolioPreview } from "../PortfolioPreview";
import { selectedLabel } from "./layerHelpers";

const ActionBarContent =
  ActionBar.Content as React.ComponentType<React.PropsWithChildren>;
const zoomOptions = [
  { label: "10%", value: 0.1 },
  { label: "20%", value: 0.2 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

type OverlayRect = { x: number; y: number; width: number; height: number };
type BoxModelRects = {
  margin: OverlayRect;
  padding: OverlayRect;
  content: OverlayRect;
};

export function CanvasStage({
  portfolio,
  selected,
  previewMode,
  panReady,
  onPreviewModeChange,
  onSelect,
}: {
  portfolio: Portfolio;
  selected?: SelectedElement;
  previewMode: PreviewMode;
  panReady: boolean;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onSelect: (selection?: SelectedElement) => void;
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef<
    | { pointerId: number; x: number; y: number; panX: number; panY: number }
    | undefined
  >();
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [htmlSelector, setHtmlSelector] = useState("—");
  const selectedDomIdentity = selected
    ? "sectionId" in selected
      ? `${selected.sectionId}:${selectedElementKey(selected)}`
      : selected.kind
    : "none";
  const showBoxModelOverlay =
    portfolio.settings.editor?.showBoxModelOverlay ?? true;

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHtmlSelector(
        resolveHtmlSelector(viewportRef.current, selected, portfolio.sections),
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [previewMode, selectedDomIdentity]);

  const applyViewportTransform = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.style.setProperty("--canvas-pan-x", `${panRef.current.x}px`);
    viewport.style.setProperty("--canvas-pan-y", `${panRef.current.y}px`);
    viewport.style.setProperty("--canvas-zoom", String(zoomRef.current));
  };

  const updateZoom = (nextZoom: number) => {
    zoomRef.current = nextZoom;
    applyViewportTransform();
    setZoom(nextZoom);
  };

  const startPan = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const isCanvasControl = !!target.closest('[data-canvas-control="true"]');
    const isPortfolio = !!target.closest(".portfolio-site");

    if (!isCanvasControl && !isPortfolio) onSelect(undefined);
    if (isCanvasControl || (isPortfolio && !panReady)) return;

    if (panReady) event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("panning");
    panStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
  };

  const movePan = (event: React.PointerEvent<HTMLElement>) => {
    const start = panStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    panRef.current = {
      x: start.panX + event.clientX - start.x,
      y: start.panY + event.clientY - start.y,
    };
    applyViewportTransform();
  };

  const endPan = (event: React.PointerEvent<HTMLElement>) => {
    if (panStartRef.current?.pointerId !== event.pointerId) return;
    panStartRef.current = undefined;
    event.currentTarget.classList.remove("panning");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resetToCenter = () => {
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const site = viewport?.querySelector<HTMLElement>(".portfolio-site");
    if (!stage || !viewport || !site) return;

    const availableWidth = Math.max(stage.clientWidth - 56, 1);
    const availableHeight = Math.max(stage.clientHeight - 96, 1);
    const targetWidth = Math.max(site.offsetWidth, 1);
    const targetHeight = Math.max(site.scrollHeight, 1);
    const fittedZoom = Math.min(
      availableWidth / targetWidth,
      availableHeight / targetHeight,
      1,
    );

    viewport.style.setProperty("transition", "none");
    panRef.current = { x: 0, y: 0 };
    updateZoom(Number(fittedZoom.toFixed(2)));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        stage.scrollTo({
          left: Math.max((stage.scrollWidth - stage.clientWidth) / 2, 0),
          top: 0,
          behavior: "auto",
        });
        viewport.style.removeProperty("transition");
      });
    });
  };

  const selectedZoom = zoomOptions.find(
    (option) => Math.abs(zoom - option.value) < 0.005,
  )?.value;

  return (
    <Box
      as="section"
      ref={stageRef}
      className={`canvas-stage ${previewMode} ${panReady ? "pan-ready" : ""}`}
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onLostPointerCapture={endPan}
    >
      <ActionBar.Root open={true}>
        <Portal>
          <ActionBar.Positioner zIndex="popover">
            <ActionBarContent>
              <Text fontSize="xs">
                {selectedLabel(selected, portfolio.sections)}
              </Text>
              <ActionBar.Separator />
              <Text
                as="code"
                maxW="210px"
                rounded="sm"
                bg="bg.subtle"
                color="fg.muted"
                fontFamily="mono"
                fontSize="xs"
                whiteSpace="nowrap"
                truncate
                title={htmlSelector}
                aria-label={`Selected HTML selector: ${htmlSelector}`}
              >
                {htmlSelector}
              </Text>
              <ActionBar.Separator />
              <HStack gap="2" data-canvas-control="true">
                <NativeSelect.Root size="xs" width="128px">
                  <NativeSelect.Field
                    aria-label="Preview breakpoint"
                    value={previewMode}
                    onChange={(event) =>
                      onPreviewModeChange(event.target.value as PreviewMode)
                    }
                  >
                    <option value="desktop">Desktop</option>
                    <option value="tablet">Tablet</option>
                    <option value="mobile">Mobile</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <NativeSelect.Root size="xs" width="128px">
                  <NativeSelect.Field
                    aria-label="Canvas zoom"
                    value={
                      selectedZoom !== undefined
                        ? String(selectedZoom)
                        : "custom"
                    }
                    onChange={(event) => {
                      if (event.target.value === "fit") {
                        resetToCenter();
                        return;
                      }
                      if (event.target.value !== "custom") {
                        updateZoom(Number(event.target.value));
                      }
                    }}
                  >
                    {selectedZoom === undefined && (
                      <option value="custom">{Math.round(zoom * 100)}%</option>
                    )}
                    {zoomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="fit">Fit whole page</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <IconButton
                  aria-label="Center canvas and zoom to fit"
                  title="Center canvas and zoom to fit"
                  onClick={resetToCenter}
                  size="xs"
                  variant="outline"
                >
                  <LuSquareDot />
                </IconButton>
              </HStack>
            </ActionBarContent>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      <Box
        ref={viewportRef}
        className="canvas-viewport"
      >
        <BoxModelOverlay
          selected={selected}
          viewportRef={viewportRef}
          zoom={zoom}
          previewMode={previewMode}
          showBoxModel={showBoxModelOverlay}
        />
        <PortfolioPreview
          portfolio={portfolio}
          selected={selected}
          onSelect={onSelect}
          editable
        />
      </Box>
    </Box>
  );
}

function BoxModelOverlay({
  selected,
  viewportRef,
  zoom,
  previewMode,
  showBoxModel,
}: {
  selected?: SelectedElement;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  previewMode: PreviewMode;
  showBoxModel: boolean;
}) {
  const [rects, setRects] = useState<BoxModelRects>();
  const sectionId =
    selected && "sectionId" in selected ? selected.sectionId : undefined;
  const selectionKey =
    selected && selected.kind !== "head" && selected.kind !== "body"
      ? selectedElementKey(selected)
      : undefined;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !selected || !sectionId || !selectionKey) {
      setRects(undefined);
      return;
    }

    const target = findSelectedTarget(viewport, selected);

    if (!target) {
      setRects(undefined);
      return;
    }

    const update = () => setRects(measureBoxModel(target, viewport, zoom));
    update();

    const resizeObserver = new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);
    resizeObserver.observe(target);
    resizeObserver.observe(viewport);
    mutationObserver.observe(target, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [previewMode, sectionId, selectionKey, viewportRef, zoom]);

  if (!rects) return null;

  return (
    <Box className="canvas-box-model-overlay" aria-hidden="true">
      {showBoxModel && (
        <>
          <OverlayLayer
            rect={rects.margin}
            className="box-model-overlay-margin"
          />
          <OverlayLayer
            rect={rects.padding}
            className="box-model-overlay-padding"
          />
        </>
      )}
      <OverlayLayer
        rect={rects.content}
        className="box-model-overlay-content"
      />
    </Box>
  );
}

function findSelectedTarget(viewport: HTMLElement, selected: SelectedElement) {
  if (!("sectionId" in selected)) return undefined;
  const key = selectedElementKey(selected);
  const targetSelector = `[data-editor-section-id="${CSS.escape(selected.sectionId)}"][data-editor-selection-key="${CSS.escape(key)}"]`;
  const matchingTargets = Array.from(
    viewport.querySelectorAll<HTMLElement>(targetSelector),
  );

  return (
    matchingTargets.find((element) => element.getClientRects().length > 0) ||
    matchingTargets[0]
  );
}

function resolveHtmlSelector(
  viewport: HTMLElement | null,
  selected: SelectedElement | undefined,
  sections: Portfolio["sections"],
) {
  if (!selected) return "—";
  if (selected.kind === "head" || selected.kind === "body") {
    return selected.kind;
  }

  const selectedTarget = viewport
    ? findSelectedTarget(viewport, selected)
    : undefined;
  const target =
    selected.kind === "image"
      ? selectedTarget?.querySelector<HTMLElement>("img") || selectedTarget
      : selectedTarget;
  const tagName =
    selected.kind === "image"
      ? "img"
      : target?.tagName.toLowerCase() || fallbackTagName(selected, sections);
  const id = target?.id || semanticSelectorId(selected, sections);

  return id ? `${tagName}#${id}` : tagName;
}

function fallbackTagName(
  selected: SelectedElement,
  sections: Portfolio["sections"],
) {
  if (selected.kind === "section") {
    const type = sections.find((item) => item.id === selected.sectionId)?.type;
    if (type === "header" || type === "footer") return type;
    return "section";
  }
  if (selected.kind === "image") return "img";
  if (selected.kind === "text") {
    if (selected.field === "headline") return "h1";
    if (selected.field === "title") return "h2";
    if (selected.field === "contactButton") return "a";
    if (selected.field === "description") return "p";
    return "span";
  }
  if (selected.kind === "layer") {
    return selected.layerId.startsWith("navigation-link:") ? "a" : "div";
  }
  return "article";
}

function semanticSelectorId(
  selected: SelectedElement,
  sections: Portfolio["sections"],
) {
  if (!("sectionId" in selected)) return "";
  const section = sections.find((item) => item.id === selected.sectionId);
  const sectionName = section?.type || "element";

  if (selected.kind === "section") return sectionName;
  if (selected.kind === "image") return normalizeSelectorId(selected.slot);
  if (selected.kind === "text") {
    if (selected.field === "logoText") {
      return sectionName === "footer" ? "footer-name" : `${sectionName}-logo`;
    }
    return `${sectionName}-${normalizeSelectorId(selected.field)}`;
  }
  if (selected.kind === "layer") {
    if (selected.layerId.startsWith("navigation-link:")) {
      const targetId = selected.layerId.slice("navigation-link:".length);
      const targetSection = sections.find((item) => item.id === targetId);
      return `navigation-${targetSection?.type || "link"}`;
    }
    return normalizeSelectorId(selected.layerId);
  }
  if (selected.kind === "project") return "project-card";
  if (selected.kind === "certification") return "certification-card";
  return "service-card";
}

function normalizeSelectorId(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function OverlayLayer({
  rect,
  className,
}: {
  rect: OverlayRect;
  className: string;
}) {
  return (
    <Box
      className={className}
      style={{
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${Math.max(rect.width, 0)}px`,
        height: `${Math.max(rect.height, 0)}px`,
      }}
    />
  );
}

function measureBoxModel(
  target: HTMLElement,
  viewport: HTMLElement,
  fallbackScale: number,
): BoxModelRects {
  const targetRect = target.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  const scale =
    viewport.offsetWidth > 0
      ? viewportRect.width / viewport.offsetWidth
      : fallbackScale || 1;
  const computed = window.getComputedStyle(target);
  const borderLeft = cssPixels(computed.borderLeftWidth);
  const borderRight = cssPixels(computed.borderRightWidth);
  const borderTop = cssPixels(computed.borderTopWidth);
  const borderBottom = cssPixels(computed.borderBottomWidth);
  const paddingLeft = cssPixels(computed.paddingLeft);
  const paddingRight = cssPixels(computed.paddingRight);
  const paddingTop = cssPixels(computed.paddingTop);
  const paddingBottom = cssPixels(computed.paddingBottom);
  const marginLeft = cssPixels(computed.marginLeft);
  const marginRight = cssPixels(computed.marginRight);
  const marginTop = cssPixels(computed.marginTop);
  const marginBottom = cssPixels(computed.marginBottom);
  const x = (targetRect.left - viewportRect.left) / scale;
  const y = (targetRect.top - viewportRect.top) / scale;
  const width = targetRect.width / scale;
  const height = targetRect.height / scale;

  return {
    margin: {
      x: x - marginLeft,
      y: y - marginTop,
      width: width + marginLeft + marginRight,
      height: height + marginTop + marginBottom,
    },
    padding: {
      x: x + borderLeft,
      y: y + borderTop,
      width: width - borderLeft - borderRight,
      height: height - borderTop - borderBottom,
    },
    content: {
      x: x + borderLeft + paddingLeft,
      y: y + borderTop + paddingTop,
      width: width - borderLeft - borderRight - paddingLeft - paddingRight,
      height: height - borderTop - borderBottom - paddingTop - paddingBottom,
    },
  };
}

function cssPixels(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
