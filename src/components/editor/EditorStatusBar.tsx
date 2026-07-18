import {
  Box,
  HStack,
  IconButton,
  NativeSelect,
  Popover,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuArrowLeft, LuHistory, LuSettings, LuSquareDot } from "react-icons/lu";
import {
  useLayoutEffect,
  useState,
  type ComponentType,
  type PropsWithChildren,
} from "react";
import type { EditorHistoryEntry } from "../../store/editorStore";
import type {
  EditorPanelSize,
  Portfolio,
  PreviewMode,
  SelectedElement,
} from "../../types/portfolio";
import { ColorModeButton } from "../ui/color-mode";
import { EditorTourButton } from "./EditorTourButton";
import { HistoryPanel } from "./HistoryPanel";
import { selectedSelectorPath } from "./editorSelectors";

const zoomOptions = [0.1, 0.2, 0.5, 0.75, 1, 1.25, 1.5, 2];
const PopoverTrigger = Popover.Trigger as ComponentType<
  PropsWithChildren<{ asChild?: boolean }>
>;
const PopoverPositioner = Popover.Positioner as ComponentType<PropsWithChildren>;

export function EditorStatusBar({
  portfolio,
  selected,
  alwaysOpenTour,
  panelSize,
  previewMode,
  zoom,
  history,
  currentHistoryLabel,
  onBack,
  onSettings,
  onStartTour,
  onPanelSizeChange,
  onPreviewModeChange,
  onZoomChange,
  onResetCanvas,
  onRestoreHistory,
}: {
  portfolio: Portfolio;
  selected?: SelectedElement;
  alwaysOpenTour: boolean;
  panelSize: EditorPanelSize;
  previewMode: PreviewMode;
  zoom: number;
  history: EditorHistoryEntry[];
  currentHistoryLabel: string;
  onBack: () => void;
  onSettings: () => void;
  onStartTour: () => void;
  onPanelSizeChange: (panelSize: EditorPanelSize) => void;
  onPreviewModeChange: (previewMode: PreviewMode) => void;
  onZoomChange: (zoom: number) => void;
  onResetCanvas: () => void;
  onRestoreHistory: (entryId: string) => void;
}) {
  const [selectorPath, setSelectorPath] = useState("No selection");
  const [historyOpen, setHistoryOpen] = useState(false);
  const selectionIdentity = selected
    ? "sectionId" in selected
      ? `${selected.sectionId}:${JSON.stringify(selected)}`
      : selected.kind
    : "none";

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const viewport = document.querySelector<HTMLElement>(".canvas-viewport");
      setSelectorPath(
        selectedSelectorPath(viewport, selected, portfolio.sections),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [portfolio.sections, selected, selectionIdentity]);

  return (
    <HStack
      as="footer"
      aria-label="Editor status bar"
      bg="blue.solid"
      color="white"
      borderTop="1px solid"
      borderTopColor="blue.emphasized"
      flex="0 0 28px"
      h="28px"
      minW="0"
      justify="space-between"
      px="1"
      gap="2"
      zIndex="docked"
    >
      <IconButton
        aria-label="Back to dashboard"
        title="Back to dashboard"
        onClick={onBack}
        size="xs"
        variant="ghost"
        rounded={0}
        color="white"
        flexShrink={0}
        _hover={{ bg: "whiteAlpha.300" }}
      >
        <LuArrowLeft size={14} />
      </IconButton>

      <Box minW="0" flex="1" overflowX="auto" scrollbar="hidden">
        <Text
          as="code"
          display="block"
          px="2"
          fontFamily="mono"
          fontSize="11px"
          lineHeight="28px"
          whiteSpace="nowrap"
          title={selectorPath}
          aria-label={`Selected element: ${selectorPath}`}
        >
          {selectorPath}
        </Text>
      </Box>

      <HStack flexShrink={0} gap="0" h="full">
        <NativeSelect.Root
          size="xs"
          width="88px"
          h="26px"
          minH="0"
          color="white"
        >
          <NativeSelect.Field
            aria-label="Editor panel size"
            title="Editor panel size"
            value={panelSize}
            bg="transparent"
            border="0"
            color="white"
            fontSize="11px"
            h="26px"
            minH="0"
            py="0"
            rounded="0"
            css={statusSelectCss}
            onChange={(event) =>
              onPanelSizeChange(event.target.value as EditorPanelSize)
            }
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator color="white" h="26px" />
        </NativeSelect.Root>

        <NativeSelect.Root
          size="xs"
          width="104px"
          h="26px"
          minH="0"
          color="white"
        >
          <NativeSelect.Field
            outline="none"
            aria-label="Preview breakpoint"
            title="Preview breakpoint"
            value={previewMode}
            bg="transparent"
            border="0"
            color="white"
            fontSize="11px"
            h="26px"
            minH="0"
            py="0"
            rounded="0"
            css={statusSelectCss}
            onChange={(event) =>
              onPreviewModeChange(event.target.value as PreviewMode)
            }
          >
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator color="white" h="26px" />
        </NativeSelect.Root>

        <NativeSelect.Root
          size="xs"
          width="82px"
          h="26px"
          minH="0"
          color="white"
        >
          <NativeSelect.Field
            aria-label="Canvas zoom"
            title="Canvas zoom · pinch or Ctrl/Cmd/Alt + wheel"
            value={
              zoomOptions.some((option) => Math.abs(option - zoom) < 0.005)
                ? String(zoom)
                : "custom"
            }
            bg="transparent"
            border="0"
            color="white"
            fontSize="11px"
            h="26px"
            minH="0"
            py="0"
            rounded="0"
            css={statusSelectCss}
            onChange={(event) => {
              if (event.target.value !== "custom") {
                onZoomChange(Number(event.target.value));
              }
            }}
          >
            {!zoomOptions.some((option) => Math.abs(option - zoom) < 0.005) && (
              <option value="custom">{Math.round(zoom * 100)}%</option>
            )}
            {zoomOptions.map((option) => (
              <option key={option} value={option}>
                {Math.round(option * 100)}%
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator color="white" h="26px" />
        </NativeSelect.Root>

        <IconButton
          aria-label="Center canvas and zoom to fit"
          title="Center canvas and zoom to fit"
          onClick={onResetCanvas}
          size="xs"
          variant="ghost"
          rounded={0}
          color="white"
          _hover={{ bg: "whiteAlpha.300" }}
        >
          <LuSquareDot size={14} />
        </IconButton>
        <Popover.Root
          open={historyOpen}
          onOpenChange={(details) => setHistoryOpen(details.open)}
          positioning={{ placement: "top-end", offset: { mainAxis: 8 } }}
        >
          <PopoverTrigger asChild>
            <IconButton
              aria-label={`Open edit history. ${history.length} saved ${history.length === 1 ? "change" : "changes"}.`}
              title="Edit history"
              size="xs"
              variant="ghost"
              rounded={0}
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            >
              <LuHistory size={14} />
            </IconButton>
          </PopoverTrigger>
          <Portal>
            <PopoverPositioner>
              <Popover.Content
                width="320px"
                maxW="calc(100vw - 24px)"
                maxH="min(420px, calc(100vh - 48px))"
                overflow="hidden"
                p={0}
                aria-label="Edit history"
              >
                <HStack
                  justify="space-between"
                  px={3}
                  py={2.5}
                  borderBottom="1px solid"
                  borderBottomColor="border"
                >
                  <HStack gap={2}>
                    <LuHistory />
                    <Text fontWeight="semibold">History</Text>
                  </HStack>
                  <Text color="fg.muted" fontSize="xs">
                    Last five changes
                  </Text>
                </HStack>
                <Box overflowY="auto" maxH="min(370px, calc(100vh - 96px))">
                  <HistoryPanel
                    history={history}
                    currentLabel={currentHistoryLabel}
                    onRestore={(entryId) => {
                      onRestoreHistory(entryId);
                      setHistoryOpen(false);
                    }}
                  />
                </Box>
              </Popover.Content>
            </PopoverPositioner>
          </Portal>
        </Popover.Root>
        <EditorTourButton
          alwaysOpen={alwaysOpenTour}
          onBeforeStart={onStartTour}
          size="xs"
          color="white"
          _hover={{ bg: "whiteAlpha.300" }}
        />
        <ColorModeButton
          size="xs"
          variant="ghost"
          rounded={0}
          color="white"
          _hover={{ bg: "whiteAlpha.300" }}
        />
        <IconButton
          aria-label="Project settings"
          title="Project settings"
          onClick={onSettings}
          size="xs"
          variant="ghost"
          rounded={0}
          color="white"
          _hover={{ bg: "whiteAlpha.300" }}
        >
          <LuSettings size={14} />
        </IconButton>
      </HStack>
    </HStack>
  );
}

const statusSelectCss = {
  "& option": {
    background: "white",
    color: "black",
  },
};
