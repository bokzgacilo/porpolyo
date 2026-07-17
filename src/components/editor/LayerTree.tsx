import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Button, HStack, IconButton, Text, TreeView, createTreeCollection } from "@chakra-ui/react";
import { GripVertical, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { PortfolioSection, SelectedElement } from "../../types/portfolio";
import { LayerNode, selectedLabel } from "./layerHelpers";

type LayerTreeNode = LayerNode & { children?: LayerTreeNode[] };

export function LayerTree({
  layers,
  selected,
  sections,
  expandedLayerIds,
  onExpandedLayerIdsChange,
  onSelect,
  onRemove,
  onReorderProject,
}: {
  layers: LayerNode[];
  selected?: SelectedElement;
  sections: PortfolioSection[];
  expandedLayerIds: string[];
  onExpandedLayerIdsChange: (layerIds: string[]) => void;
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
  onReorderProject: (activeId: string, overId: string) => void;
}) {
  const projectIds = useMemo(() => flattenLayers(layers).filter((layer) => layer.sortable).map((layer) => layer.id), [layers]);
  const selectedLayer = useMemo(
    () => flattenLayers(layers).find((layer) => selectedLabel(selected, sections) === selectedLabel(layer.selection, sections)),
    [layers, sections, selected],
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

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    onReorderProject(String(event.active.id), String(event.over.id));
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
        <TreeView.Root
          collection={collection}
          expandedValue={expandedLayerIds}
          onExpandedChange={(details) => onExpandedLayerIdsChange(details.expandedValue)}
          selectedValue={selectedValue}
          selectionMode="single"
          className="chakra-layer-tree-root"
        >
          <TreeView.Tree className="chakra-layer-tree">
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
}

function SortableLayerNode({
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id, disabled: !node.sortable });
  const row = (
    <LayerTreeNodeRow
      node={node}
      active={active}
      branch={branch}
      depth={depth}
      sections={sections}
      dragHandle={node.sortable ? { ...attributes, ...listeners } : undefined}
      onSelect={onSelect}
      onRemove={onRemove}
    />
  );

  if (!node.sortable) return row;

  return (
    <Box ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      {row}
    </Box>
  );
}

function LayerTreeNodeRow({
  node,
  active,
  branch,
  depth,
  sections,
  dragHandle,
  onSelect,
  onRemove,
}: {
  node: LayerTreeNode;
  active: boolean;
  branch: boolean;
  depth: number;
  sections: PortfolioSection[];
  dragHandle?: Record<string, unknown>;
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
}) {
  const rowClass = `layer-row ${active ? "active-layer" : ""}`;
  const label = selectedLabel(node.selection, sections) || node.label;
  const content = (
    <>
      {node.sortable ? (
        <span className="drag layer-drag" {...dragHandle}>
          <GripVertical size={14} />
        </span>
      ) : branch ? (
        <TreeView.BranchTrigger className="tree-toggle">
          <TreeView.BranchIndicator />
        </TreeView.BranchTrigger>
      ) : (
        <span className="tree-toggle-placeholder" />
      )}
      <Button onClick={() => onSelect(node.selection)} size="sm" variant="ghost" flex="1" justifyContent="flex-start" title={label}>
        <Text as="span" truncate>{node.label}</Text>
      </Button>
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
        <HStack className={rowClass} data-depth={depth} gap="2">
          {content}
        </HStack>
      </TreeView.BranchControl>
    );
  }

  return (
    <TreeView.Item asChild>
      <HStack className={rowClass} data-depth={depth} gap="2" onClick={() => onSelect(node.selection)}>
        {content}
      </HStack>
    </TreeView.Item>
  );
}

function flattenLayers(layers: LayerNode[]): LayerNode[] {
  return layers.flatMap((layer) => [layer, ...flattenLayers(layer.children || [])]);
}
