import { create } from "zustand";
import { produce, type Draft } from "immer";
import { nanoid } from "nanoid";
import {
  CertificationItem,
  CustomLayer,
  ElementSettings,
  ImageAsset,
  Portfolio,
  PortfolioHead,
  PortfolioSection,
  PreviewMode,
  ProjectItem,
  SelectedElement,
  ServiceItem
} from "../types/portfolio";
import {
  appendCustomLayer,
  deleteCustomLayer,
  duplicateCustomLayer,
  findCustomLayer,
  moveCustomLayer,
  moveCustomLayerToNativeContainer,
  updateCustomLayer,
} from "../utils/customLayers";
import { createContentField, contentValue, materializeContent } from "../utils/contentFields";
import { contentFieldFromElementKey } from "../utils/elementSettings";

export interface EditorHistoryEntry {
  id: string;
  label: string;
  portfolio: Portfolio;
}

type NewSectionPlacement = {
  id?: string;
  parentSectionId?: string;
  parentLayerId?: string;
};

interface EditorState {
  portfolio?: Portfolio;
  selected?: SelectedElement;
  previewMode: PreviewMode;
  history: EditorHistoryEntry[];
  future: EditorHistoryEntry[];
  currentHistoryLabel: string;
  activeEditGroup?: string;
  unsaved: boolean;
  setPortfolio: (portfolio: Portfolio) => void;
  select: (selected?: SelectedElement) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  updateHead: (updates: Partial<PortfolioHead>) => void;
  updateOwner: (field: keyof Portfolio["owner"], value: unknown) => void;
  updatePortfolioSettings: (updates: Partial<Portfolio["settings"]>) => void;
  updateSection: (sectionId: string, updates: Partial<PortfolioSection>) => void;
  updateElementSettings: (sectionId: string, elementKey: string, updates: Partial<ElementSettings>) => void;
  updateSectionContent: (sectionId: string, field: string, value: unknown) => void;
  updateSectionImage: (sectionId: string, field: string, image?: ImageAsset) => void;
  reorderSections: (activeId: string, overId: string) => void;
  duplicateSection: (sectionId: string) => void;
  deleteSection: (sectionId: string) => void;
  addSection: (
    type: "custom" | "projects" | "certifications" | "services" | "about",
    placement?: NewSectionPlacement,
  ) => void;
  updateCollectionItem: (sectionId: string, itemId: string, value: Record<string, unknown>) => void;
  addCollectionItem: (sectionId: string) => void;
  deleteCollectionItem: (sectionId: string, itemId: string) => void;
  duplicateCollectionItem: (sectionId: string, itemId: string) => void;
  reorderCollectionItems: (sectionId: string, activeId: string, overId: string) => void;
  reorderTemplateLayers: (sectionId: string, activeId: string, overId: string) => void;
  moveTemplateLayerToContainer: (
    sectionId: string,
    activeId: string,
    parentLayerId: string | undefined,
    siblingIds: string[],
  ) => void;
  addCustomLayer: (sectionId: string, layer: CustomLayer, parentId?: string) => void;
  updateCustomLayer: (sectionId: string, layerId: string, updates: Partial<Omit<CustomLayer, "id" | "type" | "children">>) => void;
  deleteCustomLayer: (sectionId: string, layerId: string) => void;
  duplicateCustomLayer: (sectionId: string, layerId: string) => void;
  reorderCustomLayers: (sectionId: string, activeId: string, overId: string) => void;
  moveCustomLayerToContainer: (sectionId: string, activeId: string, parentLayerId?: string) => void;
  undo: () => void;
  redo: () => void;
  restoreHistory: (entryId: string) => void;
  markSaved: (portfolio: Portfolio) => void;
}

function historyEntry(portfolio: Portfolio, label: string): EditorHistoryEntry {
  return { id: nanoid(), label, portfolio };
}

function mutatePortfolio(
  state: EditorState,
  label: string,
  updater: (portfolio: Draft<Portfolio>) => void,
  editGroup?: string,
): Partial<EditorState> {
  if (!state.portfolio) return {};
  const previous = state.portfolio;
  const continuesCurrentEdit =
    !!editGroup && state.activeEditGroup === editGroup;
  const next = produce(previous, (draft) => {
    updater(draft);
    draft.updatedAt = new Date().toISOString();
  });
  return {
    portfolio: next,
    history: continuesCurrentEdit
      ? state.history
      : [
          ...state.history,
          historyEntry(previous, state.currentHistoryLabel),
        ].slice(-5),
    future: continuesCurrentEdit ? state.future : [],
    currentHistoryLabel: label,
    activeEditGroup: editGroup,
    unsaved: true
  };
}

