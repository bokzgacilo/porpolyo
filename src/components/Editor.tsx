import { DragEndEvent } from "@dnd-kit/core";
import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEditorStore } from "../store/editorStore";
import { SelectedElement } from "../types/portfolio";
import { PropertiesPanel } from "./PropertiesPanel";
import { CanvasStage } from "./editor/CanvasStage";
import { EditorToolbar } from "./editor/EditorToolbar";
import { HeadMetadataEditor } from "./editor/HeadMetadataEditor";
import { StructurePanel } from "./editor/StructurePanel";

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
    reorderCollectionItems,
    addCustomLayer,
    deleteCustomLayer,
    reorderCustomLayers,
    moveCustomLayerToContainer,
    undo,
    redo,
    restoreHistory,
    select,
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
      reorderCollectionItems: state.reorderCollectionItems,
      addCustomLayer: state.addCustomLayer,
      deleteCustomLayer: state.deleteCustomLayer,
      reorderCustomLayers: state.reorderCustomLayers,
      moveCustomLayerToContainer: state.moveCustomLayerToContainer,
      undo: state.undo,
      redo: state.redo,
      restoreHistory: state.restoreHistory,
      select: state.select,
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
      if (event.code !== "Space" || isTypingTarget(event.target)) return;
      event.preventDefault();
      setSpacePressed(true);
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
  }, []);

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
      height="100vh"
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
        height="calc(100vh - 48px)"
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
                  [`custom:${parentId}`]: true,
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
