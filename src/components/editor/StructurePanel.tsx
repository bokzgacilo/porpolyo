import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  HStack,
  IconButton,
  Stack,
  Text,
  Tabs,
} from "@chakra-ui/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useCallback, useMemo } from "react";
import {
  PortfolioSection,
  SelectedElement,
} from "../../types/portfolio";
import {
  collectionLabel,
  customLayerIdFromSelection,
  getSectionLayers,
  isCollectionSection,
} from "./layerHelpers";
import { LayerTree } from "./LayerTree";
import {
  PageStructureRow,
  SectionRow,
  SortableSectionRow,
} from "./SectionRows";
import {
  LuGlobe,
  LuImage,
  LuLayers,
  LuPanelTop,
  LuPlus,
} from "react-icons/lu";

export function StructurePanel({
  sections,
  selected,
  selectedSection,
  movable,
  bodyExpanded,
  expandedLayers,
  onBodyExpanded,
  onDragEnd,
  onToggleSection,
  onDuplicateSection,
  onDeleteSection,
  onRenameSection,
  onToggleSectionLock,
  onAddCollectionItem,
  onDeleteCollectionItem,
  onDeleteCustomLayer,
  onExpandedLayersChange,
  onReorderCollectionItems,
  onReorderTemplateLayers,
  onMoveTemplateLayerToContainer,
  onReorderCustomLayers,
  onMoveCustomLayerToContainer,
  onSelect,
  collapsed,
  onCollapsedChange,
}: {
  sections: PortfolioSection[];
  selected?: SelectedElement;
  selectedSection?: PortfolioSection;
  movable: PortfolioSection[];
  bodyExpanded: boolean;
  expandedLayers: Record<string, boolean>;
  onBodyExpanded: (expanded: boolean) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onToggleSection: (section: PortfolioSection) => void;
  onDuplicateSection: (section: PortfolioSection) => void;
  onDeleteSection: (section: PortfolioSection) => void;
  onRenameSection: (section: PortfolioSection) => void;
  onToggleSectionLock: (section: PortfolioSection) => void;
  onAddCollectionItem: (sectionId: string) => void;
  onDeleteCollectionItem: (sectionId: string, itemId: string) => void;
  onDeleteCustomLayer: (sectionId: string, layerId: string) => void;
  onExpandedLayersChange: (layerIds: string[]) => void;
  onReorderCollectionItems: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onReorderTemplateLayers: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onMoveTemplateLayerToContainer: (
    sectionId: string,
    activeId: string,
    parentLayerId: string | undefined,
    siblingIds: string[],
  ) => void;
  onReorderCustomLayers: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onMoveCustomLayerToContainer: (
    sectionId: string,
    activeId: string,
    parentLayerId?: string,
  ) => void;
  onSelect: (selection: SelectedElement) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const expandedLayerIds = useMemo(
    () =>
      Object.keys(expandedLayers).filter((layerId) => expandedLayers[layerId]),
    [expandedLayers],
  );
  const topLevelSections = useMemo(
    () => sections.filter((section) => !section.parentSectionId),
    [sections],
  );
  const layers = useMemo(
    () =>
      selectedSection ? getSectionLayers(selectedSection, sections) : [],
    [sections, selectedSection],
  );
  const selectedSectionId = selectedSection?.id;
  const removeLayer = useCallback(
    (selection: SelectedElement) => {
      if (!selectedSectionId) return;
      const customId = customLayerIdFromSelection(selection);
      if (customId) {
        onDeleteCustomLayer(selectedSectionId, customId);
        onSelect({ kind: "section", sectionId: selectedSectionId });
        return;
      }
      if (selection.kind === "section") {
        const nestedSection = sections.find(
          (section) => section.id === selection.sectionId,
        );
        if (nestedSection?.parentSectionId) {
          onDeleteSection(nestedSection);
          onSelect({ kind: "section", sectionId: selectedSectionId });
        }
        return;
      }
      if ("itemId" in selection) {
        onDeleteCollectionItem(selectedSectionId, selection.itemId);
        onSelect({ kind: "section", sectionId: selectedSectionId });
      }
    },
    [
      onDeleteCollectionItem,
      onDeleteCustomLayer,
      onDeleteSection,
      onSelect,
      sections,
      selectedSectionId,
    ],
  );
  const reorderCollection = useCallback(
    (activeId: string, overId: string) => {
      if (selectedSectionId)
        onReorderCollectionItems(selectedSectionId, activeId, overId);
    },
    [onReorderCollectionItems, selectedSectionId],
  );
  const reorderCustomLayer = useCallback(
    (activeId: string, overId: string) => {
      if (selectedSectionId)
        onReorderCustomLayers(selectedSectionId, activeId, overId);
    },
    [onReorderCustomLayers, selectedSectionId],
  );
  const reorderTemplateLayer = useCallback(
    (activeId: string, overId: string) => {
      if (selectedSectionId)
        onReorderTemplateLayers(selectedSectionId, activeId, overId);
    },
    [onReorderTemplateLayers, selectedSectionId],
  );
  const moveCustomLayer = useCallback(
    (activeId: string, parentLayerId?: string) => {
      if (selectedSectionId)
        onMoveCustomLayerToContainer(
          selectedSectionId,
          activeId,
          parentLayerId,
        );
    },
    [onMoveCustomLayerToContainer, selectedSectionId],
  );
  const moveTemplateLayer = useCallback(
    (
      activeId: string,
      parentLayerId: string | undefined,
      siblingIds: string[],
    ) => {
      if (selectedSectionId) {
        onMoveTemplateLayerToContainer(
          selectedSectionId,
          activeId,
          parentLayerId,
          siblingIds,
        );
      }
    },
    [onMoveTemplateLayerToContainer, selectedSectionId],
  );

  if (collapsed) {
    return (
      <Stack
        as="aside"
        align="center"
        bg="bg"
        borderRight="1px solid"
        borderRightColor="border"
        height="full"
        py={2}
      >
        <IconButton
          aria-label="Expand navigation panel"
          title="Expand navigation panel"
          size="sm"
          variant="ghost"
          onClick={() => onCollapsedChange(false)}
        >
          <PanelLeftOpen size={17} />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Stack
      bg="bg"
      borderRight="1px solid"
      height="full"
      borderRightColor="border"
      as="aside"
      gap={0}
    >
      <HStack p={2} justify="space-between">
        <Text color="fg" fontWeight="semibold">
          Navigator
        </Text>
        <IconButton
          aria-label="Collapse navigation panel"
          title="Collapse navigation panel"
          size="sm"
          variant="ghost"
          onClick={() => onCollapsedChange(true)}
        >
          <PanelLeftClose size={17} />
        </IconButton>
      </HStack>
      <Tabs.Root variant="line" defaultValue="sections">
        <Tabs.List>
          <Tabs.Trigger flex={1} value="sections">
            <LuLayers /> Sections
          </Tabs.Trigger>
          <Tabs.Trigger flex={1} value="layers">
            <LuImage /> Layers
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content pt={0} value="sections">
          <PageStructureRow
            icon={LuPanelTop}
            label="Head"
            active={selected?.kind === "head"}
            onClick={() => onSelect({ kind: "head" })}
          />
          <PageStructureRow
            icon={LuGlobe}
            label="Body"
            active={selected?.kind === "body"}
            expanded={bodyExpanded}
            onToggle={() => onBodyExpanded(!bodyExpanded)}
            onClick={() => onSelect({ kind: "body" })}
          />
          {bodyExpanded && (
            <Box>
              <DndContext onDragEnd={onDragEnd}>
                <SortableContext
                  items={movable.map((section) => section.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack gap={0}>
                    {topLevelSections.map((section) =>
                      section.locked ? (
                        <SectionRow
                          key={section.id}
                          section={section}
                          onToggle={onToggleSection}
                          onDuplicate={onDuplicateSection}
                          onDelete={onDeleteSection}
                          onRename={onRenameSection}
                          onToggleLock={onToggleSectionLock}
                          onSelect={onSelect}
                        />
                      ) : (
                        <SortableSectionRow
                          key={section.id}
                          section={section}
                          onToggle={onToggleSection}
                          onDuplicate={onDuplicateSection}
                          onDelete={onDeleteSection}
                          onRename={onRenameSection}
                          onToggleLock={onToggleSectionLock}
                          onSelect={onSelect}
                        />
                      ),
                    )}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Box>
          )}
        </Tabs.Content>
        <Tabs.Content value="layers">
          <Stack px={4}>
            <HStack justify="space-between" align="center">
              <Text as="strong">
                {selectedSection?.label || "No section"} layers
              </Text>
              <HStack gap="1">
                {selectedSection &&
                  isCollectionSection(selectedSection.type) && (
                    <IconButton
                      aria-label={`Add ${collectionLabel(selectedSection.type)}`}
                      title={`Add ${collectionLabel(selectedSection.type)}`}
                      size="xs"
                      variant="outline"
                      onClick={() => onAddCollectionItem(selectedSection.id)}
                    >
                      <LuPlus size={16} />
                    </IconButton>
                  )}
              </HStack>
            </HStack>
            <Text px="1" color="fg.muted" fontSize="xs">
              Drag the grip onto a section or Div row to move an element
              inside. Drop it on another element row to reorder it at that
              level.
            </Text>
            {selectedSection && (
              <LayerTree
                layers={layers}
                selected={selected}
                sections={sections}
                expandedLayerIds={expandedLayerIds}
                onExpandedLayerIdsChange={onExpandedLayersChange}
                onSelect={onSelect}
                onRemove={removeLayer}
                onReorderCollection={reorderCollection}
                onReorderTemplateLayer={reorderTemplateLayer}
                onMoveTemplateLayerToContainer={moveTemplateLayer}
                onReorderCustomLayer={reorderCustomLayer}
                onMoveCustomLayerToContainer={moveCustomLayer}
              />
            )}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
