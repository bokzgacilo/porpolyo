import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  CertificationItem,
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

interface EditorState {
  portfolio?: Portfolio;
  selected?: SelectedElement;
  previewMode: PreviewMode;
  history: Portfolio[];
  future: Portfolio[];
  unsaved: boolean;
  setPortfolio: (portfolio: Portfolio) => void;
  select: (selected: SelectedElement) => void;
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
  addSection: (type: "projects" | "certifications" | "services" | "about") => void;
  updateCollectionItem: (sectionId: string, itemId: string, value: Record<string, unknown>) => void;
  addCollectionItem: (sectionId: string) => void;
  deleteCollectionItem: (sectionId: string, itemId: string) => void;
  reorderCollectionItems: (sectionId: string, activeId: string, overId: string) => void;
  undo: () => void;
  redo: () => void;
  markSaved: (portfolio: Portfolio) => void;
}

const clone = (portfolio: Portfolio) => structuredClone(portfolio);

function mutatePortfolio(state: EditorState, updater: (portfolio: Portfolio) => void): Partial<EditorState> {
  if (!state.portfolio) return {};
  const previous = clone(state.portfolio);
  const next = clone(state.portfolio);
  updater(next);
  next.updatedAt = new Date().toISOString();
  return {
    portfolio: next,
    history: [...state.history.slice(-24), previous],
    future: [],
    unsaved: true
  };
}

const sortable = (sections: PortfolioSection[]) =>
  sections.filter((section) => !section.locked).sort((a, b) => a.order - b.order);

function normalizeOrder(sections: PortfolioSection[]) {
  const header = sections.find((section) => section.type === "header");
  const footer = sections.find((section) => section.type === "footer");
  const middle = sections.filter((section) => section.type !== "header" && section.type !== "footer");
  return [header, ...middle, footer].filter(Boolean).map((section, order) => ({ ...section!, order }));
}

export const useEditorStore = create<EditorState>((set) => ({
  previewMode: "desktop",
  history: [],
  future: [],
  unsaved: false,
  setPortfolio: (portfolio) =>
    set({
      portfolio: ensurePortfolioHead(portfolio),
      selected: { kind: "section", sectionId: portfolio.sections.find((section) => section.type === "hero")?.id || portfolio.sections[0].id },
      history: [],
      future: [],
      unsaved: false
    }),
  select: (selected) => set({ selected }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  updateHead: (updates) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.head = { ...defaultHead(portfolio), ...(portfolio.head || {}), ...updates };
        if (updates.title) portfolio.title = updates.title;
      })
    ),
  updateOwner: (field, value) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.owner = { ...portfolio.owner, [field]: value };
      })
    ),
  updatePortfolioSettings: (updates) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.settings = { ...portfolio.settings, ...updates };
      })
    ),
  updateSection: (sectionId, updates) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section));
      })
    ),
  updateElementSettings: (sectionId, elementKey, updates) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const current = section.elements?.[elementKey] || {};
          return {
            ...section,
            elements: {
              ...(section.elements || {}),
              [elementKey]: { ...current, ...updates }
            }
          };
        });
      })
    ),
  updateSectionContent: (sectionId, field, value) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId ? { ...section, content: { ...section.content, [field]: value } } : section
        );
      })
    ),
  updateSectionImage: (sectionId, field, image) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) =>
          section.id === sectionId ? { ...section, content: { ...section.content, [field]: image } } : section
        );
      })
    ),
  reorderSections: (activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        const movable = sortable(portfolio.sections);
        const activeIndex = movable.findIndex((section) => section.id === activeId);
        const overIndex = movable.findIndex((section) => section.id === overId);
        if (activeIndex < 0 || overIndex < 0) return;
        const [moved] = movable.splice(activeIndex, 1);
        movable.splice(overIndex, 0, moved);
        const fixed = portfolio.sections.filter((section) => section.locked);
        portfolio.sections = normalizeOrder([...fixed, ...movable]);
      })
    ),
  duplicateSection: (sectionId) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
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
      mutatePortfolio(state, (portfolio) => {
        const section = portfolio.sections.find((item) => item.id === sectionId);
        if (!section || section.type === "header" || section.type === "footer") return;
        portfolio.sections = normalizeOrder(portfolio.sections.filter((item) => item.id !== sectionId));
      })
    ),
  addSection: (type) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        const label = type[0].toUpperCase() + type.slice(1);
        portfolio.sections = normalizeOrder([
          ...portfolio.sections,
          {
            id: nanoid(),
            type,
            label,
            visible: true,
            locked: false,
            order: portfolio.sections.length - 1,
            content: type === "about" ? { title: "About", description: portfolio.owner.aboutDescription || "" } : { title: label, items: [] },
            settings: { spacing: "medium", contentWidth: "standard" }
          }
        ]);
      })
    ),
  updateCollectionItem: (sectionId, itemId, value) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const items = ((section.content.items || []) as Record<string, unknown>[]).map((item) =>
            item.id === itemId ? { ...item, ...value } : item
          );
          return { ...section, content: { ...section.content, items } };
        });
      })
    ),
  addCollectionItem: (sectionId) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
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
          return { ...section, content: { ...section.content, items: [...((section.content.items || []) as unknown[]), item] } };
        });
      })
    ),
  deleteCollectionItem: (sectionId, itemId) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          return { ...section, content: { ...section.content, items: ((section.content.items || []) as Record<string, unknown>[]).filter((item) => item.id !== itemId) } };
        });
      })
    ),
  reorderCollectionItems: (sectionId, activeId, overId) =>
    set((state) =>
      mutatePortfolio(state, (portfolio) => {
        portfolio.sections = portfolio.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const items = [...((section.content.items || []) as Record<string, unknown>[])];
          const activeIndex = items.findIndex((item) => item.id === activeId);
          const overIndex = items.findIndex((item) => item.id === overId);
          if (activeIndex < 0 || overIndex < 0) return section;
          const [moved] = items.splice(activeIndex, 1);
          items.splice(overIndex, 0, moved);
          return { ...section, content: { ...section.content, items } };
        });
      })
    ),
  undo: () =>
    set((state) => {
      const previous = state.history.at(-1);
      if (!previous || !state.portfolio) return {};
      return {
        portfolio: previous,
        history: state.history.slice(0, -1),
        future: [clone(state.portfolio), ...state.future],
        unsaved: true
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next || !state.portfolio) return {};
      return {
        portfolio: next,
        history: [...state.history, clone(state.portfolio)],
        future: state.future.slice(1),
        unsaved: true
      };
    }),
  markSaved: (portfolio) => set({ portfolio, unsaved: false })
}));

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
