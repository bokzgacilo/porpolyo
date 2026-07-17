import { CSSProperties } from "react";
import { ElementSettings, PortfolioSection, SelectedElement } from "../types/portfolio";

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
  return section.elements?.[key] || {};
}

export function toElementStyle(settings: ElementSettings | undefined): CSSProperties {
  if (!settings) return {};
  return {
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
      settings.layoutMode === "stack" ? settings.stackAlign : undefined,
    justifyContent:
      settings.layoutMode === "stack" ? settings.stackJustify : undefined,
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
    marginTop: spacingValue(settings.margin?.top),
    marginRight: spacingValue(settings.margin?.right),
    marginBottom: spacingValue(settings.margin?.bottom),
    marginLeft: spacingValue(settings.margin?.left),
    paddingTop: spacingValue(settings.padding?.top),
    paddingRight: spacingValue(settings.padding?.right),
    paddingBottom: spacingValue(settings.padding?.bottom),
    paddingLeft: spacingValue(settings.padding?.left),
    borderWidth: settings.borderWidth !== undefined ? `${settings.borderWidth}px` : undefined,
    borderStyle: settings.borderStyle,
    borderColor: settings.borderColor,
    borderRadius: settings.borderRadius !== undefined ? `${settings.borderRadius}px` : undefined,
    boxShadow: settings.boxShadow,
    width: sizeValue(settings.width),
    height: sizeValue(settings.height),
    maxWidth: settings.width ? "none" : undefined,
    gridColumn: settings.spanSection ? "1 / -1" : undefined,
    justifySelf: settings.spanSection ? "stretch" : undefined
  };
}

function spacingValue(value?: number) {
  return value !== undefined ? `${value}px` : undefined;
}

function typographyValue(
  value: number | undefined,
  unit: NonNullable<ElementSettings["fontSizeUnit"]>,
) {
  return value !== undefined ? `${value}${unit}` : undefined;
}

function sizeValue(size?: ElementSettings["width"]) {
  if (!size || size.value === undefined) return undefined;
  return `${size.value}${size.unit}`;
}
