import { DragEndEvent } from "@dnd-kit/core";
import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "../store/editorStore";
import { SelectedElement } from "../types/portfolio";
import { findCustomLayer } from "../utils/customLayers";
import { selectedElementKey } from "../utils/elementSettings";
import { PropertiesPanel } from "./PropertiesPanel";
import { CanvasStage } from "./editor/CanvasStage";
import { EditorToolbar } from "./editor/EditorToolbar";
import { HeadMetadataEditor } from "./editor/HeadMetadataEditor";
import { StructurePanel } from "./editor/StructurePanel";
import { isNativeContainerLayerId } from "./editor/layerHelpers";

export function Editor({
  onSave,
  onPreview,
  onSettings,
  onPublish,
}: {
  onSave: () => void;
  onPreview: () => void;
  onSettings: () => void;
  onPublish: () => void;
}) {
  const {
    portfolio,
    selected,
    previewMode,
    unsaved,
    history,
    currentHistoryLabel,
  } = useEditorStore(
    useShallow((state) => ({
      portfolio: state.portfolio,
      selected: state.selected,
      previewMode: state.previewMode,
      unsaved: state.unsaved,
      history: state.history,
      currentHistoryLabel: state.currentHistoryLabel,
    })),
  );
  const {
    setPreviewMode,
    updateSection,
    reorderSections,
    duplicateSection,
    deleteSection,
    addSection,
    addCollectionItem,
    deleteCollectionItem,
    duplicateCollectionItem,
    reorderCollectionItems,
    addCustomLayer,
    deleteCustomLayer,
    duplicateCustomLayer,
    reorderCustomLayers,
    moveCustomLayerToContainer,
    undo,
    redo,
    restoreHistory,
    select,
    updateElementSettings,
  } = useEditorStore(
    useShallow((state) => ({
      setPreviewMode: state.setPreviewMode,
      updateSection: state.updateSection,
      reorderSections: state.reorderSections,
      duplicateSection: state.duplicateSection,
      deleteSection: state.deleteSection,
      addSection: state.addSection,
      addCollectionItem: state.addCollectionItem,
      deleteCollectionItem: state.deleteCollectionItem,
      duplicateCollectionItem: state.duplicateCollectionItem,
      reorderCollectionItems: state.reorderCollectionItems,
      addCustomLayer: state.addCustomLayer,
      deleteCustomLayer: state.deleteCustomLayer,
      duplicateCustomLayer: state.duplicateCustomLayer,
      reorderCustomLayers: state.reorderCustomLayers,
      moveCustomLayerToContainer: state.moveCustomLayerToContainer,
      undo: state.undo,
      redo: state.redo,
      restoreHistory: state.restoreHistory,
      select: state.select,
      updateElementSettings: state.updateElementSettings,
    })),
  );
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>(
    {},
  );
  const [bodyExpanded, setBodyExpanded] = useState(true);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [canvasTrackWidth, setCanvasTrackWidth] = useState(900);

  const editorSettings = portfolio?.settings.editor || {};
  const propertiesPanelMinWidth = editorSettings.propertiesPanelMinWidth ?? 280;
  const propertiesPanelMaxWidth = editorSettings.propertiesPanelMaxWidth ?? 520;
  const propertiesPanelWidth = clamp(
    editorSettings.propertiesPanelWidth ?? 340,
    propertiesPanelMinWidth,
    propertiesPanelMaxWidth,
  );
  const leftPanelWidth = leftPanelCollapsed ? 48 : 280;

  useEffect(() => {
    const updateCanvasTrackWidth = () => {
      setCanvasTrackWidth(
        Math.max(
          window.innerWidth - leftPanelWidth - propertiesPanelWidth,
          520,
        ),
      );
    };
    updateCanvasTrackWidth();
    window.addEventListener("resize", updateCanvasTrackWidth);
    return () => window.removeEventListener("resize", updateCanvasTrackWidth);
  }, [leftPanelWidth, propertiesPanelWidth]);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest('input, textarea, select, [contenteditable="true"]');

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.code === "Space") {
        event.preventDefault();
        setSpacePressed(true);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        select(undefined);
        return;
      }
      if (
        !event.repeat &&
        (event.key === "Delete" || event.key === "Backspace") &&
        selected &&
        "sectionId" in selected
      ) {
        let removed = false;
        if (selected.kind === "section") {
          deleteSection(selected.sectionId);
          removed = true;
        } else if (
          selected.kind === "project" ||
          selected.kind === "certification" ||
          selected.kind === "service"
        ) {
          deleteCollectionItem(selected.sectionId, selected.itemId);
          removed = true;
        } else if (
          selected.kind === "layer" &&
          selected.layerId.startsWith("custom:")
        ) {
          deleteCustomLayer(
            selected.sectionId,
            selected.layerId.slice("custom:".length),
          );
          removed = true;
        }
        if (removed) {
          event.preventDefault();
          select(undefined);
        }
        return;
      }
      if (event.repeat || !(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === "d") {
        event.preventDefault();
        if (!selected || !("sectionId" in selected)) return;
        if (selected.kind === "section") {
          duplicateSection(selected.sectionId);
        } else if (
          selected.kind === "project" ||
          selected.kind === "certification" ||
          selected.kind === "service"
        ) {
          duplicateCollectionItem(selected.sectionId, selected.itemId);
        } else if (
          selected.kind === "layer" &&
          selected.layerId.startsWith("custom:")
        ) {
          duplicateCustomLayer(
            selected.sectionId,
            selected.layerId.slice("custom:".length),
          );
        }
        return;
      }
      if (key === "b" && selected && "sectionId" in selected) {
        const section = portfolio?.sections.find(
          (item) => item.id === selected.sectionId,
        );
        const isCustomText =
          selected.kind === "layer" &&
          selected.layerId.startsWith("custom:") &&
          findCustomLayer(
            section?.customLayers,
            selected.layerId.slice("custom:".length),
          )?.type === "text";
        if (selected.kind !== "text" && !isCustomText) return;
        event.preventDefault();
        const elementKey = selectedElementKey(selected);
        const currentWeight = section?.elements?.[elementKey]?.fontWeight;
        updateElementSettings(selected.sectionId, elementKey, {
          fontWeight: currentWeight && currentWeight >= 600 ? 400 : 700,
        });
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      setSpacePressed(false);
    };
    const onWindowBlur = () => setSpacePressed(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [
    deleteCollectionItem,
    deleteCustomLayer,
    deleteSection,
    duplicateCollectionItem,
    duplicateCustomLayer,
    duplicateSection,
    portfolio,
    select,
    selected,
    updateElementSettings,
  ]);

  const sections = useMemo(
    () =>
      portfolio
        ? [...portfolio.sections].sort((a, b) => a.order - b.order)
        : [],
    [portfolio?.sections],
  );
  const movable = useMemo(
    () => sections.filter((section) => !section.locked),
    [sections],
  );
  const selectedSectionId =
    selected && "sectionId" in selected ? selected.sectionId : sections[0]?.id;
  const selectedSection = useMemo(
    () =>
      sections.find((section) => section.id === selectedSectionId) || sections[0],
    [sections, selectedSectionId],
  );

  const onDragEnd = useCallback((event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id) {
      reorderSections(String(event.active.id), String(event.over.id));
    }
  }, [reorderSections]);

  const selectAndScroll = useCallback((selection: SelectedElement) => {
    select(selection);
    window.requestAnimationFrame(() => {
      const sectionId =
        selection.kind === "body"
          ? sections.find((section) => section.visible)?.id
          : "sectionId" in selection
            ? selection.sectionId
            : undefined;
      if (!sectionId) return;
      const stage = document.querySelector<HTMLElement>(".canvas-stage");
      const target = document.querySelector<HTMLElement>(
        `[data-section-id="${sectionId}"]`,
      );
      if (!stage || !target) return;
      const stageRect = stage.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const targetTop =
        stage.scrollTop + targetRect.top - stageRect.top - stage.clientHeight / 2 + targetRect.height / 2;
      const targetLeft =
        stage.scrollLeft + targetRect.left - stageRect.left - stage.clientWidth / 2 + targetRect.width / 2;
      stage.scrollTo({
        top: Math.max(targetTop, 0),
        left: Math.max(targetLeft, 0),
        behavior: "smooth",
      });
    });
  }, [sections, select]);

  const toggleSection = useCallback(
    (section: (typeof sections)[number]) =>
      updateSection(section.id, { visible: !section.visible }),
    [updateSection],
  );
  const duplicateSelectedSection = useCallback(
    (section: (typeof sections)[number]) => duplicateSection(section.id),
    [duplicateSection],
  );
  const deleteSelectedSection = useCallback(
    (section: (typeof sections)[number]) => deleteSection(section.id),
    [deleteSection],
  );
  const renameSection = useCallback(
    (section: (typeof sections)[number]) => {
      const label = window.prompt("Rename section", section.label);
      if (label?.trim()) updateSection(section.id, { label: label.trim() });
    },
    [updateSection],
  );
  const toggleSectionLock = useCallback(
    (section: (typeof sections)[number]) =>
      updateSection(section.id, { locked: !section.locked }),
    [updateSection],
  );

  if (!portfolio) return null;

  return (
    <Box
      as="main"
      bg="bg.subtle"
      color="fg.default"
      display="flex"
      flexDirection="column"
      height="100dvh"
      overflow="hidden"
    >
      <EditorToolbar
        portfolio={portfolio}
        unsaved={unsaved}
        onUndo={undo}
        onRedo={redo}
        onSave={onSave}
        onSettings={onSettings}
        onStartTour={() => setLeftPanelCollapsed(false)}
        alwaysOpenTour={editorSettings.alwaysOpenTour ?? false}
        onPreview={onPreview}
        onPublish={onPublish}
      />

      <Box
        as="section"
        display="flex"
        flex="1"
        minH="0"
        minW="0"
        overflow="hidden"
      >
        <Box
          data-tour="structure-panel"
          flex={`0 0 ${leftPanelWidth}px`}
          minW={`${leftPanelWidth}px`}
          overflow="hidden"
          transition="flex-basis 0.2s ease, min-width 0.2s ease"
        >
          <StructurePanel
            sections={sections}
            selected={selected}
            selectedSection={selectedSection}
            movable={movable}
            bodyExpanded={bodyExpanded}
            expandedLayers={expandedLayers}
            onBodyExpanded={setBodyExpanded}
            onDragEnd={onDragEnd}
            onToggleSection={toggleSection}
            onDuplicateSection={duplicateSelectedSection}
            onDeleteSection={deleteSelectedSection}
            onRenameSection={renameSection}
            onToggleSectionLock={toggleSectionLock}
            onAddSection={addSection}
            onAddCollectionItem={addCollectionItem}
            onAddCustomLayer={(sectionId, type, parentId) => {
              const id = crypto.randomUUID();
              addCustomLayer(
                sectionId,
                {
                  id,
                  type,
                  name:
                    type === "div"
                      ? "New div"
                      : type === "text"
                        ? "New text"
                        : "New image",
                  text: type === "text" ? "New text layer" : undefined,
                  children: type === "div" ? [] : undefined,
                },
                parentId,
              );
              if (parentId) {
                setExpandedLayers((current) => ({
                  ...current,
                  [isNativeContainerLayerId(parentId)
                    ? /^(project|certification|service):/.test(parentId)
                      ? parentId.slice(parentId.indexOf(":") + 1)
                      : `${sectionId}-${parentId}`
                    : `custom:${parentId}`]: true,
                }));
              }
              select({
                kind: "layer",
                sectionId,
                layerId: `custom:${id}`,
                label: type === "div" ? "New div" : type === "text" ? "New text" : "New image",
              });
            }}
            onDeleteCollectionItem={deleteCollectionItem}
            onDeleteCustomLayer={deleteCustomLayer}
            onExpandedLayersChange={(layerIds) => {
              setExpandedLayers(
                Object.fromEntries(layerIds.map((layerId) => [layerId, true])),
              );
            }}
            onReorderCollectionItems={reorderCollectionItems}
            onReorderCustomLayers={reorderCustomLayers}
            onMoveCustomLayerToContainer={moveCustomLayerToContainer}
            onSelect={selectAndScroll}
            history={history}
            currentHistoryLabel={currentHistoryLabel}
            onRestoreHistory={restoreHistory}
            collapsed={leftPanelCollapsed}
            onCollapsedChange={setLeftPanelCollapsed}
          />
        </Box>

        <Box flex="1 1 auto" minW="0" overflowX="auto" overflowY="hidden">
          <Box
            display="grid"
            gridTemplateColumns={`${canvasTrackWidth}px ${propertiesPanelWidth}px`}
            h="full"
            justifyContent="end"
            minW={`${canvasTrackWidth + propertiesPanelWidth}px`}
          >
            <Box data-tour="canvas" minW="0" h="full" overflow="hidden">
              {selected?.kind === "head" ? (
                <HeadMetadataEditor />
              ) : (
                <CanvasStage
                  portfolio={portfolio}
                  selected={selected}
                  previewMode={previewMode}
                  panReady={spacePressed}
                  onPreviewModeChange={setPreviewMode}
                  onSelect={select}
                />
              )}
            </Box>

            <Box data-tour="properties-panel" minW="0" h="full" overflow="hidden">
              <PropertiesPanel />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
