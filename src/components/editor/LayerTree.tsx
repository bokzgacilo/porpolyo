import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Text,
  TreeView,
  createTreeCollection,
} from "@chakra-ui/react";
import {
  Grid2X2,
  GripVertical,
  Image,
  Layers3,
  Rows3,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { getSectionLayoutMode } from "../../config/sectionLayoutSettings";
import { PortfolioSection, SelectedElement } from "../../types/portfolio";
import { LayerNode, selectedLabel } from "./layerHelpers";

type LayerTreeNode = LayerNode & { children?: LayerTreeNode[] };

export const LayerTree = memo(function LayerTree({
  layers,
  selected,
  sections,
  expandedLayerIds,
  onExpandedLayerIdsChange,
  onSelect,
  onRemove,
  onReorderCollection,
  onReorderCustomLayer,
  onMoveCustomLayerToContainer,
}: {
  layers: LayerNode[];
  selected?: SelectedElement;
  sections: PortfolioSection[];
  expandedLayerIds: string[];
  onExpandedLayerIdsChange: (layerIds: string[]) => void;
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
  onReorderCollection: (activeId: string, overId: string) => void;
  onReorderCustomLayer: (activeId: string, overId: string) => void;
  onMoveCustomLayerToContainer: (activeId: string, parentLayerId: string) => void;
}) {
  const flatLayers = useMemo(() => flattenLayers(layers), [layers]);
  const projectIds = useMemo(
    () =>
      flatLayers
        .filter((layer) => layer.sortable)
        .map((layer) => layer.id),
    [flatLayers],
  );
  const selectedLayer = useMemo(
    () =>
      flatLayers.find((layer) =>
        sameSelection(selected, layer.selection),
      ),
    [flatLayers, selected],
  );
  const selectedValue = selectedLayer ? [selectedLayer.id] : [];
  const collection = useMemo(
    () =>
      createTreeCollection<LayerTreeNode>({
        rootNode: {
          id: "root",
          label: "Root",
          selection: { kind: "body" },
          removable: false,
          children: layers,
        },
        nodeToValue: (node: LayerTreeNode) => node.id,
        nodeToString: (node: LayerTreeNode) => node.label,
        nodeToChildren: (node: LayerTreeNode) => node.children || [],
      }),
    [layers],
  );
  const initializedRoots = useRef(new Set<string>());
  const root = layers[0];
  const rootId = root?.id;

  useEffect(() => {
    if (!rootId || initializedRoots.current.has(rootId)) return;
    initializedRoots.current.add(rootId);
    const firstLevelBranches = (root.children || [])
      .filter((node) => (node.children?.length || 0) > 0)
      .map((node) => node.id);
    onExpandedLayerIdsChange(
      Array.from(new Set([...expandedLayerIds, rootId, ...firstLevelBranches])),
    );
  }, [expandedLayerIds, onExpandedLayerIdsChange, root, rootId]);

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const overLayer = flatLayers.find((layer) => layer.id === overId);
    if (
      activeId.startsWith("custom:") &&
      !overId.startsWith("custom:") &&
      overLayer?.acceptsChildren &&
      overLayer.selection.kind === "layer"
    ) {
      onMoveCustomLayerToContainer(
        activeId.slice("custom:".length),
        overLayer.selection.layerId,
      );
      return;
    }
    if (activeId.startsWith("custom:") && overId.startsWith("custom:")) {
      onReorderCustomLayer(
        activeId.slice("custom:".length),
        overId.slice("custom:".length),
      );
      return;
    }
    if (!activeId.startsWith("custom:") && !overId.startsWith("custom:")) {
      onReorderCollection(activeId, overId);
    }
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext
        items={projectIds}
        strategy={verticalListSortingStrategy}
      >
        <TreeView.Root
          collection={collection}
          expandedValue={expandedLayerIds}
          onExpandedChange={(details) =>
            onExpandedLayerIdsChange(details.expandedValue)
          }
          selectedValue={selectedValue}
          selectionMode="single"
          width="full"
          size="sm"
        >
          <TreeView.Tree width="full">
            <TreeView.Node
              indentGuide={<TreeView.BranchIndentGuide />}
              render={({ node, indexPath, nodeState }) => (
                <SortableLayerNode
                  node={node as LayerTreeNode}
                  depth={indexPath.length - 1}
                  active={selectedValue.includes((node as LayerTreeNode).id)}
                  branch={nodeState.isBranch}
                  sections={sections}
                  onSelect={onSelect}
                  onRemove={onRemove}
                />
              )}
            />
          </TreeView.Tree>
        </TreeView.Root>
      </SortableContext>
    </DndContext>
  );
});