function selectionIdentity(selected: SelectedElement | undefined) {
  if (!selected) return "none";
  if (selected.kind === "head" || selected.kind === "body") {
    return selected.kind;
  }
  if (selected.kind === "section") return `section:${selected.sectionId}`;
  if (selected.kind === "layer") {
    return `layer:${selected.sectionId}:${selected.layerId}`;
  }
  if (selected.kind === "text") {
    return `text:${selected.sectionId}:${selected.field}`;
  }
  if (selected.kind === "image") {
    return `image:${selected.sectionId}:${selected.slot}`;
  }
  return `${selected.kind}:${selected.sectionId}:${selected.itemId}`;
}

function editGroup(state: EditorState) {
  return `input:${selectionIdentity(state.selected)}`;
}

function sectionLabel(state: EditorState, sectionId: string) {
  return state.portfolio?.sections.find((section) => section.id === sectionId)
    ?.label || "section";
}

function humanize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function normalizeOrder(sections: PortfolioSection[]) {
  const header = sections.find((section) => section.type === "header");
  const footer = sections.find((section) => section.type === "footer");
  const middle = sections.filter((section) => section.type !== "header" && section.type !== "footer");
  return [header, ...middle, footer].filter(Boolean).map((section, order) => ({ ...section!, order }));
}

function sectionSubtreeIds(sections: PortfolioSection[], rootId: string) {
  const ids = new Set([rootId]);
  let foundChild = true;
  while (foundChild) {
    foundChild = false;
    for (const section of sections) {
      if (
        section.parentSectionId &&
        ids.has(section.parentSectionId) &&
        !ids.has(section.id)
      ) {
        ids.add(section.id);
        foundChild = true;
      }
    }
  }
  return ids;
}

function nestedSectionIdsAtPlacement(
  sections: PortfolioSection[],
  parentSectionId: string,
  parentLayerIds: Set<string>,
) {
  const ids = new Set<string>();
  for (const section of sections) {
    if (
      section.parentSectionId === parentSectionId &&
      section.parentLayerId &&
      parentLayerIds.has(section.parentLayerId)
    ) {
      for (const id of sectionSubtreeIds(sections, section.id)) ids.add(id);
    }
  }
  return ids;
}

function customLayerSubtreeIds(layer: CustomLayer): string[] {
  return [
    layer.id,
    ...(layer.children || []).flatMap(customLayerSubtreeIds),
  ];
}

