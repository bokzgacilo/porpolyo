import type {
  PortfolioSection,
  SelectedElement,
} from "../../types/portfolio";
import { selectedElementKey } from "../../utils/elementSettings";

export function findSelectedTarget(
  viewport: HTMLElement,
  selected: SelectedElement,
) {
  if (!("sectionId" in selected)) return undefined;
  const key = selectedElementKey(selected);
  const targetSelector = `[data-editor-section-id="${CSS.escape(selected.sectionId)}"][data-editor-selection-key="${CSS.escape(key)}"]`;
  const matchingTargets = Array.from(
    viewport.querySelectorAll<HTMLElement>(targetSelector),
  );

  return (
    matchingTargets.find((element) => element.getClientRects().length > 0) ||
    matchingTargets[0]
  );
}

export function selectedSelectorPath(
  viewport: HTMLElement | null,
  selected: SelectedElement | undefined,
  sections: PortfolioSection[],
) {
  if (!selected) return "No selection";
  if (selected.kind === "head" || selected.kind === "body") {
    return selected.kind;
  }

  const section = sections.find((item) => item.id === selected.sectionId);
  const target = viewport
    ? findSelectedTarget(viewport, selected)
    : undefined;
  if (!target || !section) return fallbackSelector(selected, section);

  const path: HTMLElement[] = [];
  let current: HTMLElement | null = target;
  while (current && current !== viewport) {
    if (
      current.dataset.editorSectionId === selected.sectionId &&
      current.dataset.editorSelectionKey
    ) {
      path.push(current);
      if (current.dataset.editorSelectionKey === "section") break;
    }
    current = current.parentElement;
  }

  return path
    .reverse()
    .map((element, index, elements) =>
      selectorForElement(
        element,
        section,
        selected,
        index === elements.length - 1,
      ),
    )
    .join(" > ");
}

function selectorForElement(
  element: HTMLElement,
  section: PortfolioSection,
  selected: SelectedElement,
  isSelectedTarget: boolean,
) {
  const key = element.dataset.editorSelectionKey || "element";
  const imageTarget = isSelectedTarget && selected.kind === "image";
  const tagName = imageTarget ? "img" : element.tagName.toLowerCase();
  const id = element.id || semanticId(key, section, selected);
  return id ? `${tagName}#${id}` : tagName;
}

function semanticId(
  key: string,
  section: PortfolioSection,
  selected: SelectedElement,
) {
  if (key === "section") return normalizeSelectorId(section.type);
  if (key.startsWith("text:")) {
    const field = key.slice("text:".length);
    if (field === "logoText") {
      return section.type === "footer" ? "footer-name" : `${section.type}-logo`;
    }
    return `${section.type}-${normalizeSelectorId(field)}`;
  }
  if (key.startsWith("image:")) {
    return selected.kind === "image"
      ? normalizeSelectorId(selected.slot)
      : `${section.type}-${normalizeSelectorId(key.slice("image:".length))}`;
  }
  if (key.startsWith("layer:")) {
    return normalizeSelectorId(key.slice("layer:".length));
  }
  return normalizeSelectorId(key);
}

function fallbackSelector(
  selected: SelectedElement,
  section: PortfolioSection | undefined,
) {
  const sectionSelector = section
    ? `${sectionTag(section)}#${normalizeSelectorId(section.type)}`
    : "section";
  if (selected.kind === "head" || selected.kind === "body") {
    return selected.kind;
  }
  if (selected.kind === "section") return sectionSelector;
  return `${sectionSelector} > ${fallbackSelectedSelector(selected, section)}`;
}

function fallbackSelectedSelector(
  selected: Exclude<
    SelectedElement,
    { kind: "head" } | { kind: "body" } | { kind: "section" }
  >,
  section: PortfolioSection | undefined,
) {
  const sectionName = section?.type || "element";
  if (selected.kind === "text") {
    const tag = selected.field === "headline" ? "h1" : "span";
    return `${tag}#${sectionName}-${normalizeSelectorId(selected.field)}`;
  }
  if (selected.kind === "image") {
    return `img#${normalizeSelectorId(selected.slot)}`;
  }
  if (selected.kind === "layer") {
    return `div#${normalizeSelectorId(selected.layerId)}`;
  }
  return `article#${selected.kind}-${normalizeSelectorId(selected.itemId)}`;
}

function sectionTag(section: PortfolioSection) {
  if (section.type === "header" || section.type === "footer") {
    return section.type;
  }
  return "section";
}

function normalizeSelectorId(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