const SortableLayerNode = memo(function SortableLayerNode({
  node,
  depth,
  active,
  branch,
  sections,
  onSelect,
  onRemove,
}: {
  node: LayerTreeNode;
  depth: number;
  active: boolean;
  branch: boolean;
  sections: PortfolioSection[];
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
}) {
  const {
    attributes,
    isOver: isSortableOver,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({ id: node.id, disabled: !node.sortable });
  const { isOver: isContainerOver, setNodeRef: setContainerRef } = useDroppable({
    id: node.id,
    disabled: !!node.sortable || !node.acceptsChildren,
  });
  const setNodeRef = useCallback(
    (element: HTMLElement | null) => {
      setSortableRef(element);
      setContainerRef(element);
    },
    [setContainerRef, setSortableRef],
  );
  const dragHandle = useMemo(
    () => (node.sortable ? { ...attributes, ...listeners } : undefined),
    [attributes, listeners, node.sortable],
  );
  const row = (
    <LayerTreeNodeRow
      node={node}
      active={active}
      dropTarget={
        (isSortableOver || isContainerOver) && !!node.acceptsChildren
      }
      branch={branch}
      depth={depth}
      sections={sections}
      dragHandle={dragHandle}
      onSelect={onSelect}
      onRemove={onRemove}
    />
  );

  if (!node.sortable && !node.acceptsChildren) return row;

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: node.sortable ? CSS.Transform.toString(transform) : undefined,
        transition: node.sortable ? transition : undefined,
      }}
    >
      {row}
    </Box>
  );
});

const LayerTreeNodeRow = memo(function LayerTreeNodeRow({
  node,
  active,
  dropTarget,
  branch,
  depth,
  sections,
  dragHandle,
  onSelect,
  onRemove,
}: {
  node: LayerTreeNode;
  active: boolean;
  dropTarget: boolean;
  branch: boolean;
  depth: number;
  sections: PortfolioSection[];
  dragHandle?: Record<string, unknown>;
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
}) {
  const label = selectedLabel(node.selection, sections) || node.label;
  const rowStyles = {
    width: "full",
    minH: "9",
    ps: depth === 0 ? "1" : depth * 3,
    pe: "1",
    gap: "1",
    rounded: "md",
    borderWidth: "1px",
    borderColor: dropTarget
      ? "green.solid"
      : active
        ? "blue.solid"
        : "transparent",
    bg: dropTarget ? "green.subtle" : active ? "blue.subtle" : "transparent",
    color: active ? "blue.fg" : "fg",
    _hover: {
      bg: dropTarget ? "green.subtle" : active ? "blue.subtle" : "bg.subtle",
    },
  } as const;
  const content = (
    <>
      {branch ? (
        <TreeView.BranchTrigger
          aria-label={`Toggle ${node.label}`}
          boxSize="7"
          display="grid"
          flexShrink={0}
          placeItems="center"
          color="fg.muted"
          rounded="sm"
          _hover={{ bg: "bg.muted" }}
        >
          <TreeView.BranchIndicator />
        </TreeView.BranchTrigger>
      ) : (
        <Box boxSize="7" flexShrink={0} />
      )}
      {node.sortable && (
        <IconButton
          {...dragHandle}
          aria-label={`Reorder ${node.label}`}
          title={`Reorder ${node.label}`}
          size="xs"
          variant="ghost"
          color="fg.muted"
          cursor="grab"
          touchAction="none"
          _active={{ cursor: "grabbing" }}
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical size={14} />
        </IconButton>
      )}
      <LayerTypeIcon node={node} sections={sections} />
      {branch ? (
        <Button
          onClick={() => onSelect(node.selection)}
          size="sm"
          variant="ghost"
          flex="1"
          minW={0}
          px="1"
          justifyContent="flex-start"
          title={label}
        >
          <Text as="span" truncate>
            {node.label}
          </Text>
        </Button>
      ) : (
        <TreeView.ItemText flex="1" minW={0} title={label}>
          <Text as="span" truncate>
            {node.label}
          </Text>
        </TreeView.ItemText>
      )}
      {node.removable && (
        <IconButton
          aria-label={`Remove ${node.label}`}
          title={`Remove ${node.label}`}
          size="xs"
          variant="ghost"
          colorPalette="red"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(node.selection);
          }}
        >
          <Trash2 size={14} />
        </IconButton>
      )}
    </>
  );

  if (branch) {
    return (
      <TreeView.BranchControl asChild>
        <HStack {...rowStyles}>{content}</HStack>
      </TreeView.BranchControl>
    );
  }

  return (
    <TreeView.Item asChild>
      <HStack {...rowStyles} onClick={() => onSelect(node.selection)}>
        {content}
      </HStack>
    </TreeView.Item>
  );
});

