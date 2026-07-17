import type { CustomLayer } from "../types/portfolio";

export function findCustomLayer(
  layers: CustomLayer[] | undefined,
  id: string,
): CustomLayer | undefined {
  for (const layer of layers || []) {
    if (layer.id === id) return layer;
    const child = findCustomLayer(layer.children, id);
    if (child) return child;
  }
  return undefined;
}

export function findCustomLayerParentId(
  layers: CustomLayer[] | undefined,
  id: string,
  parentId?: string,
): string | undefined {
  for (const layer of layers || []) {
    if (layer.id === id) return parentId;
    const childParent = findCustomLayerParentId(layer.children, id, layer.id);
    if (childParent !== undefined) return childParent;
  }
  return undefined;
}

export function appendCustomLayer(
  layers: CustomLayer[] | undefined,
  layer: CustomLayer,
  parentId?: string,
): CustomLayer[] {
  const current = layers || [];
  if (!parentId) return [...current, layer];
  return current.map((item) =>
    item.id === parentId && item.type === "div"
      ? { ...item, children: [...(item.children || []), layer] }
      : {
          ...item,
          children: item.children
            ? appendCustomLayer(item.children, layer, parentId)
            : item.children,
        },
  );
}

export function updateCustomLayer(
  layers: CustomLayer[] | undefined,
  id: string,
  updates: Partial<Omit<CustomLayer, "id" | "type" | "children">>,
): CustomLayer[] {
  return (layers || []).map((layer) => ({
    ...layer,
    ...(layer.id === id ? updates : {}),
    children: layer.children
      ? updateCustomLayer(layer.children, id, updates)
      : undefined,
  }));
}

export function deleteCustomLayer(
  layers: CustomLayer[] | undefined,
  id: string,
): CustomLayer[] {
  return (layers || [])
    .filter((layer) => layer.id !== id)
    .map((layer) => ({
      ...layer,
      children: layer.children
        ? deleteCustomLayer(layer.children, id)
        : undefined,
    }));
}

export function moveCustomLayer(
  layers: CustomLayer[] | undefined,
  activeId: string,
  overId: string,
): CustomLayer[] {
  const current = layers || [];
  const active = findCustomLayer(current, activeId);
  const over = findCustomLayer(current, overId);
  if (!active || !over || active.id === over.id) return current;
  if (findCustomLayer(active.children, over.id)) return current;

  const withoutActive = deleteCustomLayer(current, activeId);

  // A Div is a container target, even when it currently shares the same parent
  // as the dragged layer. Dropping on its row should always nest the layer.
  if (over.type === "div") {
    return appendCustomLayer(
      withoutActive,
      { ...active, parentLayerId: undefined },
      over.id,
    );
  }
  return insertBeforeCustomLayer(withoutActive, active, over.id);
}

export function moveCustomLayerToNativeContainer(
  layers: CustomLayer[] | undefined,
  activeId: string,
  parentLayerId: string,
): CustomLayer[] {
  const current = layers || [];
  const active = findCustomLayer(current, activeId);
  if (!active) return current;
  return [
    ...deleteCustomLayer(current, activeId),
    { ...active, parentLayerId },
  ];
}

function insertBeforeCustomLayer(
  layers: CustomLayer[],
  layer: CustomLayer,
  overId: string,
): CustomLayer[] {
  const overIndex = layers.findIndex((item) => item.id === overId);
  if (overIndex >= 0) {
    const next = [...layers];
    next.splice(overIndex, 0, layer);
    return next;
  }
  return layers.map((item) => ({
    ...item,
    children: item.children
      ? insertBeforeCustomLayer(item.children, layer, overId)
      : undefined,
  }));
}
