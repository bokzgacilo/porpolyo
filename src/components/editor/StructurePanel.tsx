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
  Stack,
  Text,
  Tabs,
} from "@chakra-ui/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  PortfolioSection,
  SectionType,
  SelectedElement,
} from "../../types/portfolio";
import {
  collectionLabel,
  getSectionLayers,
  isCollectionSection,
} from "./layerHelpers";
import { LayerTree } from "./LayerTree";
import {
  PageStructureRow,
  SectionRow,
  SortableSectionRow,
} from "./SectionRows";
import { LuGlobe, LuImage, LuLayers, LuPanelTop, LuPlus } from "react-icons/lu";

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
  onDeleteCollectionItem,
  onExpandedLayersChange,
  onReorderCollectionItems,
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
  onAddSection: (
    type: "projects" | "certifications" | "services" | "about",
  ) => void;
  onAddCollectionItem: (sectionId: string) => void;
  onDeleteCollectionItem: (sectionId: string, itemId: string) => void;
  onExpandedLayersChange: (layerIds: string[]) => void;
  onReorderCollectionItems: (
    sectionId: string,
    activeId: string,
    overId: string,
  ) => void;
  onSelect: (selection: SelectedElement) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const expandedLayerIds = Object.keys(expandedLayers).filter(
    (layerId) => expandedLayers[layerId],
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
      <HStack justify="space-between" px={3} py={2}>
        <Text fontSize="sm" fontWeight="semibold">
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
      <Tabs.Root defaultValue="sections">
        <Tabs.List>
          <Tabs.Trigger value="sections">
            <LuLayers size={16} /> Sections
          </Tabs.Trigger>
          <Tabs.Trigger value="layers">
            <LuImage size={16} /> Layers
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
          <Stack>
            <HStack justify="space-between" align="center">
              <Text as="strong">
                {selectedSection?.label || "No section"} layers
              </Text>
              {selectedSection && isCollectionSection(selectedSection.type) && (
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
            {selectedSection && (
              <LayerTree
                layers={getSectionLayers(selectedSection)}
                selected={selected}
                sections={sections}
                expandedLayerIds={expandedLayerIds}
                onExpandedLayerIdsChange={onExpandedLayersChange}
                onSelect={onSelect}
                onRemove={(selection) => {
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
                onReorderProject={(activeId, overId) =>
                  onReorderCollectionItems(selectedSection.id, activeId, overId)
                }
              />
            )}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