function flattenLayers(layers: LayerNode[]): LayerNode[] {
  return layers.flatMap((layer) => [
    layer,
    ...flattenLayers(layer.children || []),
  ]);
}

function LayerTypeIcon({
  node,
  sections,
}: {
  node: LayerTreeNode;
  sections: PortfolioSection[];
}) {
  let icon = Layers3;
  let label = "Layer";
  if (node.selection.kind === "section") {
    const sectionId = node.selection.sectionId;
    const section = sections.find((item) => item.id === sectionId);
    const mode = section ? getSectionLayoutMode(section) : "stack";
    icon = mode === "grid" ? Grid2X2 : Rows3;
    label = mode === "grid" ? "Grid section" : "Stack section";
  } else if (node.customType === "div") {
    icon = Square;
    label = "Div layer";
  } else if (node.customType === "text" || node.selection.kind === "text") {
    icon = Type;
    label = "Text layer";
  } else if (node.customType === "image" || node.selection.kind === "image") {
    icon = Image;
    label = "Image layer";
  } else if (
    node.selection.kind === "layer" &&
    /(?:image|icon)$/.test(node.selection.layerId)
  ) {
    icon = Image;
    label = "Image layer";
  } else if (
    node.selection.kind === "project" ||
    node.selection.kind === "certification" ||
    node.selection.kind === "service"
  ) {
    icon = Square;
    label = "Item layer";
  }

  return (
    <Icon
      as={icon}
      aria-label={label}
      boxSize="4"
      flexShrink={0}
      color="fg.muted"
    />
  );
}

function sameSelection(
  left: SelectedElement | undefined,
  right: SelectedElement,
) {
  if (!left || left.kind !== right.kind) return false;
  if (left.kind === "head" || left.kind === "body") return true;
  if (right.kind === "head" || right.kind === "body") return false;
  if (left.sectionId !== right.sectionId) return false;
  if (left.kind === "section") return true;
  if (right.kind === "section") return false;
  if (left.kind === "layer" && right.kind === "layer") {
    return left.layerId === right.layerId;
  }
  if (left.kind === "text" && right.kind === "text") {
    return left.field === right.field;
  }
  if (left.kind === "image" && right.kind === "image") {
    return left.field === right.field;
  }
  if ("itemId" in left && "itemId" in right) {
    return left.itemId === right.itemId;
  }
  return false;
}
