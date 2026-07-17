import {
  ActionBar,
  Box,
  Button,
  HStack,
  NativeSelect,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import { LuShare, LuTrash } from "react-icons/lu";
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
  pan,
  zoom,
  panning,
  onPanChange,
  onZoomChange,
  onPreviewModeChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSelect,
}: {
  portfolio: Portfolio;
  selected?: SelectedElement;
  previewMode: PreviewMode;
  pan: { x: number; y: number };
  zoom: number;
  panning: boolean;
  onPanChange: (pan: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onSelect: (selection: SelectedElement) => void;
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const fitWholePage = () => {
    const stage = stageRef.current;
    const site =
      viewportRef.current?.querySelector<HTMLElement>(".portfolio-site");
    if (!stage || !site) return;

    const availableWidth = Math.max(stage.clientWidth - 56, 1);
    const availableHeight = Math.max(stage.clientHeight - 96, 1);
    const targetWidth = Math.max(site.offsetWidth, 1);
    const targetHeight = Math.max(site.scrollHeight, 1);
    const fittedZoom = Math.min(
      availableWidth / targetWidth,
      availableHeight / targetHeight,
      1,
    );

    onPanChange({ x: 0, y: 0 });
    onZoomChange(Number(fittedZoom.toFixed(2)));
  };

  const resetToCenter = () => {
    const stage = stageRef.current;

    onPanChange({ x: 0, y: 0 });
    if (stage) {
      stage.scrollTo({
        left: Math.max((stage.scrollWidth - stage.clientWidth) / 2, 0),
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const selectedZoom = zoomOptions.find(
    (option) => Math.abs(zoom - option.value) < 0.005,
  )?.value;

  return (
    <Box
      as="section"
      ref={stageRef}
      className={`canvas-stage ${previewMode} ${panning ? "panning" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <ActionBar.Root open={true}>
        <Portal>
          <ActionBar.Positioner zIndex="max">
            <ActionBarContent>
              <Text>{selectedLabel(selected, portfolio.sections)}</Text>
              <ActionBar.Separator />
              <HStack gap="2" data-canvas-control="true">
                <NativeSelect.Root size="xs" width="120px">
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
                <NativeSelect.Root size="xs" width="150px">
                  <NativeSelect.Field
                    aria-label="Canvas zoom"
                    value={
                      selectedZoom !== undefined
                        ? String(selectedZoom)
                        : "custom"
                    }
                    onChange={(event) => {
                      if (event.target.value === "fit") {
                        fitWholePage();
                        return;
                      }
                      if (event.target.value !== "custom") {
                        onZoomChange(Number(event.target.value));
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
                <Button onClick={resetToCenter} size="xs" variant="outline">
                  Reset center
                </Button>
              </HStack>
            </ActionBarContent>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
      <Box
        ref={viewportRef}
        className="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        <BoxModelOverlay
          portfolio={portfolio}
          selected={selected}
          viewportRef={viewportRef}
          zoom={zoom}
          pan={pan}
          previewMode={previewMode}
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
  portfolio,
  selected,
  viewportRef,
  zoom,
  pan,
  previewMode,
}: {
  portfolio: Portfolio;
  selected?: SelectedElement;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  pan: { x: number; y: number };
  previewMode: PreviewMode;
}) {
  const [rects, setRects] = useState<BoxModelRects>();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !selected || !("sectionId" in selected)) {
      setRects(undefined);
      return;
    }

    const key = selectedElementKey(selected);
    const target = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-editor-selection-key]"),
    ).find(
      (element) =>
        element.dataset.editorSectionId === selected.sectionId &&
        element.dataset.editorSelectionKey === key,
    );

    if (!target) {
      setRects(undefined);
      return;
    }

    const update = () => setRects(measureBoxModel(target, viewport, zoom));
    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(target);
    resizeObserver.observe(viewport);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pan.x, pan.y, portfolio, previewMode, selected, viewportRef, zoom]);

  if (!rects) return null;

  return (
    <Box className="canvas-box-model-overlay" aria-hidden="true">
      <OverlayLayer rect={rects.margin} className="box-model-overlay-margin" />
      <OverlayLayer
        rect={rects.padding}
        className="box-model-overlay-padding"
      />
      <OverlayLayer
        rect={rects.content}
        className="box-model-overlay-content"
      />
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
