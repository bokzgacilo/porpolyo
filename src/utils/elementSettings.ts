import { CSSProperties } from "react";
import { ElementSettings, PortfolioSection, SelectedElement } from "../types/portfolio";

const elementStyleCache = new WeakMap<ElementSettings, CSSProperties>();
const emptyElementStyle = Object.freeze({}) as CSSProperties;
const emptyElementSettings = Object.freeze({}) as ElementSettings;

export function selectedElementKey(selected: SelectedElement) {
  if (selected.kind === "head") return "page:head";
  if (selected.kind === "body") return "page:body";
  if (selected.kind === "section") return "section";
  if (selected.kind === "layer") return `layer:${selected.layerId}`;
  if (selected.kind === "text") return `text:${selected.field}`;
  if (selected.kind === "image") return `image:${selected.field}`;
  if (selected.kind === "project") return `project:${selected.itemId}`;
  if (selected.kind === "certification") return `certification:${selected.itemId}`;
  return `service:${selected.itemId}`;
}

export function getElementSettings(section: PortfolioSection, selectedOrKey: SelectedElement | string) {
  const key = typeof selectedOrKey === "string" ? selectedOrKey : selectedElementKey(selectedOrKey);
  const contentField = contentFieldFromElementKey(key, section);
  if (contentField && section.content[contentField]) {
    return section.content[contentField].style || emptyElementSettings;
  }
  return section.elements?.[key] || emptyElementSettings;
}

export function contentFieldFromElementKey(
  key: string,
  section?: PortfolioSection,
) {
  if (key.startsWith("text:")) return key.slice("text:".length);
  if (key.startsWith("image:")) return key.slice("image:".length);
  const layerAliases: Record<string, string> = {
    "layer:navigation": "navigation",
    "layer:hero-actions": "actions",
    "layer:skills": "skills",
    "layer:project-grid": "items",
    "layer:certification-list": "items",
    "layer:service-cards": "items",
  };
  const alias = layerAliases[key];
  if (alias && (!section || section.content[alias])) return alias;
  return undefined;
}

export function toElementStyle(settings: ElementSettings | undefined): CSSProperties {
  if (!settings) return emptyElementStyle;
  const cached = elementStyleCache.get(settings);
  if (cached) return cached;
  const borderWidths = settings.borderWidths;
  const borderRadii = settings.borderRadii;
  const style: CSSProperties = {
    color: settings.color,
    backgroundColor: settings.backgroundColor,
    fontFamily: settings.fontFamily,
    fontSize: typographyValue(
      settings.fontSize,
      settings.fontSizeUnit || "px",
    ),
    fontWeight: settings.fontWeight,
    lineHeight: typographyValue(
      settings.lineHeight,
      settings.lineHeightUnit || "px",
    ),
    letterSpacing: typographyValue(
      settings.letterSpacing,
      settings.letterSpacingUnit || "px",
    ),
    textAlign: settings.textAlign,
    display:
      settings.layoutMode === "grid"
        ? "grid"
        : settings.layoutMode === "stack"
          ? "flex"
          : undefined,
    gridTemplateColumns:
      settings.layoutMode === "grid"
        ? `repeat(${settings.gridColumns || 1}, minmax(0, 1fr))`
        : undefined,
    columnGap:
      settings.layoutMode === "grid"
        ? `${settings.gridGapX || 0}px`
        : undefined,
    rowGap:
      settings.layoutMode === "grid"
        ? `${settings.gridGapY || 0}px`
        : undefined,
    flexDirection:
      settings.layoutMode === "stack" ? settings.stackDirection : undefined,
    alignItems:
      settings.layoutMode === "grid"
        ? settings.gridAlignItems
        : settings.layoutMode === "stack"
          ? settings.stackAlign
          : undefined,
    justifyContent:
      settings.layoutMode === "grid"
        ? settings.gridJustifyContent
        : settings.layoutMode === "stack"
          ? settings.stackJustify
          : undefined,
    gap:
      settings.layoutMode === "stack"
        ? `${settings.stackGap || 0}px`
        : undefined,
    flexWrap:
      settings.layoutMode === "stack"
        ? settings.layoutWrap
          ? "wrap"
          : "nowrap"
        : undefined,
    marginTop: spacingValue(settings.margin?.top, settings.margin?.unit),
    marginRight: spacingValue(settings.margin?.right, settings.margin?.unit),
    marginBottom: spacingValue(settings.margin?.bottom, settings.margin?.unit),
    marginLeft: spacingValue(settings.margin?.left, settings.margin?.unit),
    paddingTop: spacingValue(settings.padding?.top, settings.padding?.unit),
    paddingRight: spacingValue(settings.padding?.right, settings.padding?.unit),
    paddingBottom: spacingValue(settings.padding?.bottom, settings.padding?.unit),
    paddingLeft: spacingValue(settings.padding?.left, settings.padding?.unit),
    borderWidth:
      !borderWidths && settings.borderWidth !== undefined
        ? `${settings.borderWidth}px`
        : undefined,
    borderTopWidth: borderWidths
      ? spacingValue(borderWidths.top ?? settings.borderWidth, borderWidths.unit)
      : undefined,
    borderRightWidth: borderWidths
      ? spacingValue(borderWidths.right ?? settings.borderWidth, borderWidths.unit)
      : undefined,
    borderBottomWidth: borderWidths
      ? spacingValue(borderWidths.bottom ?? settings.borderWidth, borderWidths.unit)
      : undefined,
    borderLeftWidth: borderWidths
      ? spacingValue(borderWidths.left ?? settings.borderWidth, borderWidths.unit)
      : undefined,
    borderStyle: settings.borderStyle,
    borderColor: settings.borderColor,
    borderRadius:
      !borderRadii && settings.borderRadius !== undefined
        ? `${settings.borderRadius}px`
        : undefined,
    borderTopLeftRadius: borderRadii
      ? spacingValue(borderRadii.topLeft ?? settings.borderRadius, borderRadii.unit)
      : undefined,
    borderTopRightRadius: borderRadii
      ? spacingValue(borderRadii.topRight ?? settings.borderRadius, borderRadii.unit)
      : undefined,
    borderBottomRightRadius: borderRadii
      ? spacingValue(
          borderRadii.bottomRight ?? settings.borderRadius,
          borderRadii.unit,
        )
      : undefined,
    borderBottomLeftRadius: borderRadii
      ? spacingValue(
          borderRadii.bottomLeft ?? settings.borderRadius,
          borderRadii.unit,
        )
      : undefined,
    boxShadow: settings.boxShadow,
    width: sizeValue(settings.width),
    height: sizeValue(settings.height),
    order: settings.order,
    maxWidth: settings.width ? "none" : undefined,
    gridColumn: settings.spanSection ? "1 / -1" : undefined,
    justifySelf: settings.spanSection ? "stretch" : undefined
  };
  elementStyleCache.set(settings, style);
  return style;
}

function spacingValue(value?: number, unit = "px") {
  return value !== undefined ? `${value}${unit}` : undefined;
}

function typographyValue(
  value: number | undefined,
  unit: NonNullable<ElementSettings["fontSizeUnit"]>,
) {
  return value !== undefined ? `${value}${unit}` : undefined;
}

function sizeValue(size?: ElementSettings["width"]) {
  if (!size) return undefined;
  if (size.unit === "fill") return "100%";
  if (size.unit === "fit-content") return "fit-content";
  if (size.value === undefined) return undefined;
  return `${size.value}${size.unit}`;
}
