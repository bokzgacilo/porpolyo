import {
  ActionBar,
  Box,
  HStack,
  IconButton,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import {
  LuImagePlus,
  LuLayers,
  LuMousePointerClick,
  LuPanelTop,
  LuPlus,
  LuSquareDashed,
  LuType,
} from "react-icons/lu";
import {
  CustomLayerType,
  EditorPanelSize,
  Portfolio,
  PreviewMode,
  SelectedElement,
} from "../../types/portfolio";
import { breakpointWidth } from "../../config/breakpointSettings";
import { selectedElementKey } from "../../utils/elementSettings";
import { createAnimationFrameScheduler } from "../../utils/animationFrameScheduler";
import { PortfolioPreview } from "../PortfolioPreview";
import { findSelectedTarget } from "./editorSelectors";

const ActionBarContent =
  ActionBar.Content as React.ComponentType<
    React.PropsWithChildren & {
      className?: string;
      "data-editor-size"?: EditorPanelSize;
    }
  >;
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
  onSelect,
  panelSize,
  zoom,
  resetCanvasSignal,
  canInsertIntoSelection,
  canAddSection,
  addingTopLevelSection,
  insertionParentLabel,
  onZoomChange,
  onAddSection,
  onAddLayer,
}: {
  portfolio: Portfolio;
  selected?: SelectedElement;
  previewMode: PreviewMode;
  panReady: boolean;
  onSelect: (selection?: SelectedElement) => void;
  panelSize: EditorPanelSize;
  zoom: number;
  resetCanvasSignal: number;
  canInsertIntoSelection: boolean;
  canAddSection: boolean;
  addingTopLevelSection: boolean;
  insertionParentLabel?: string;
  onZoomChange: (zoom: number) => void;
  onAddSection: (
    type: "custom" | "projects" | "certifications" | "services" | "about",
  ) => void;
  onAddLayer: (type: CustomLayerType) => void;
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef<
    | { pointerId: number; x: number; y: number; panX: number; panY: number }
    | undefined
  >();
  const zoomRef = useRef(zoom);
  const previousResetSignal = useRef(resetCanvasSignal);
  const showStructureOverlay =
    portfolio.settings.editor?.showStructureOverlay ?? true;
  const showBoxModelOverlay =
    portfolio.settings.editor?.showBoxModelOverlay ?? true;

  const applyViewportTransform = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.style.setProperty("--canvas-pan-x", `${panRef.current.x}px`);
    viewport.style.setProperty("--canvas-pan-y", `${panRef.current.y}px`);
    viewport.style.setProperty("--canvas-zoom", String(zoomRef.current));
  };

  const updateZoom = (nextZoom: number) => {
    const clampedZoom = Math.min(Math.max(nextZoom, 0.1), 2);
    zoomRef.current = clampedZoom;
    applyViewportTransform();
    onZoomChange(clampedZoom);
  };

  useEffect(() => {
    zoomRef.current = zoom;
    applyViewportTransform();
  }, [zoom]);

  useEffect(() => {
    const onZoomShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        !!target.closest('input, textarea, select, [contenteditable="true"]');
      if (
        isTyping ||
        !(event.metaKey || event.ctrlKey || event.altKey)
      ) {
        return;
      }
      const zoomIn = event.key === "+" || event.key === "=";
      const zoomOut = event.key === "-" || event.key === "_";
      if (!zoomIn && !zoomOut) return;
      event.preventDefault();
      const direction = zoomIn ? 1 : -1;
      const nextZoom = Math.min(
        Math.max(zoomRef.current + direction * 0.1, 0.1),
        2,
      );
      updateZoom(Number(nextZoom.toFixed(2)));
    };

    window.addEventListener("keydown", onZoomShortcut);
    return () => window.removeEventListener("keydown", onZoomShortcut);
  }, [onZoomChange]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const zoomWithWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey || event.altKey)) return;
      event.preventDefault();
      event.stopPropagation();
      const factor = Math.exp(-event.deltaY * 0.002);
      const nextZoom = Math.min(
        Math.max(zoomRef.current * factor, 0.1),
        2,
      );
      zoomRef.current = Number(nextZoom.toFixed(2));
      applyViewportTransform();
      onZoomChange(zoomRef.current);
    };

    stage.addEventListener("wheel", zoomWithWheel, { passive: false });
    return () => stage.removeEventListener("wheel", zoomWithWheel);
  }, [onZoomChange]);

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

  useEffect(() => {
    if (previousResetSignal.current === resetCanvasSignal) return;
    previousResetSignal.current = resetCanvasSignal;
    resetToCenter();
  }, [resetCanvasSignal]);

  return (
    <Box
      as="section"
      ref={stageRef}
      h="full"
      minH="0"
      style={
        {
          "--canvas-width": breakpointWidth(
            previewMode,
            portfolio.settings.breakpointWidths,
          ),
        } as React.CSSProperties
      }
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
            <ActionBarContent
              className="editor-action-bar"
              data-editor-size={panelSize}
            >
              <HStack gap="1" data-canvas-control="true">
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <IconButton
                      aria-label={
                        addingTopLevelSection
                          ? "Add top-level section"
                          : "Add section inside selected element"
                      }
                      title={
                        addingTopLevelSection
                          ? "Add a top-level page section"
                          : canAddSection
                            ? `Add section inside ${insertionParentLabel || "selected element"}`
                            : "Select Body, a section, or a container to add a section"
                      }
                      disabled={!canAddSection}
                      size="xs"
                      variant="outline"
                    >
                      <LuPanelTop />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner data-canvas-control="true">
                      <Menu.Content>
                        {(
                          [
                            ["custom", "Blank section"],
                            ["projects", "Projects"],
                            ["certifications", "Certifications"],
                            ["services", "Services"],
                            ["about", "About"],
                          ] as const
                        ).map(([type, label]) => (
                          <Menu.Item
                            key={type}
                            value={type}
                            onSelect={() => onAddSection(type)}
                          >
                            <LuPlus /> {label}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <IconButton
                      aria-label="Add layer inside selected element"
                      title={
                        canInsertIntoSelection
                          ? `Add layer inside ${insertionParentLabel || "selected element"}`
                          : "Select a section or container to add a layer"
                      }
                      disabled={!canInsertIntoSelection}
                      size="xs"
                      variant="outline"
                    >
                      <LuLayers />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner data-canvas-control="true">
                      <Menu.Content>
                        <Menu.Item value="div" onSelect={() => onAddLayer("div")}>
                          <LuSquareDashed /> Div container
                        </Menu.Item>
                        <Menu.Item value="text" onSelect={() => onAddLayer("text")}>
                          <LuType /> Text
                        </Menu.Item>
                        <Menu.Item value="image" onSelect={() => onAddLayer("image")}>
                          <LuImagePlus /> Image
                        </Menu.Item>
                        <Menu.Item value="button" onSelect={() => onAddLayer("button")}>
                          <LuMousePointerClick /> Button
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </HStack>
            </ActionBarContent>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      <Box
        ref={viewportRef}
        className="canvas-viewport"
        data-show-structure-overlay={showStructureOverlay}
      >
        <BoxModelOverlay
          selected={selected}
          viewportRef={viewportRef}
          zoom={zoom}
          previewMode={previewMode}
          showStructure={showStructureOverlay}
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
  showStructure,
  showBoxModel,
}: {
  selected?: SelectedElement;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  previewMode: PreviewMode;
  showStructure: boolean;
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
    if (
      !viewport ||
      !selected ||
      !sectionId ||
      !selectionKey ||
      (!showStructure && !showBoxModel)
    ) {
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

    const measurement = createAnimationFrameScheduler(update);
    const resizeObserver = new ResizeObserver(measurement.schedule);
    const mutationObserver = new MutationObserver(measurement.schedule);
    resizeObserver.observe(target);
    resizeObserver.observe(viewport);
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
  }, [
    previewMode,
    sectionId,
    selectionKey,
    showBoxModel,
    showStructure,
    viewportRef,
    zoom,
  ]);

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
      {showStructure && (
        <OverlayLayer
          rect={rects.content}
          className="box-model-overlay-content"
        />
      )}
    </Box>
  );
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
