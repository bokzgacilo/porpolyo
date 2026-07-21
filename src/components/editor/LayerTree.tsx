import {
  Box,
  Menu,
  Portal,
} from "@chakra-ui/react";
import {
  DndProvider,
  MultiBackend,
  NodeModel,
  Tree,
  getBackendOptions,
  type DropOptions,
  type RenderParams,
} from "@minoru/react-dnd-treeview";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CornerUpLeft,
  GripVertical,
  Image,
  Layers3,
  MousePointer2,
  MousePointerClick,
  Rows3,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { PortfolioSection, SelectedElement } from "../../types/portfolio";
import {
  LayerNode,
  nativeContainerLayerIdFromSelection,
  selectedLabel,
} from "./layerHelpers";

const TREE_ROOT_ID = "__layer_tree_root__";

type LayerTreeData = {
  layer: LayerNode;
};

type TreeNode = NodeModel<LayerTreeData>;

export const LayerTree = memo(function LayerTree({
  layers,
  selected,
  sections,
  expandedLayerIds,
  onExpandedLayerIdsChange,
  onSelect,
  onRemove,
  onReorderCollection,
  onReorderTemplateLayer,
  onMoveTemplateLayerToContainer,
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
  onReorderTemplateLayer: (activeId: string, overId: string) => void;
  onMoveTemplateLayerToContainer: (
    activeId: string,
    parentLayerId: string | undefined,
    siblingIds: string[],
  ) => void;
  onReorderCustomLayer: (activeId: string, overId: string) => void;
  onMoveCustomLayerToContainer: (
    activeId: string,
    parentLayerId?: string,
  ) => void;
}) {
  const generatedTree = useMemo(() => toTreeData(layers), [layers]);
  const [tree, setTree] = useState<TreeNode[]>(generatedTree);
  const rootNode = layers[0];
  const initializedRootIds = useRef(new Set<string>());

  useEffect(() => {
    setTree(generatedTree);
  }, [generatedTree]);

  useEffect(() => {
    if (!rootNode || initializedRootIds.current.has(rootNode.id)) return;
    initializedRootIds.current.add(rootNode.id);
    onExpandedLayerIdsChange(
      Array.from(
        new Set([
          ...expandedLayerIds,
          rootNode.id,
          ...(rootNode.children || [])
            .filter((node) => node.acceptsChildren || node.children?.length)
            .map((node) => node.id),
        ]),
      ),
    );
  }, [expandedLayerIds, onExpandedLayerIdsChange, rootNode]);

  const handleDrop = (
    newTree: TreeNode[],
    options: DropOptions<LayerTreeData>,
  ) => {
    const active = options.dragSource?.data?.layer;
    if (!active || active.id === rootNode?.id) return;
    const previousActiveNode = tree.find((node) => node.id === active.id);
    const nextActiveNode = newTree.find((node) => node.id === active.id);
    if (!previousActiveNode || !nextActiveNode) return;
    setTree(newTree);

    const nextParent = newTree.find(
      (node) => node.id === nextActiveNode.parent,
    )?.data?.layer;

    if (active.id.startsWith("custom:")) {
      const activeId = active.id.slice("custom:".length);
      const customSiblings = newTree.filter(
        (node) =>
          node.parent === nextActiveNode.parent &&
          String(node.id).startsWith("custom:"),
      );
      const nextIndex = customSiblings.findIndex(
        (node) => node.id === active.id,
      );
      const nextSibling = customSiblings[nextIndex + 1];

      if (nextSibling) {
        onReorderCustomLayer(
          activeId,
          String(nextSibling.id).slice("custom:".length),
        );
      } else if (nextParent?.id.startsWith("custom:")) {
        onReorderCustomLayer(
          activeId,
          nextParent.id.slice("custom:".length),
        );
      } else {
        onMoveCustomLayerToContainer(
          activeId,
          nextParent && nextParent.selection.kind !== "section"
            ? nativeContainerLayerIdFromSelection(nextParent.selection)
            : undefined,
        );
      }
      return;
    }

    if (active.reparentable) {
      const parentLayerId =
        nextParent?.selection.kind === "section"
          ? undefined
          : nextParent
            ? nativeContainerLayerIdFromSelection(nextParent.selection)
            : undefined;
      const siblingIds = newTree
        .filter(
          (node) =>
            node.parent === nextActiveNode.parent &&
            isTemplateMovableLayer(node.data?.layer),
        )
        .map((node) => String(node.id));
      onMoveTemplateLayerToContainer(
        active.id,
        parentLayerId,
        siblingIds,
      );
      return;
    }

    const collection = isCollectionLayer(active);
    if (collection || active.sortable) {
      const targetId = reorderTarget(
        tree,
        newTree,
        previousActiveNode,
        nextActiveNode,
        (node) =>
          collection
            ? isSameCollectionKind(active, node.data?.layer)
            : !!node.data?.layer.sortable,
      );
      if (!targetId) return;
      if (collection) {
        onReorderCollection(active.id, targetId);
      } else {
        onReorderTemplateLayer(active.id, targetId);
      }
    }
  };

  const moveNode = (nodeId: string, offset: -1 | 1) => {
    const activeNode = tree.find((node) => String(node.id) === nodeId);
    const active = activeNode?.data?.layer;
    if (!activeNode || !active) return;
    const siblings = movableSiblings(tree, activeNode, active);
    const currentIndex = siblings.findIndex((node) => node.id === activeNode.id);
    const target = siblings[currentIndex + offset];
    if (!target) return;

    if (active.id.startsWith("custom:")) {
      onReorderCustomLayer(
        active.id.slice("custom:".length),
        String(target.id).slice("custom:".length),
      );
      return;
    }

    if (active.reparentable) {
      const nextSiblingIds = siblings.map((node) => String(node.id));
      const [movedId] = nextSiblingIds.splice(currentIndex, 1);
      nextSiblingIds.splice(currentIndex + offset, 0, movedId);
      const parent = tree.find((node) => node.id === activeNode.parent)?.data
        ?.layer;
      onMoveTemplateLayerToContainer(
        active.id,
        parent?.selection.kind === "section"
          ? undefined
          : parent
            ? nativeContainerLayerIdFromSelection(parent.selection)
            : undefined,
        nextSiblingIds,
      );
      return;
    }

    if (isCollectionLayer(active)) {
      onReorderCollection(active.id, String(target.id));
    } else if (active.sortable) {
      onReorderTemplateLayer(active.id, String(target.id));
    }
  };

  const moveNodeToRoot = (nodeId: string) => {
    if (!rootNode) return;
    const activeNode = tree.find((node) => String(node.id) === nodeId);
    const active = activeNode?.data?.layer;
    if (!activeNode || !active || activeNode.parent === rootNode.id) return;

    if (active.id.startsWith("custom:")) {
      onMoveCustomLayerToContainer(active.id.slice("custom:".length));
      return;
    }

    if (!active.reparentable) return;
    const rootSiblingIds = tree
      .filter(
        (node) =>
          node.parent === rootNode.id &&
          isTemplateMovableLayer(node.data?.layer),
      )
      .map((node) => String(node.id));
    onMoveTemplateLayerToContainer(active.id, undefined, [
      ...rootSiblingIds,
      active.id,
    ]);
  };

  if (!rootNode) return null;

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree<LayerTreeData>
        tree={tree}
        rootId={TREE_ROOT_ID}
        initialOpen={expandedLayerIds}
        onChangeOpen={(ids) =>
          onExpandedLayerIdsChange(ids.map((id) => String(id)))
        }
        onDrop={handleDrop}
        canDrag={(node) =>
          !!node &&
          node.id !== rootNode.id &&
          isDraggableLayer(node.data?.layer)
        }
        canDrop={(currentTree, options) =>
          canDropLayer(rootNode, currentTree, options)
        }
        sort={false}
        insertDroppableFirst={false}
        dropTargetOffset={6}
        enableAnimateExpand
        rootProps={{
          "aria-label": `${rootNode.label} layer tree`,
          style: { overflowX: "hidden" },
        }}
        placeholderRender={(_node, { depth }) => {
          const inset = depth * 16 + 8;
          return (
            <div
              aria-hidden="true"
              style={{
                height: 2,
                marginLeft: inset,
                width: `calc(100% - ${inset}px)`,
                maxWidth: `calc(100% - ${inset}px)`,
                background: "currentColor",
                opacity: 0.35,
              }}
            />
          );
        }}
        dragPreviewRender={({ item }) => (
          <span
            style={{
              display: "inline-block",
              width: "max-content",
              maxWidth: 220,
              padding: "3px 7px",
              overflow: "hidden",
              background: "Canvas",
              color: "CanvasText",
              border: "1px solid currentColor",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={String(item.text)}
          >
            {item.text}
          </span>
        )}
        render={(node, params) => {
          const layer = node.data?.layer;
          const movable = layer
            ? movableSiblings(tree, node, layer)
            : [];
          const movableIndex = movable.findIndex(
            (candidate) => candidate.id === node.id,
          );
          return (
            <LayerTreeRow
              node={node}
              params={params}
              active={sameSelection(selected, layer?.selection)}
              sections={sections}
              root={node.id === rootNode.id}
              canMoveUp={movableIndex > 0}
              canMoveDown={
                movableIndex >= 0 && movableIndex < movable.length - 1
              }
              canMoveToRoot={
                !!layer &&
                node.parent !== rootNode.id &&
                (layer.id.startsWith("custom:") || !!layer.reparentable)
              }
              onSelect={onSelect}
              onRemove={onRemove}
              onMoveUp={() => moveNode(String(node.id), -1)}
              onMoveDown={() => moveNode(String(node.id), 1)}
              onMoveToRoot={() => moveNodeToRoot(String(node.id))}
            />
          );
        }}
      />
    </DndProvider>
  );
});

function LayerTreeRow({
  node,
  params,
  active,
  sections,
  root,
  canMoveUp,
  canMoveDown,
  canMoveToRoot,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onMoveToRoot,
}: {
  node: TreeNode;
  params: RenderParams;
  active: boolean;
  sections: PortfolioSection[];
  root: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canMoveToRoot: boolean;
  onSelect: (selection: SelectedElement) => void;
  onRemove: (selection: SelectedElement) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToRoot: () => void;
}) {
  const layer = node.data?.layer;
  if (!layer) return <div />;
  const label = selectedLabel(layer.selection, sections) || layer.label;
  const Icon = layerIcon(layer);
  const expandable = node.droppable || params.hasChild;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey && event.shiftKey && event.key === "ArrowLeft") {
      if (!canMoveToRoot) return;
      event.preventDefault();
      event.stopPropagation();
      onMoveToRoot();
      return;
    }
    if (event.altKey && event.key === "ArrowUp") {
      if (!canMoveUp) return;
      event.preventDefault();
      event.stopPropagation();
      onMoveUp();
      return;
    }
    if (event.altKey && event.key === "ArrowDown") {
      if (!canMoveDown) return;
      event.preventDefault();
      event.stopPropagation();
      onMoveDown();
      return;
    }
    if (event.key === "ArrowRight" && expandable && !params.isOpen) {
      event.preventDefault();
      event.stopPropagation();
      params.onToggle();
      return;
    }
    if (event.key === "ArrowLeft" && expandable && params.isOpen) {
      event.preventDefault();
      event.stopPropagation();
      params.onToggle();
      return;
    }
    if (
      event.currentTarget === event.target &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      event.stopPropagation();
      onSelect(layer.selection);
      return;
    }
    if (
      layer.removable &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      event.preventDefault();
      event.stopPropagation();
      onRemove(layer.selection);
    }
  };

  return (
    <Menu.Root>
      <Menu.ContextTrigger asChild>
        <Box
          ref={params.containerRef as unknown as Ref<HTMLDivElement>}
          data-layer-id={layer.id}
          data-selected={active || undefined}
          data-drop-target={params.isDropTarget || undefined}
          tabIndex={0}
          aria-label={`${label} layer`}
          aria-keyshortcuts="Enter ArrowLeft ArrowRight Alt+ArrowUp Alt+ArrowDown Shift+F10 Delete"
          display="flex"
          alignItems="center"
          gap="1"
          minH="34px"
          ps={`${params.depth * 16}px`}
          opacity={params.isDragging ? 0.35 : 1}
          bg={active ? "bg.subtle" : "transparent"}
          outline={
            !active && params.isDropTarget
              ? "1px dashed currentColor"
              : "none"
          }
          _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.500" }}
          onKeyDown={handleKeyDown}
        >
          {expandable ? (
            <button
              type="button"
              aria-label={`${params.isOpen ? "Collapse" : "Expand"} ${layer.label}`}
              onClick={(event) => {
                event.stopPropagation();
                params.onToggle();
              }}
              style={iconButtonStyle}
            >
              {params.isOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <Box as="span" aria-hidden="true" w="24px" />
          )}

          {!root && isDraggableLayer(layer) && (
            <Box
              ref={params.handleRef as unknown as Ref<HTMLDivElement>}
              role="button"
              tabIndex={0}
              aria-label={`Drag ${layer.label}`}
              title={`Drag ${layer.label}`}
              alignItems="center"
              display="inline-flex"
              flex="0 0 24px"
              h="24px"
              justifyContent="center"
              cursor="grab"
              _active={{ cursor: "grabbing" }}
            >
              <GripVertical size={14} />
            </Box>
          )}

          <Icon size={15} aria-hidden="true" />
          <button
            type="button"
            title={label}
            onClick={() => onSelect(layer.selection)}
            style={labelButtonStyle}
          >
            {layer.label}
          </button>

          {layer.removable && (
            <button
              type="button"
              aria-label={`Remove ${layer.label}`}
              title={`Remove ${layer.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(layer.selection);
              }}
              style={iconButtonStyle}
            >
              <Trash2 size={14} />
            </button>
          )}
        </Box>
      </Menu.ContextTrigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="60">
            <Menu.Item value="select" onSelect={() => onSelect(layer.selection)}>
              <MousePointer2 size={14} /> Select
              <Menu.ItemCommand>Enter</Menu.ItemCommand>
            </Menu.Item>
            {expandable && (
              <Menu.Item value="toggle" onSelect={params.onToggle}>
                {params.isOpen ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {params.isOpen ? "Collapse" : "Expand"}
                <Menu.ItemCommand>
                  {params.isOpen ? "←" : "→"}
                </Menu.ItemCommand>
              </Menu.Item>
            )}
            <Menu.Separator />
            <Menu.Item value="move-up" disabled={!canMoveUp} onSelect={onMoveUp}>
              <ArrowUp size={14} /> Move up
              <Menu.ItemCommand>Alt+↑</Menu.ItemCommand>
            </Menu.Item>
            <Menu.Item
              value="move-down"
              disabled={!canMoveDown}
              onSelect={onMoveDown}
            >
              <ArrowDown size={14} /> Move down
              <Menu.ItemCommand>Alt+↓</Menu.ItemCommand>
            </Menu.Item>
            <Menu.Item
              value="move-root"
              disabled={!canMoveToRoot}
              onSelect={onMoveToRoot}
            >
              <CornerUpLeft size={14} /> Move to section root
              <Menu.ItemCommand>Alt+Shift+←</Menu.ItemCommand>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item
              value="remove"
              colorPalette="red"
              disabled={!layer.removable}
              onSelect={() => onRemove(layer.selection)}
            >
              <Trash2 size={14} /> Remove
              <Menu.ItemCommand>Delete</Menu.ItemCommand>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function movableSiblings(
  tree: TreeNode[],
  activeNode: TreeNode,
  active: LayerNode,
) {
  return tree.filter((node) => {
    if (node.parent !== activeNode.parent) return false;
    const candidate = node.data?.layer;
    if (!candidate) return false;
    if (active.id.startsWith("custom:")) {
      return candidate.id.startsWith("custom:");
    }
    if (active.reparentable) {
      return isTemplateMovableLayer(candidate);
    }
    if (isCollectionLayer(active)) {
      return isSameCollectionKind(active, candidate);
    }
    return !!active.sortable && !!candidate.sortable;
  });
}

function isTemplateMovableLayer(layer: LayerNode | undefined) {
  return (
    !!layer &&
    !layer.id.startsWith("custom:") &&
    !isCollectionLayer(layer) &&
    (!!layer.reparentable || !!layer.sortable)
  );
}

function toTreeData(layers: LayerNode[]): TreeNode[] {
  const visit = (nodes: LayerNode[], parent: string): TreeNode[] =>
    nodes.flatMap((layer) => [
      {
        id: layer.id,
        parent,
        text: layer.label,
        droppable: !!layer.acceptsChildren,
        data: { layer },
      },
      ...visit(layer.children || [], layer.id),
    ]);

  return visit(layers, TREE_ROOT_ID);
}

function canDropLayer(
  rootNode: LayerNode,
  tree: TreeNode[],
  options: DropOptions<LayerTreeData>,
) {
  const active = options.dragSource?.data?.layer;
  if (!active || active.id === rootNode.id) return false;
  if (options.dropTargetId === TREE_ROOT_ID) return !!active.reparentable;

  const target = options.dropTarget?.data?.layer;
  if (!target) return false;
  const activeNode = tree.find((node) => node.id === active.id);
  if (!activeNode) return false;
  if (active.id.startsWith("custom:")) return !!target.acceptsChildren;
  if (active.reparentable) {
    if (
      !("sectionId" in active.selection) ||
      !("sectionId" in target.selection) ||
      active.selection.sectionId !== target.selection.sectionId
    ) {
      return false;
    }
    if (isNodeOrDescendant(tree, active.id, target.id)) return false;
    return (
      target.selection.kind === "section" ||
      (target.acceptsChildren &&
        target.selection.kind === "layer" &&
        !!nativeContainerLayerIdFromSelection(target.selection))
    );
  }
  if (isCollectionLayer(active) || active.sortable) {
    return activeNode.parent === options.dropTargetId;
  }
  return false;
}

function isNodeOrDescendant(
  tree: TreeNode[],
  ancestorId: string,
  targetId: string,
) {
  let currentId: string | number = targetId;
  while (currentId !== TREE_ROOT_ID) {
    if (String(currentId) === ancestorId) return true;
    const current = tree.find((node) => node.id === currentId);
    if (!current) return false;
    currentId = current.parent;
  }
  return false;
}

function isSameCollectionKind(
  left: LayerNode | undefined,
  right: LayerNode | undefined,
) {
  if (!left || !right) return false;
  const collectionKinds = ["project", "certification", "service"];
  return (
    collectionKinds.includes(left.selection.kind) &&
    left.selection.kind === right.selection.kind
  );
}

function isCollectionLayer(layer: LayerNode | undefined) {
  return (
    !!layer &&
    ["project", "certification", "service"].includes(layer.selection.kind)
  );
}

function isDraggableLayer(layer: LayerNode | undefined) {
  return (
    !!layer &&
    (layer.id.startsWith("custom:") ||
      !!layer.reparentable ||
      !!layer.sortable ||
      isCollectionLayer(layer))
  );
}

function reorderTarget(
  previousTree: TreeNode[],
  nextTree: TreeNode[],
  previousActiveNode: TreeNode,
  nextActiveNode: TreeNode,
  matches: (node: TreeNode) => boolean,
) {
  if (previousActiveNode.parent !== nextActiveNode.parent) return undefined;
  const previousSiblings = previousTree.filter(
    (node) => node.parent === previousActiveNode.parent && matches(node),
  );
  const nextSiblings = nextTree.filter(
    (node) => node.parent === nextActiveNode.parent && matches(node),
  );
  const nextIndex = nextSiblings.findIndex(
    (node) => node.id === nextActiveNode.id,
  );
  const target = previousSiblings[nextIndex];
  return target && target.id !== nextActiveNode.id
    ? String(target.id)
    : undefined;
}

function layerIcon(layer: LayerNode) {
  if (layer.selection.kind === "section") return Rows3;
  if (layer.customType === "div") return Square;
  if (layer.customType === "text" || layer.selection.kind === "text") {
    return Type;
  }
  if (layer.customType === "button") return MousePointerClick;
  if (layer.customType === "image" || layer.selection.kind === "image") {
    return Image;
  }
  if (
    layer.selection.kind === "layer" &&
    /(?:image|icon)$/.test(layer.selection.layerId)
  ) {
    return Image;
  }
  if (
    layer.selection.kind === "project" ||
    layer.selection.kind === "certification" ||
    layer.selection.kind === "service"
  ) {
    return Square;
  }
  return Layers3;
}

function sameSelection(
  left: SelectedElement | undefined,
  right: SelectedElement | undefined,
) {
  if (!left || !right || left.kind !== right.kind) return false;
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

const iconButtonStyle = {
  alignItems: "center",
  background: "transparent",
  border: 0,
  color: "inherit",
  display: "inline-flex",
  flex: "0 0 24px",
  height: 24,
  justifyContent: "center",
  padding: 0,
  width: 24,
} as const;

const labelButtonStyle = {
  background: "transparent",
  border: 0,
  color: "inherit",
  cursor: "pointer",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  padding: "4px 2px",
  textAlign: "left",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;
