import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Menu,
  Portal,
  Stack,
  Text,
  Tabs,
} from "@chakra-ui/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { EditorHistoryEntry } from "../../store/editorStore";
import {
  PortfolioSection,
  CustomLayerType,
  SectionType,
  SelectedElement,
} from "../../types/portfolio";
import {
  collectionLabel,
  customLayerIdFromSelection,
  getSectionLayers,
  isCollectionSection,
} from "./layerHelpers";
import { findCustomLayer } from "../../utils/customLayers";
import { LayerTree } from "./LayerTree";
import { HistoryPanel } from "./HistoryPanel";
import {
  PageStructureRow,
  SectionRow,
  SortableSectionRow,
} from "./SectionRows";
import {
  LuGlobe,
  LuHistory,
  LuImage,
  LuImagePlus,
  LuLayers,
  LuPanelTop,
  LuPlus,
  LuSquareDashed,
  LuType,
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
  onAddSection,
  onAddCollectionItem,
  onAddCustomLayer,
  onDeleteCollectionItem,
  onDeleteCustomLayer,
  onExpandedLayersChange,
  onReorderCollectionItems,
  onReorderCustomLayers,
  onMoveCustomLayerToContainer,
  onSelect,
  history,
  currentHistoryLabel,
  onRestoreHistory,
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
  onAddSection: (
    type: "projects" | "certifications" | "services" | "about",
  ) => void;
  onAddCollectionItem: (sectionId: string) => void;
  onAddCustomLayer: (
    sectionId: string,
    type: CustomLayerType,
    parentId?: string,
  ) => void;
  onDeleteCollectionItem: (sectionId: string, itemId: string) => void;
  onDeleteCustomLayer: (sectionId: string, layerId: string) => void;
  onExpandedLayersChange: (layerIds: string[]) => void;
  onReorderCollectionItems: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onReorderCustomLayers: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onMoveCustomLayerToContainer: (
    sectionId: string,
    activeId: string,
    parentLayerId: string,
  ) => void;
  onSelect: (selection: SelectedElement) => void;
  history: EditorHistoryEntry[];
  currentHistoryLabel: string;
  onRestoreHistory: (entryId: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const expandedLayerIds = Object.keys(expandedLayers).filter(
    (layerId) => expandedLayers[layerId],
  );
  const selectedCustomLayerId = customLayerIdFromSelection(selected);
  const selectedCustomLayer = selectedSection
    ? findCustomLayer(selectedSection.customLayers, selectedCustomLayerId || "")
    : undefined;
  const customLayerParentId =
    selectedCustomLayer?.type === "div" ? selectedCustomLayer.id : undefined;

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
          <Tabs.Trigger flex={1} value="history">
            <LuHistory /> History
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
                    {sections.map((section) =>
                      section.locked ? (
                        <SectionRow
                          key={section.id}
                          section={section}
                          onToggle={() => onToggleSection(section)}
                          onDuplicate={() => onDuplicateSection(section)}
                          onDelete={() => onDeleteSection(section)}
                          onRename={() => onRenameSection(section)}
                          onToggleLock={() => onToggleSectionLock(section)}
                          onSelect={onSelect}
                        />
                      ) : (
                        <SortableSectionRow
                          key={section.id}
                          section={section}
                          onToggle={() => onToggleSection(section)}
                          onDuplicate={() => onDuplicateSection(section)}
                          onDelete={() => onDeleteSection(section)}
                          onRename={() => onRenameSection(section)}
                          onToggleLock={() => onToggleSectionLock(section)}
                          onSelect={onSelect}
                        />
                      ),
                    )}
                  </Stack>
                </SortableContext>
              </DndContext>
            </Box>
          )}
          <Stack mt={4} gap={4} px={4}>
            <Text color="fg" fontWeight="semibold">
              Add section
            </Text>
            {(["projects", "certifications", "services", "about"] as const).map(
              (type) => (
                <Button
                  key={type}
                  onClick={() => onAddSection(type)}
                  variant="outline"
                >
                  <LuPlus size={16} /> {type}
                </Button>
              ),
            )}
          </Stack>
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
                {selectedSection && (
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <IconButton
                        aria-label="Add layer"
                        title={
                          customLayerParentId
                            ? `Add inside ${selectedCustomLayer?.name}`
                            : "Add layer to section"
                        }
                        size="xs"
                      >
                        <LuLayers size={16} />
                      </IconButton>
                    </Menu.Trigger>
                    <Portal>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item
                            value="div"
                            onSelect={() =>
                              onAddCustomLayer(
                                selectedSection.id,
                                "div",
                                customLayerParentId,
                              )
                            }
                          >
                            <LuSquareDashed /> Div container
                          </Menu.Item>
                          <Menu.Item
                            value="text"
                            onSelect={() =>
                              onAddCustomLayer(
                                selectedSection.id,
                                "text",
                                customLayerParentId,
                              )
                            }
                          >
                            <LuType /> Text
                          </Menu.Item>
                          <Menu.Item
                            value="image"
                            onSelect={() =>
                              onAddCustomLayer(
                                selectedSection.id,
                                "image",
                                customLayerParentId,
                              )
                            }
                          >
                            <LuImagePlus /> Image
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Portal>
                  </Menu.Root>
                )}
              </HStack>
            </HStack>
            <Text px="1" color="fg.muted" fontSize="xs">
              Drag a custom layer onto a Div or template container to nest it.
              Template containers stay protected from deletion.
            </Text>
            {selectedSection && (
              <LayerTree
                layers={getSectionLayers(selectedSection, sections)}
                selected={selected}
                sections={sections}
                expandedLayerIds={expandedLayerIds}
                onExpandedLayerIdsChange={onExpandedLayersChange}
                onSelect={onSelect}
                onRemove={(selection) => {
                  const customId = customLayerIdFromSelection(selection);
                  if (customId) {
                    onDeleteCustomLayer(selectedSection.id, customId);
                    onSelect({
                      kind: "section",
                      sectionId: selectedSection.id,
                    });
                    return;
                  }
                  if ("itemId" in selection) {
                    onDeleteCollectionItem(
                      selectedSection.id,
                      selection.itemId,
                    );
                    onSelect({
                      kind: "section",
                      sectionId: selectedSection.id,
                    });
                  }
                }}
                onReorderCollection={(activeId, overId) =>
                  onReorderCollectionItems(selectedSection.id, activeId, overId)
                }
                onReorderCustomLayer={(activeId, overId) =>
                  onReorderCustomLayers(selectedSection.id, activeId, overId)
                }
                onMoveCustomLayerToContainer={(activeId, parentLayerId) =>
                  onMoveCustomLayerToContainer(
                    selectedSection.id,
                    activeId,
                    parentLayerId,
                  )
                }
              />
            )}
          </Stack>
        </Tabs.Content>
        <Tabs.Content p={0} value="history">
          <HistoryPanel
            history={history}
            currentLabel={currentHistoryLabel}
            onRestore={onRestoreHistory}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