export const useEditorStore = create<EditorState>((set) => ({
  previewMode: "desktop",
  history: [],
  future: [],
  currentHistoryLabel: "Opened portfolio",
  unsaved: false,
  setPortfolio: (portfolio) =>
    set({
      portfolio: ensurePortfolioHead(portfolio),
      selected: { kind: "section", sectionId: portfolio.sections.find((section) => section.type === "hero")?.id || portfolio.sections[0].id },
      history: [],
      future: [],
      currentHistoryLabel: "Opened portfolio",
      activeEditGroup: undefined,
      unsaved: false
    }),
  select: (selected) =>
    set((state) => ({
      selected,
      activeEditGroup:
        selectionIdentity(state.selected) === selectionIdentity(selected)
          ? state.activeEditGroup
          : undefined,
    })),
  setPreviewMode: (previewMode) => set({ previewMode }),
  updateHead: (updates) =>
    set((state) =>
      mutatePortfolio(
        state,
        "Updated page metadata",
        (portfolio) => {
          portfolio.head = { ...defaultHead(portfolio), ...(portfolio.head || {}), ...updates };
          if (updates.title) portfolio.title = updates.title;
        },
        editGroup(state),
      )
    ),
  updateOwner: (field, value) =>
    set((state) =>
      mutatePortfolio(
        state,
        `Updated ${humanize(String(field))}`,
        (portfolio) => {
          portfolio.owner = { ...portfolio.owner, [field]: value };
        },
        editGroup(state),
      )
    ),
  updatePortfolioSettings: (updates) =>
    set((state) =>
      mutatePortfolio(
        state,
        "Updated portfolio settings",
        (portfolio) => {
          portfolio.settings = { ...portfolio.settings, ...updates };
        },
        editGroup(state),
      )
    ),
  updateSection: (sectionId, updates) =>
    set((state) =>
      mutatePortfolio(
        state,
        `Updated ${sectionLabel(state, sectionId)}`,
        (portfolio) => {
          portfolio.sections = portfolio.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section));
        },
        editGroup(state),
      )
    ),
  updateElementSettings: (sectionId, elementKey, updates) =>
    set((state) =>
      mutatePortfolio(
        state,
        "Styled selected element",
        (portfolio) => {
          portfolio.sections = portfolio.sections.map((section) => {
            if (section.id !== sectionId) return section;
            const contentField = contentFieldFromElementKey(elementKey, section);
            if (contentField) {
              const current = section.content[contentField] || createContentField(undefined);
              return {
                ...section,
                content: {
                  ...section.content,
                  [contentField]: {
                    ...current,
                    style: { ...current.style, ...updates },
                  },
                },
              };
            }
            const current = section.elements?.[elementKey] || {};
            return {
              ...section,
              elements: {
                ...(section.elements || {}),
                [elementKey]: { ...current, ...updates }
              }
            };
          });
        },
        editGroup(state),
      )
    ),
  updateSectionContent: (sectionId, field, value) =>
    set((state) =>
      mutatePortfolio(
        state,
        `Edited ${humanize(field)}`,
        (portfolio) => {
          portfolio.sections = portfolio.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  content: {
                    ...section.content,
                    [field]: {
                      ...(section.content[field] || createContentField(undefined)),
                      value,
                    },
                  },
                }
              : section
          );
        },
        editGroup(state),
      )
    ),
  updateSectionImage: (sectionId, field, image) =>
    set((state) =>
      mutatePortfolio(
        state,
        `${image ? "Updated" : "Removed"} ${humanize(field)} image`,
        (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                content: {
                  ...section.content,
                  [field]: {
                    ...(section.content[field] || createContentField(undefined)),
                    value: image ?? null,
                  },
                },
              }
            : section
        );
        },
      )
    ),
  reorderSections: (activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, "Reordered sections", (portfolio) => {
        const activeSection = portfolio.sections.find(
          (section) => section.id === activeId,
        );
        if (!activeSection) return;
        const movable = portfolio.sections
          .filter(
            (section) =>
              !section.locked &&
              section.parentSectionId === activeSection.parentSectionId &&
              section.parentLayerId === activeSection.parentLayerId,
          )
          .sort((a, b) => a.order - b.order);
        const activeIndex = movable.findIndex((section) => section.id === activeId);
        const overIndex = movable.findIndex((section) => section.id === overId);
        if (activeIndex < 0 || overIndex < 0) return;
        const siblingOrders = movable.map((section) => section.order).sort((a, b) => a - b);
        const [moved] = movable.splice(activeIndex, 1);
        movable.splice(overIndex, 0, moved);
        const nextOrder = new Map(
          movable.map((section, index) => [section.id, siblingOrders[index]]),
        );
        portfolio.sections = portfolio.sections.map((section) => ({
          ...section,
          order: nextOrder.get(section.id) ?? section.order,
        }));
      })
    ),
  duplicateSection: (sectionId) =>
    set((state) =>
      mutatePortfolio(state, `Duplicated ${sectionLabel(state, sectionId)}`, (portfolio) => {
        const section = portfolio.sections.find((item) => item.id === sectionId);
        if (!section || section.locked || section.type === "header" || section.type === "footer") return;
        const copy: PortfolioSection = structuredClone(section);
        portfolio.sections = normalizeOrder([
          ...portfolio.sections,
          { ...copy, id: nanoid(), label: `${section.label} copy`, locked: false, order: portfolio.sections.length - 1 }
        ]);
      })
    ),
  deleteSection: (sectionId) =>
    set((state) =>
      mutatePortfolio(state, `Deleted ${sectionLabel(state, sectionId)}`, (portfolio) => {
        const section = portfolio.sections.find((item) => item.id === sectionId);
        if (!section || section.type === "header" || section.type === "footer") return;
        const removedIds = sectionSubtreeIds(portfolio.sections, sectionId);
        portfolio.sections = normalizeOrder(
          portfolio.sections.filter((item) => !removedIds.has(item.id)),
        );
      })
    ),
  addSection: (type, placement = {}) =>
    set((state) =>
      mutatePortfolio(state, `Added ${humanize(type)} section`, (portfolio) => {
        const label =
          type === "custom"
            ? "Blank section"
            : type[0].toUpperCase() + type.slice(1);
        portfolio.sections = normalizeOrder([
          ...portfolio.sections,
          {
            id: placement.id || nanoid(),
            type,
            parentSectionId: placement.parentSectionId,
            parentLayerId: placement.parentLayerId,
            label,
            visible: true,
            locked: false,
            order: portfolio.sections.length - 1,
            content: materializeContent(
              type === "custom"
                ? {}
                : type === "about"
                  ? { title: "About", description: portfolio.owner.aboutDescription || "" }
                  : type === "projects"
                    ? {
                        title: "Projects",
                        description: "A selection of recent work.",
                        items: [
                          {
                            id: nanoid(),
                            title: "New project",
                            description: "Describe the project and its outcome.",
                            tags: [],
                            projectUrl: "",
                            repositoryUrl: "",
                            role: "",
                            completionDate: "",
                            featured: false,
                          },
                        ],
                      }
                    : { title: label, items: [] },
            ),
            customLayers: type === "custom" ? [] : undefined,
            settings: {
              layoutMode: "stack",
              stackDirection: "column",
              stackAlign: "stretch",
              stackJustify: "flex-start",
              stackGap: 0,
              layoutWrap: false,
              spacing: "medium",
              contentWidth: "standard",
            }
          }
        ]);
      })
    ),
  updateCollectionItem: (sectionId, itemId, value) =>
    set((state) =>
      mutatePortfolio(
        state,
        "Updated collection item",
        (portfolio) => {
          portfolio.sections = portfolio.sections.map((section) => {
            if (section.id !== sectionId) return section;
            const items = (contentValue<Record<string, unknown>[]>(section, "items") || []).map((item) =>
              item.id === itemId ? { ...item, ...value } : item
            );
            return { ...section, content: { ...section.content, items: { ...section.content.items, value: items } } };
          });
        },
        editGroup(state),
      )
    ),
  addCollectionItem: (sectionId) =>
    set((state) =>
      mutatePortfolio(state, `Added item to ${sectionLabel(state, sectionId)}`, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          let item: ProjectItem | CertificationItem | ServiceItem;
          if (section.type === "projects") {
            item = { id: nanoid(), title: "New project", description: "Describe the project outcome.", tags: ["New"], featured: false };
          } else if (section.type === "certifications") {
            item = { id: nanoid(), name: "New certification", organization: "Organization" };
          } else {
            item = { id: nanoid(), title: "New service", description: "Describe the service.", ctaText: "Contact" };
          }
          const items = contentValue<unknown[]>(section, "items") || [];
          return { ...section, content: { ...section.content, items: { ...(section.content.items || createContentField([])), value: [...items, item] } } };
        });
      })
    ),
  deleteCollectionItem: (sectionId, itemId) =>
    set((state) =>
      mutatePortfolio(state, `Deleted item from ${sectionLabel(state, sectionId)}`, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const items = (contentValue<Record<string, unknown>[]>(section, "items") || []).filter((item) => item.id !== itemId);
          return { ...section, content: { ...section.content, items: { ...section.content.items, value: items } } };
        });
        const nestedIds = nestedSectionIdsAtPlacement(
          portfolio.sections,
          sectionId,
          new Set([
            `project:${itemId}`,
            `certification:${itemId}`,
            `service:${itemId}`,
          ]),
        );
        portfolio.sections = portfolio.sections.filter(
          (section) => !nestedIds.has(section.id),
        );
      })
    ),
  duplicateCollectionItem: (sectionId, itemId) =>
    set((state) =>
      mutatePortfolio(state, `Duplicated item in ${sectionLabel(state, sectionId)}`, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const items = [...(contentValue<Record<string, unknown>[]>(section, "items") || [])];
          const index = items.findIndex((item) => item.id === itemId);
          if (index < 0) return section;
          const copy = structuredClone(items[index]);
          copy.id = nanoid();
          items.splice(index + 1, 0, copy);
          return { ...section, content: { ...section.content, items: { ...section.content.items, value: items } } };
        });
      }),
    ),
  reorderCollectionItems: (sectionId, activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, `Reordered ${sectionLabel(state, sectionId)} items`, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const items = [...(contentValue<Record<string, unknown>[]>(section, "items") || [])];
          const activeIndex = items.findIndex((item) => item.id === activeId);
          const overIndex = items.findIndex((item) => item.id === overId);
          if (activeIndex < 0 || overIndex < 0) return section;
          const [moved] = items.splice(activeIndex, 1);
          items.splice(overIndex, 0, moved);
          return { ...section, content: { ...section.content, items: { ...section.content.items, value: items } } };
        });
      })
    ),
  reorderTemplateLayers: (sectionId, activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, "Reordered template layers", (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const fallbackOrder =
            section.type === "hero"
              ? [
                  `${section.id}-hero-content`,
                  `${section.id}-text-eyebrow`,
                  `${section.id}-text-headline`,
                  `${section.id}-text-description`,
                  `${section.id}-hero-actions`,
                  `${section.id}-text-primaryCta`,
                  `${section.id}-text-secondaryCta`,
                  `${section.id}-image-image`,
                ]
              : section.type === "projects"
                ? [
                    `${section.id}-project-content`,
                    `${section.id}-projects-list`,
                  ]
              : [];
          const order = [
            ...new Set([
              ...(section.settings.templateLayerOrder || []),
              ...fallbackOrder,
            ]),
          ];
          const fromIndex = order.indexOf(activeId);
          const toIndex = order.indexOf(overId);
          if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
            return section;
          }
          const nextOrder = [...order];
          const [moved] = nextOrder.splice(fromIndex, 1);
          nextOrder.splice(toIndex, 0, moved);
          return {
            ...section,
            settings: {
              ...section.settings,
              templateLayerOrder: nextOrder,
            },
          };
        });
      }),
    ),
  moveTemplateLayerToContainer: (
    sectionId,
    activeId,
    parentLayerId,
    siblingIds,
  ) =>
    set((state) =>
      mutatePortfolio(state, "Moved template layer", (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const siblingSet = new Set(siblingIds);
          return {
            ...section,
            settings: {
              ...section.settings,
              templateLayerParents: {
                ...(section.settings.templateLayerParents || {}),
                [activeId]: parentLayerId ?? null,
              },
              templateLayerOrder: [
                ...siblingIds,
                ...(section.settings.templateLayerOrder || []).filter(
                  (id) => !siblingSet.has(id),
                ),
              ],
            },
          };
        });
      }),
    ),
  addCustomLayer: (sectionId, layer, parentId) =>
    set((state) =>
      mutatePortfolio(state, `Added ${layer.name}`, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customLayers: appendCustomLayer(
                  section.customLayers,
                  layer,
                  parentId,
                ),
              }
            : section,
        );
      }),
    ),
  updateCustomLayer: (sectionId, layerId, updates) =>
    set((state) =>
      mutatePortfolio(
        state,
        "Updated custom layer",
        (portfolio) => {
          portfolio.sections = portfolio.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  customLayers: updateCustomLayer(
                    section.customLayers,
                    layerId,
                    updates,
                  ),
                }
              : section,
          );
        },
        editGroup(state),
      ),
    ),
  deleteCustomLayer: (sectionId, layerId) =>
    set((state) =>
      mutatePortfolio(state, "Deleted custom layer", (portfolio) => {
        const ownerSection = portfolio.sections.find(
          (section) => section.id === sectionId,
        );
        const removedLayer = findCustomLayer(
          ownerSection?.customLayers,
          layerId,
        );
        const removedLayerIds = new Set(
          (removedLayer ? customLayerSubtreeIds(removedLayer) : [layerId]).map(
            (id) => `custom:${id}`,
          ),
        );
        const nestedIds = nestedSectionIdsAtPlacement(
          portfolio.sections,
          sectionId,
          removedLayerIds,
        );
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customLayers: deleteCustomLayer(section.customLayers, layerId),
              }
            : section,
        );
        portfolio.sections = portfolio.sections.filter(
          (section) => !nestedIds.has(section.id),
        );
      }),
    ),
  duplicateCustomLayer: (sectionId, layerId) =>
    set((state) =>
      mutatePortfolio(state, "Duplicated custom layer", (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customLayers: duplicateCustomLayer(
                  section.customLayers,
                  layerId,
                  nanoid,
                ),
              }
            : section,
        );
      }),
    ),
  reorderCustomLayers: (sectionId, activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, "Reordered custom layers", (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customLayers: moveCustomLayer(
                  section.customLayers,
                  activeId,
                  overId,
                ),
              }
            : section,
        );
      }),
    ),
  moveCustomLayerToContainer: (sectionId, activeId, parentLayerId) =>
    set((state) =>
      mutatePortfolio(state, "Moved custom layer into template container", (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customLayers: moveCustomLayerToNativeContainer(
                  section.customLayers,
                  activeId,
                  parentLayerId,
                ),
              }
            : section,
        );
      }),
    ),
  undo: () =>
    set((state) => {
      const previous = state.history.at(-1);
      if (!previous || !state.portfolio) return {};
      return {
        portfolio: previous.portfolio,
        selected: selectionForPortfolio(state.selected, previous.portfolio),
        history: state.history.slice(0, -1),
        future: [
          historyEntry(state.portfolio, state.currentHistoryLabel),
          ...state.future,
        ].slice(0, 5),
        currentHistoryLabel: previous.label,
        activeEditGroup: undefined,
        unsaved: true
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next || !state.portfolio) return {};
      return {
        portfolio: next.portfolio,
        selected: selectionForPortfolio(state.selected, next.portfolio),
        history: [
          ...state.history,
          historyEntry(state.portfolio, state.currentHistoryLabel),
        ].slice(-5),
        future: state.future.slice(1),
        currentHistoryLabel: next.label,
        activeEditGroup: undefined,
        unsaved: true
      };
    }),
  restoreHistory: (entryId) =>
    set((state) => {
      if (!state.portfolio) return {};
      const targetIndex = state.history.findIndex(
        (entry) => entry.id === entryId,
      );
      if (targetIndex < 0) return {};

      const target = state.history[targetIndex];
      const future = [
        ...state.history.slice(targetIndex + 1),
        historyEntry(state.portfolio, state.currentHistoryLabel),
        ...state.future,
      ].slice(0, 5);

      return {
        portfolio: target.portfolio,
        selected: selectionForPortfolio(state.selected, target.portfolio),
        history: state.history.slice(0, targetIndex),
        future,
        currentHistoryLabel: target.label,
        activeEditGroup: undefined,
        unsaved: true,
      };
    }),
  markSaved: (portfolio) => set({ portfolio, unsaved: false })
}));

function selectionForPortfolio(
  selected: SelectedElement | undefined,
  portfolio: Portfolio,
) {
  if (!selected || !("sectionId" in selected)) return selected;
  if (portfolio.sections.some((section) => section.id === selected.sectionId)) {
    return selected;
  }

  const fallbackSection =
    portfolio.sections.find((section) => section.type === "hero") ||
    portfolio.sections[0];
  return fallbackSection
    ? ({ kind: "section", sectionId: fallbackSection.id } as SelectedElement)
    : undefined;
}

function defaultHead(portfolio: Portfolio): PortfolioHead {
  return {
    title: portfolio.title || `${portfolio.owner.fullName} - ${portfolio.owner.professionalTitle}`,
    description: portfolio.owner.shortDescription || "",
    keywords: `${portfolio.owner.fullName}, ${portfolio.owner.professionalTitle}, portfolio`,
    author: portfolio.owner.fullName,
    canonicalUrl: "",
    favicon: "",
    ogTitle: portfolio.title || `${portfolio.owner.fullName} Portfolio`,
    ogDescription: portfolio.owner.shortDescription || "",
    ogImage: portfolio.owner.profileImage?.url || "",
    twitterTitle: portfolio.title || `${portfolio.owner.fullName} Portfolio`,
    twitterDescription: portfolio.owner.shortDescription || "",
    twitterImage: portfolio.owner.profileImage?.url || "",
    robots: "index,follow"
  };
}

function ensurePortfolioHead(portfolio: Portfolio): Portfolio {
  return {
    ...portfolio,
    head: { ...defaultHead(portfolio), ...(portfolio.head || {}) }
  };
}
