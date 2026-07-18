import { Mail, MapPin } from "lucide-react";
import React from "react";
import {
  toImageContentStyle,
  toImageFrameStyle,
} from "../config/imageSettings";
import { palettes } from "../data/templates";
import { useEditorStore } from "../store/editorStore";
import {
  CertificationItem,
  CustomLayer,
  ElementSettings,
  ImageAsset,
  Portfolio,
  ProjectItem,
  SelectedElement,
  ServiceItem,
  SizeValue,
} from "../types/portfolio";
import { getElementSettings, toElementStyle } from "../utils/elementSettings";
import { resolveHeaderNavigationLinks } from "../utils/headerNavigation";
import { getHeroActionContent } from "../utils/heroContent";
import { resolveSectionLayoutSettings } from "../config/sectionLayoutSettings";
import { resolveBodyLayout } from "../config/bodySettings";
import { contentValue, hasContentField } from "../utils/contentFields";

interface Props {
  portfolio: Portfolio;
  selected?: SelectedElement;
  onSelect: (selected: SelectedElement) => void;
  editable?: boolean;
}

const PortfolioRenderContext = React.createContext<Portfolio | undefined>(
  undefined,
);

export const PortfolioPreview = React.memo(function PortfolioPreview({
  portfolio,
  selected,
  onSelect,
  editable = false,
}: Props) {
  const palette = React.useMemo(
    () => palettes.find((item) => item.id === portfolio.paletteId)!,
    [portfolio.paletteId],
  );
  const sorted = React.useMemo(
    () =>
      [...portfolio.sections]
        .sort((a, b) => a.order - b.order)
        .filter((section) => section.visible && !section.parentSectionId),
    [portfolio.sections],
  );
  const bodyLayout = React.useMemo(
    () => resolveBodyLayout(portfolio.settings.bodyLayout),
    [portfolio.settings.bodyLayout],
  );
  const style = React.useMemo(
    () =>
      ({
        "--primary": palette.primary,
        "--secondary": palette.secondary,
        "--accent": palette.accent,
        "--bg": palette.background,
        "--surface": palette.surface,
        "--text": palette.text,
        "--muted": palette.muted,
        "--border": palette.border,
        ...toElementStyle(bodyLayout),
      }) as React.CSSProperties,
    [bodyLayout, palette],
  );

  return (
    <PortfolioRenderContext.Provider value={portfolio}>
      <article
        className={`portfolio-site template-${portfolio.templateId} ${editable ? "editable-preview" : ""}`}
        style={style}
      >
        {sorted.map((section) => (
          <SectionRenderer
            key={section.id}
            portfolio={portfolio}
            section={section}
            selected={selected}
            onSelect={onSelect}
            isSelected={
              selected?.kind === "section" && selected.sectionId === section.id
            }
            editable={editable}
          />
        ))}
      </article>
    </PortfolioRenderContext.Provider>
  );
});

type SectionProps = Props & {
  section: Portfolio["sections"][number];
  isSelected: boolean;
};

const MemoHeaderSection = React.memo(HeaderSection, sameSectionProps);
const MemoHeroSection = React.memo(HeroSection, sameSectionProps);
const MemoProjectsSection = React.memo(ProjectsSection, sameSectionProps);
const MemoCertificationsSection = React.memo(
  CertificationsSection,
  sameSectionProps,
);
const MemoServicesSection = React.memo(ServicesSection, sameSectionProps);
const MemoAboutSection = React.memo(AboutSection, sameSectionProps);
const MemoBlankSection = React.memo(BlankSection, sameSectionProps);
const MemoFooterSection = React.memo(FooterSection, sameSectionProps);

function SectionRenderer(props: SectionProps) {
  const { section } = props;
  if (section.type === "header") return <MemoHeaderSection {...props} />;
  if (section.type === "hero") return <MemoHeroSection {...props} />;
  if (section.type === "projects") return <MemoProjectsSection {...props} />;
  if (section.type === "certifications")
    return <MemoCertificationsSection {...props} />;
  if (section.type === "services") return <MemoServicesSection {...props} />;
  if (section.type === "about") return <MemoAboutSection {...props} />;
  if (section.type === "custom") return <MemoBlankSection {...props} />;
  return <MemoFooterSection {...props} />;
}

function sameSectionProps(previous: SectionProps, next: SectionProps) {
  if (
    previous.section !== next.section ||
    previous.isSelected !== next.isSelected ||
    previous.editable !== next.editable ||
    previous.onSelect !== next.onSelect ||
    previous.portfolio.owner !== next.portfolio.owner ||
    !sameNestedSectionTree(
      previous.portfolio.sections,
      next.portfolio.sections,
      next.section.id,
    )
  ) {
    return false;
  }
  const previousSelectedHere = selectionBelongsToSection(
    previous.selected,
    previous.section.id,
  );
  const nextSelectedHere = selectionBelongsToSection(
    next.selected,
    next.section.id,
  );
  return (
    !previousSelectedHere && !nextSelectedHere
  ) || previous.selected === next.selected;
}

function sameNestedSectionTree(
  previousSections: Portfolio["sections"],
  nextSections: Portfolio["sections"],
  rootSectionId: string,
) {
  if (previousSections === nextSections) return true;
  const previousTree = nestedSectionTree(previousSections, rootSectionId);
  const nextTree = nestedSectionTree(nextSections, rootSectionId);
  return (
    previousTree.length === nextTree.length &&
    previousTree.every((section, index) => section === nextTree[index])
  );
}

function nestedSectionTree(
  sections: Portfolio["sections"],
  rootSectionId: string,
) {
  const treeIds = new Set([rootSectionId]);
  let addedSection = true;
  while (addedSection) {
    addedSection = false;
    for (const section of sections) {
      if (
        section.parentSectionId &&
        treeIds.has(section.parentSectionId) &&
        !treeIds.has(section.id)
      ) {
        treeIds.add(section.id);
        addedSection = true;
      }
    }
  }
  return sections.filter(
    (section) => section.id !== rootSectionId && treeIds.has(section.id),
  );
}

function selectionBelongsToSection(
  selected: SelectedElement | undefined,
  sectionId: string,
) {
  return !!selected && "sectionId" in selected && selected.sectionId === sectionId;
}

function selectable(
  section: Portfolio["sections"][number],
  isSelected: boolean,
  onSelect: Props["onSelect"],
  editable = false,
) {
  return {
    ...editorTarget(section.id, "section"),
    className: `portfolio-section selectable ${isSelected ? "selected" : ""}`,
    style: sectionStyle(section),
    "data-section-id": section.id,
    onClick: editable
      ? (event: React.MouseEvent) => {
          event.stopPropagation();
          onSelect({ kind: "section", sectionId: section.id });
        }
      : undefined,
  };
}

function editorTarget(sectionId: string, key: string) {
  return {
    "data-editor-section-id": sectionId,
    "data-editor-selection-key": key,
  };
}

function anchorAttributes(
  settings: ElementSettings,
  fallbackHref: string,
  idSuffix = "",
) {
  const target = settings.anchor?.target;
  const id = settings.anchor?.id;
  return {
    id: id ? `${id}${idSuffix}` : undefined,
    href: settings.anchor?.href ?? fallbackHref,
    target,
    rel: target === "_blank" ? "noreferrer" : undefined,
  };
}

function anchorLabel(settings: ElementSettings, fallbackLabel: string) {
  return settings.anchor?.label ?? fallbackLabel;
}

function selectableLayer(
  sectionId: string,
  layerId: string,
  label: string,
  onSelect: Props["onSelect"],
  editable = false,
) {
  return {
    ...editorTarget(sectionId, `layer:${layerId}`),
    onClick: editable
      ? (event: React.MouseEvent) => {
          event.stopPropagation();
          onSelect({ kind: "layer", sectionId, layerId, label });
        }
      : undefined,
  };
}

const sectionSpacing = {
  small: "34px",
  medium: "58px",
  large: "92px",
} as const;

const sectionContentWidths = {
  narrow: "760px",
  standard: "1000px",
  wide: "1220px",
} as const;

const sectionStyleCache = new WeakMap<
  Portfolio["sections"][number],
  React.CSSProperties
>();

function sectionStyle(section: Portfolio["sections"][number]) {
  const cached = sectionStyleCache.get(section);
  if (cached) return cached;
  const layout = section.settings.layoutMode
    ? resolveSectionLayoutSettings(section)
    : undefined;
  const style: React.CSSProperties & Record<string, string | undefined> = {
    "--section-content-width":
      sectionContentWidths[section.settings.contentWidth || "standard"],
    backgroundColor: section.settings.backgroundColor,
    color: section.settings.textColor,
    textAlign: section.settings.alignment,
    width: sectionSizeValue(section.settings.width),
    height: sectionSizeValue(section.settings.height),
    minHeight: sectionSizeValue(section.settings.minHeight),
    marginTop:
      section.settings.margin?.top !== undefined
        ? boxSpacingValue(
            section.settings.margin.top,
            section.settings.margin.unit,
          )
        : boxSpacingValue(section.settings.marginTop),
    marginBottom:
      section.settings.margin?.bottom !== undefined
        ? boxSpacingValue(
            section.settings.margin.bottom,
            section.settings.margin.unit,
          )
        : boxSpacingValue(section.settings.marginBottom),
    marginRight: boxSpacingValue(
      section.settings.margin?.right,
      section.settings.margin?.unit,
    ),
    marginLeft: boxSpacingValue(
      section.settings.margin?.left,
      section.settings.margin?.unit,
    ),
    paddingTop:
      section.settings.padding?.top !== undefined
        ? boxSpacingValue(
            section.settings.padding.top,
            section.settings.padding.unit,
          )
        : section.settings.paddingTop !== undefined
          ? boxSpacingValue(section.settings.paddingTop)
          : section.settings.spacing &&
              section.type !== "header" &&
              section.type !== "hero"
            ? sectionSpacing[section.settings.spacing]
            : undefined,
    paddingRight:
      section.settings.padding?.right !== undefined
        ? boxSpacingValue(
            section.settings.padding.right,
            section.settings.padding.unit,
          )
        : section.settings.paddingInline !== undefined
          ? boxSpacingValue(section.settings.paddingInline)
          : undefined,
    paddingBottom:
      section.settings.padding?.bottom !== undefined
        ? boxSpacingValue(
            section.settings.padding.bottom,
            section.settings.padding.unit,
          )
        : section.settings.paddingBottom !== undefined
          ? boxSpacingValue(section.settings.paddingBottom)
          : section.settings.spacing &&
              section.type !== "header" &&
              section.type !== "hero"
            ? sectionSpacing[section.settings.spacing]
            : undefined,
    paddingLeft:
      section.settings.padding?.left !== undefined
        ? boxSpacingValue(
            section.settings.padding.left,
            section.settings.padding.unit,
          )
        : section.settings.paddingInline !== undefined
          ? boxSpacingValue(section.settings.paddingInline)
          : undefined,
    borderWidth:
      !section.settings.borderWidths &&
      section.settings.borderWidth !== undefined
        ? `${section.settings.borderWidth}px`
        : undefined,
    borderTopWidth: section.settings.borderWidths
      ? boxSpacingValue(
          section.settings.borderWidths.top ?? section.settings.borderWidth,
          section.settings.borderWidths.unit,
        )
      : undefined,
    borderRightWidth: section.settings.borderWidths
      ? boxSpacingValue(
          section.settings.borderWidths.right ?? section.settings.borderWidth,
          section.settings.borderWidths.unit,
        )
      : undefined,
    borderBottomWidth: section.settings.borderWidths
      ? boxSpacingValue(
          section.settings.borderWidths.bottom ?? section.settings.borderWidth,
          section.settings.borderWidths.unit,
        )
      : undefined,
    borderLeftWidth: section.settings.borderWidths
      ? boxSpacingValue(
          section.settings.borderWidths.left ?? section.settings.borderWidth,
          section.settings.borderWidths.unit,
        )
      : undefined,
    borderStyle: section.settings.borderStyle,
    borderColor: section.settings.borderColor,
    borderRadius:
      !section.settings.borderRadii &&
      section.settings.borderRadius !== undefined
        ? `${section.settings.borderRadius}px`
        : undefined,
    borderTopLeftRadius: section.settings.borderRadii
      ? boxSpacingValue(
          section.settings.borderRadii.topLeft ?? section.settings.borderRadius,
          section.settings.borderRadii.unit,
        )
      : undefined,
    borderTopRightRadius: section.settings.borderRadii
      ? boxSpacingValue(
          section.settings.borderRadii.topRight ?? section.settings.borderRadius,
          section.settings.borderRadii.unit,
        )
      : undefined,
    borderBottomRightRadius: section.settings.borderRadii
      ? boxSpacingValue(
          section.settings.borderRadii.bottomRight ??
            section.settings.borderRadius,
          section.settings.borderRadii.unit,
        )
      : undefined,
    borderBottomLeftRadius: section.settings.borderRadii
      ? boxSpacingValue(
          section.settings.borderRadii.bottomLeft ?? section.settings.borderRadius,
          section.settings.borderRadii.unit,
        )
      : undefined,
    display:
      layout?.layoutMode === "grid"
        ? "grid"
        : layout?.layoutMode === "stack"
          ? "flex"
          : undefined,
    gridTemplateColumns:
      layout?.layoutMode === "grid"
        ? `repeat(${layout.gridColumns || 1}, minmax(0, 1fr))`
        : undefined,
    gridAutoFlow:
      layout?.layoutMode === "grid"
        ? layout.layoutWrap
          ? "row"
          : "column"
        : undefined,
    gridAutoColumns:
      layout?.layoutMode === "grid" && !layout.layoutWrap
        ? "minmax(0, 1fr)"
        : undefined,
    columnGap:
      layout?.layoutMode === "grid"
        ? `${layout.gridGapX || 0}px`
        : undefined,
    rowGap:
      layout?.layoutMode === "grid"
        ? `${layout.gridGapY || 0}px`
        : undefined,
    flexDirection:
      layout?.layoutMode === "stack" ? layout.stackDirection : undefined,
    alignItems:
      layout?.layoutMode === "grid"
        ? layout.gridAlignItems
        : layout?.layoutMode === "stack"
          ? layout.stackAlign
          : undefined,
    justifyContent:
      layout?.layoutMode === "grid"
        ? layout.gridJustifyContent
        : layout?.layoutMode === "stack"
          ? layout.stackJustify
          : undefined,
    gap:
      layout?.layoutMode === "stack" ? `${layout.stackGap || 0}px` : undefined,
    flexWrap:
      layout?.layoutMode === "stack"
        ? layout.layoutWrap
          ? "wrap"
          : "nowrap"
        : undefined,
  };
  if (section.settings.textColor) {
    style["--text"] = section.settings.textColor;
    style["--muted"] = section.settings.textColor;
  }
  if (section.settings.accentColor) {
    style["--accent"] = section.settings.accentColor;
  }
  sectionStyleCache.set(section, style);
  return style;
}

function boxSpacingValue(value?: number, unit = "px") {
  return value !== undefined ? `${value}${unit}` : undefined;
}

function sectionSizeValue(size?: SizeValue) {
  if (!size) return undefined;
  if (size.unit === "fill") return "100%";
  return size.value !== undefined ? `${size.value}${size.unit}` : undefined;
}

function templateLayerPosition(
  section: Portfolio["sections"][number],
  layerId: string,
  fallback: number,
) {
  const position = section.settings.templateLayerOrder?.indexOf(layerId) ?? -1;
  return position >= 0 ? position : fallback;
}

function templateLayerParent(
  section: Portfolio["sections"][number],
  layerId: string,
  fallback: string | null,
) {
  const parents = section.settings.templateLayerParents;
  return parents && Object.prototype.hasOwnProperty.call(parents, layerId)
    ? parents[layerId]
    : fallback;
}

const heroTemplateLayers = [
  { key: "hero-content", parent: null },
  { key: "eyebrow", parent: "hero-content" },
  { key: "headline", parent: "hero-content" },
  { key: "description", parent: "hero-content" },
  { key: "hero-actions", parent: "hero-content" },
  { key: "primaryCta", parent: "hero-actions" },
  { key: "secondaryCta", parent: "hero-actions" },
  { key: "image", parent: null },
] as const;

type HeroTemplateLayerKey = (typeof heroTemplateLayers)[number]["key"];

function heroTemplateLayerId(
  section: Portfolio["sections"][number],
  key: HeroTemplateLayerKey,
) {
  if (key === "hero-content" || key === "hero-actions") {
    return `${section.id}-${key}`;
  }
  if (key === "image") return `${section.id}-image-image`;
  return `${section.id}-text-${key}`;
}

function heroTemplateChildren(
  section: Portfolio["sections"][number],
  parent: string | null,
) {
  return heroTemplateLayers
    .filter(
      (layer) =>
        templateLayerParent(
          section,
          heroTemplateLayerId(section, layer.key),
          layer.parent,
        ) === parent,
    )
    .sort(
      (left, right) =>
        templateLayerPosition(
          section,
          heroTemplateLayerId(section, left.key),
          heroTemplateLayers.indexOf(left),
        ) -
        templateLayerPosition(
          section,
          heroTemplateLayerId(section, right.key),
          heroTemplateLayers.indexOf(right),
        ),
    );
}

function HeaderSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const navigationLinks = resolveHeaderNavigationLinks(
    section,
    portfolio.sections,
  );
  return (
    <header
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-header selectable ${isSelected ? "selected" : ""}`}
    >
      <a
        {...editorTarget(section.id, "text:logoText")}
        {...anchorAttributes(
          getElementSettings(section, "text:logoText"),
          "#",
        )}
        className="brand"
        style={toElementStyle(getElementSettings(section, "text:logoText"))}
        onClick={(event) => {
          if (!editable) return;
          event.preventDefault();
          event.stopPropagation();
          onSelect({
            kind: "text",
            sectionId: section.id,
            field: "logoText",
            label: "Header Logo",
            limit: 60,
          });
        }}
      >
        {anchorLabel(
          getElementSettings(section, "text:logoText"),
          String(contentValue(section, "logoText") || portfolio.owner.fullName),
        )}
      </a>
      <div
        {...selectableLayer(
          section.id,
          "navigation",
          "Navigation",
          onSelect,
          editable,
        )}
        className="portfolio-navigation"
        style={toElementStyle(getElementSettings(section, "layer:navigation"))}
      >
        <nav className="portfolio-nav-links" aria-label="Primary navigation">
          {navigationLinks.map(({ section: item, label, href }) => (
            <a
              key={item.id}
              {...editorTarget(
                section.id,
                `layer:navigation-link:${item.id}`,
              )}
              {...anchorAttributes(
                getElementSettings(
                  section,
                  `layer:navigation-link:${item.id}`,
                ),
                href,
              )}
              style={toElementStyle(
                getElementSettings(
                  section,
                  `layer:navigation-link:${item.id}`,
                ),
              )}
              onClick={(event) => {
                if (!editable) return;
                event.preventDefault();
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `navigation-link:${item.id}`,
                  label: `${label} Navigation Link`,
                });
              }}
            >
              {anchorLabel(
                getElementSettings(
                  section,
                  `layer:navigation-link:${item.id}`,
                ),
                label,
              )}
            </a>
          ))}
        </nav>
        <CustomSectionLayers
          section={section}
          parentLayerId="navigation"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <a
        {...editorTarget(section.id, "text:contactButton")}
        {...anchorAttributes(
          getElementSettings(section, "text:contactButton"),
          "#contact",
        )}
        className="portfolio-button"
        style={toElementStyle(
          getElementSettings(section, "text:contactButton"),
        )}
        onClick={(event) => {
          if (!editable) return;
          event.preventDefault();
          event.stopPropagation();
          onSelect({
            kind: "text",
            sectionId: section.id,
            field: "contactButton",
            label: "Header Contact Button",
            limit: 40,
          });
        }}
      >
        {anchorLabel(
          getElementSettings(section, "text:contactButton"),
          String(contentValue(section, "contactButton") || "Contact"),
        )}
      </a>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </header>
  );
}

function HeroSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const image = contentValue<ImageAsset>(section, "image");

  const renderHeroLayer = (
    layer: (typeof heroTemplateLayers)[number],
    ancestors = new Set<HeroTemplateLayerKey>(),
  ): React.ReactNode => {
    if (ancestors.has(layer.key)) return null;
    const nextAncestors = new Set(ancestors).add(layer.key);
    const layerId = heroTemplateLayerId(section, layer.key);
    const order = templateLayerPosition(
      section,
      layerId,
      heroTemplateLayers.indexOf(layer),
    );

    if (layer.key === "hero-content") {
      return (
        <div
          key={layer.key}
          {...selectableLayer(
            section.id,
            "hero-content",
            "Hero Content",
            onSelect,
            editable,
          )}
          className="hero-content"
          style={{
            order,
            ...toElementStyle(
              getElementSettings(section, "layer:hero-content"),
            ),
          }}
        >
          {heroTemplateChildren(section, "hero-content").map((child) =>
            renderHeroLayer(child, nextAncestors),
          )}
          <CustomSectionLayers
            section={section}
            parentLayerId="hero-content"
            selected={selected}
            onSelect={onSelect}
            editable={editable}
          />
        </div>
      );
    }

    if (layer.key === "hero-actions") {
      return (
        <div
          key={layer.key}
          {...selectableLayer(
            section.id,
            "hero-actions",
            "Button Group",
            onSelect,
            editable,
          )}
          className="hero-actions"
          style={{
            order,
            ...toElementStyle(
              getElementSettings(section, "layer:hero-actions"),
            ),
          }}
        >
          {heroTemplateChildren(section, "hero-actions").map((child) =>
            renderHeroLayer(child, nextAncestors),
          )}
          <CustomSectionLayers
            section={section}
            parentLayerId="hero-actions"
            selected={selected}
            onSelect={onSelect}
            editable={editable}
          />
        </div>
      );
    }

    if (layer.key === "image") {
      return (
        <button
          key={layer.key}
          type="button"
          {...editorTarget(section.id, "image:image")}
          className="image-slot hero-image"
          style={{
            order,
            ...toElementStyle(getElementSettings(section, "image:image")),
            ...toImageFrameStyle(image),
          }}
          onClick={(event) => {
            if (!editable) return;
            event.preventDefault();
            event.stopPropagation();
            onSelect({
              kind: "image",
              sectionId: section.id,
              field: "image",
              label: "Hero Image",
              slot: "hero-image",
            });
          }}
        >
          {image?.url ? (
            <img
              src={image.url}
              alt={image.alt || ""}
              style={toImageContentStyle(image)}
            />
          ) : (
            <span>Hero image slot · 4:5 or 1:1</span>
          )}
        </button>
      );
    }

    if (layer.key === "primaryCta" || layer.key === "secondaryCta") {
      const primary = layer.key === "primaryCta";
      const settings = getElementSettings(section, `text:${layer.key}`);
      return (
        <a
          key={layer.key}
          {...editorTarget(section.id, `text:${layer.key}`)}
          {...anchorAttributes(
            settings,
            primary ? "#projects" : `mailto:${portfolio.owner.email}`,
          )}
          className={`portfolio-button${primary ? "" : " secondary"}`}
          style={{ order, ...toElementStyle(settings) }}
          onClick={(event) => {
            if (!editable) return;
            event.preventDefault();
            event.stopPropagation();
            onSelect({
              kind: "text",
              sectionId: section.id,
              field: layer.key,
              label: primary ? "Primary Button" : "Secondary Button",
              limit: 40,
            });
          }}
        >
          {anchorLabel(
            settings,
            getHeroActionContent(
              section,
              layer.key,
              primary ? "View Projects" : "Contact Me",
            ),
          )}
        </a>
      );
    }

    const textLayer = {
      eyebrow: {
        label: "Hero Eyebrow",
        limit: 80,
        value: String(contentValue(section, "eyebrow") || ""),
        className: "eyebrow",
        as: "span" as const,
      },
      headline: {
        label: "Hero Headline",
        limit: 120,
        value: String(contentValue(section, "headline") || ""),
        className: "",
        as: "h1" as const,
      },
      description: {
        label: "Hero Description",
        limit: 250,
        value: String(
          contentValue(section, "description") ||
            portfolio.owner.shortDescription,
        ),
        className: "hero-description",
        as: "p" as const,
      },
    }[layer.key];

    return (
      <EditableText
        key={layer.key}
        section={section}
        field={layer.key}
        label={textLayer.label}
        limit={textLayer.limit}
        value={textLayer.value}
        selected={selected}
        onSelect={onSelect}
        as={textLayer.as}
        className={textLayer.className}
        style={{ order }}
      />
    );
  };

  return (
    <section
      id="hero"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section portfolio-hero selectable ${isSelected ? "selected" : ""}`}
    >
      {heroTemplateChildren(section, null).map((layer) =>
        renderHeroLayer(layer),
      )}
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </section>
  );
}

function ProjectsSection({
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const items = contentValue<ProjectItem[]>(section, "items") || [];
  const rootTextFields = projectTextFields(section, null);

  return (
    <section
      id="projects"
      {...selectable(section, isSelected, onSelect, editable)}
    >
      <ProjectSectionIntro
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
      {rootTextFields.map((field) => (
        <ProjectTextLayer
          key={field}
          section={section}
          field={field}
          selected={selected}
          onSelect={onSelect}
          style={{
            order:
              templateLayerPosition(
                section,
                `${section.id}-text-${field}`,
                field === "title" ? 1 : 2,
              ) - 10,
          }}
        />
      ))}
      <div
        {...selectableLayer(
          section.id,
          "project-grid",
          "Projects List",
          onSelect,
          editable,
        )}
        id="project-list"
        className="project-grid"
        style={{
          order:
            templateLayerPosition(
              section,
              `${section.id}-projects-list`,
              1,
            ) - 10,
          ...toElementStyle(
            getElementSettings(section, "layer:project-grid"),
          ),
        }}
      >
        {items.map((project, projectIndex) => (
          <button
            type="button"
            {...editorTarget(section.id, `project:${project.id}`)}
            key={project.id || `project-${projectIndex}`}
            className="portfolio-card project-card"
            style={toElementStyle(
              getElementSettings(section, `project:${project.id}`),
            )}
            onClick={(event) => {
              if (!editable) return;
              event.preventDefault();
              event.stopPropagation();
              onSelect({
                kind: "project",
                sectionId: section.id,
                itemId: project.id,
              });
            }}
          >
            <div
              key={`${project.id || projectIndex}-image`}
              {...editorTarget(section.id, `layer:project:${project.id}:image`)}
              className="project-thumb"
              style={{
                ...toElementStyle(
                  getElementSettings(
                    section,
                    `layer:project:${project.id}:image`,
                  ),
                ),
                ...toImageFrameStyle(project.image),
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `project:${project.id}:image`,
                  label: `${project.title} Image`,
                });
              }}
            >
              {project.image?.url ? (
                <img
                  src={project.image.url}
                  alt={project.image.alt}
                  style={toImageContentStyle(project.image)}
                />
              ) : (
                <span>16:9 project image</span>
              )}
            </div>
            <strong
              key={`${project.id || projectIndex}-title`}
              {...editorTarget(section.id, `layer:project:${project.id}:title`)}
              style={toElementStyle(
                getElementSettings(
                  section,
                  `layer:project:${project.id}:title`,
                ),
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `project:${project.id}:title`,
                  label: `${project.title} Title`,
                });
              }}
            >
              {project.title}
            </strong>
            <p
              key={`${project.id || projectIndex}-description`}
              {...editorTarget(
                section.id,
                `layer:project:${project.id}:description`,
              )}
              style={toElementStyle(
                getElementSettings(
                  section,
                  `layer:project:${project.id}:description`,
                ),
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `project:${project.id}:description`,
                  label: `${project.title} Description`,
                });
              }}
            >
              {project.description}
            </p>
            <div
              key={`${project.id || projectIndex}-tags`}
              {...editorTarget(section.id, `layer:project:${project.id}:tags`)}
              className="tag-row"
              style={toElementStyle(
                getElementSettings(section, `layer:project:${project.id}:tags`),
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `project:${project.id}:tags`,
                  label: `${project.title} Tags`,
                });
              }}
            >
              {project.tags.map((tag, tagIndex) => (
                <span key={`${tag}-${tagIndex}`}>{tag}</span>
              ))}
            </div>
            <span
              key={`${project.id || projectIndex}-cta`}
              {...editorTarget(section.id, `layer:project:${project.id}:cta`)}
              className="project-cta-layer"
              style={toElementStyle(
                getElementSettings(section, `layer:project:${project.id}:cta`),
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `project:${project.id}:cta`,
                  label: `${project.title} CTA`,
                });
              }}
            >
              {project.projectUrl ? "View project" : "Project details"}
            </span>
            {project.featured && (
              <small key={`${project.id || projectIndex}-featured`}>
                Featured
              </small>
            )}
            <CustomSectionLayers
              key={`${project.id || projectIndex}-custom-layers`}
              section={section}
              parentLayerId={`project:${project.id}`}
              selected={selected}
              onSelect={onSelect}
              editable={editable}
            />
          </button>
        ))}
        <CustomSectionLayers
          section={section}
          parentLayerId="project-grid"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </section>
  );
}

function CertificationsSection({
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const items = contentValue<CertificationItem[]>(section, "items") || [];
  return (
    <section
      id="certifications"
      {...selectable(section, isSelected, onSelect, editable)}
    >
      <SectionHeading
        section={section}
        selected={selected}
        onSelect={onSelect}
        titleLimit={100}
        editable={editable}
      />
      <div
        {...selectableLayer(
          section.id,
          "certification-list",
          "Certification List",
          onSelect,
          editable,
        )}
        className="cert-list"
        style={toElementStyle(
          getElementSettings(section, "layer:certification-list"),
        )}
      >
        {items.map((item) => (
          <button
            type="button"
            {...editorTarget(section.id, `certification:${item.id}`)}
            key={item.id}
            className="portfolio-card cert-card"
            style={toElementStyle(
              getElementSettings(section, `certification:${item.id}`),
            )}
            onClick={(event) => {
              if (!editable) return;
              event.preventDefault();
              event.stopPropagation();
              onSelect({
                kind: "certification",
                sectionId: section.id,
                itemId: item.id,
              });
            }}
          >
            <div
              {...editorTarget(
                section.id,
                `layer:certification:${item.id}:image`,
              )}
              className="cert-image-slot"
              style={{
                ...toElementStyle(
                  getElementSettings(
                    section,
                    `layer:certification:${item.id}:image`,
                  ),
                ),
                ...toImageFrameStyle(item.image),
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `certification:${item.id}:image`,
                  label: `${item.name} Image`,
                });
              }}
            >
              {item.image?.url ? (
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  style={toImageContentStyle(item.image)}
                />
              ) : (
                <span>Badge image</span>
              )}
            </div>
            <strong>{item.name}</strong>
            <span>{item.organization}</span>
            <small>
              {item.issueDate}{" "}
              {item.credentialId ? `· ${item.credentialId}` : ""}
            </small>
            <CustomSectionLayers
              section={section}
              parentLayerId={`certification:${item.id}`}
              selected={selected}
              onSelect={onSelect}
              editable={editable}
            />
          </button>
        ))}
        <CustomSectionLayers
          section={section}
          parentLayerId="certification-list"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </section>
  );
}

function ServicesSection({
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const items = contentValue<ServiceItem[]>(section, "items") || [];
  return (
    <section
      id="services"
      {...selectable(section, isSelected, onSelect, editable)}
    >
      <SectionHeading
        section={section}
        selected={selected}
        onSelect={onSelect}
        titleLimit={80}
        editable={editable}
      />
      <div
        {...selectableLayer(
          section.id,
          "service-cards",
          "Service Cards",
          onSelect,
          editable,
        )}
        className="service-grid"
        style={toElementStyle(
          getElementSettings(section, "layer:service-cards"),
        )}
      >
        {items.map((item) => (
          <button
            type="button"
            {...editorTarget(section.id, `service:${item.id}`)}
            key={item.id}
            className="portfolio-card service-card"
            style={toElementStyle(
              getElementSettings(section, `service:${item.id}`),
            )}
            onClick={(event) => {
              if (!editable) return;
              event.preventDefault();
              event.stopPropagation();
              onSelect({
                kind: "service",
                sectionId: section.id,
                itemId: item.id,
              });
            }}
          >
            <div
              {...editorTarget(section.id, `layer:service:${item.id}:icon`)}
              className="service-icon-slot"
              style={{
                ...toElementStyle(
                  getElementSettings(section, `layer:service:${item.id}:icon`),
                ),
                ...toImageFrameStyle(item.icon),
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({
                  kind: "layer",
                  sectionId: section.id,
                  layerId: `service:${item.id}:icon`,
                  label: `${item.title} Icon/Image`,
                });
              }}
            >
              {item.icon?.url ? (
                <img
                  src={item.icon.url}
                  alt={item.icon.alt}
                  style={toImageContentStyle(item.icon)}
                />
              ) : (
                <span>Icon</span>
              )}
            </div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span>{item.startingPrice}</span>
            <small>{item.ctaText}</small>
            <CustomSectionLayers
              section={section}
              parentLayerId={`service:${item.id}`}
              selected={selected}
              onSelect={onSelect}
              editable={editable}
            />
          </button>
        ))}
        <CustomSectionLayers
          section={section}
          parentLayerId="service-cards"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </section>
  );
}

function AboutSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const skills = contentValue<string[]>(section, "skills") || [];
  return (
    <section
      id="about"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section portfolio-about selectable ${isSelected ? "selected" : ""}`}
    >
      <div
        {...selectableLayer(
          section.id,
          "about-content",
          "About Content",
          onSelect,
          editable,
        )}
        style={toElementStyle(
          getElementSettings(section, "layer:about-content"),
        )}
      >
        <SectionHeading
          section={section}
          selected={selected}
          onSelect={onSelect}
          titleLimit={80}
          editable={editable}
        />
        <EditableText
          section={section}
          field="description"
          label="About Description"
          limit={1000}
          value={String(
            contentValue(section, "description") ||
              portfolio.owner.aboutDescription ||
              "",
          )}
          selected={selected}
          onSelect={onSelect}
          as="p"
        />
        <div
          {...editorTarget(section.id, "layer:skills")}
          className="tag-row"
          style={toElementStyle(getElementSettings(section, "layer:skills"))}
        >
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <CustomSectionLayers
          section={section}
          parentLayerId="about-content"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <aside
        {...selectableLayer(
          section.id,
          "about-panel",
          "About Contact Panel",
          onSelect,
          editable,
        )}
        style={toElementStyle(getElementSettings(section, "layer:about-panel"))}
      >
        <span>
          <MapPin size={16} /> {portfolio.owner.location}
        </span>
        <span>
          <Mail size={16} /> {portfolio.owner.email}
        </span>
        <strong>{String(contentValue(section, "availability") || "Available")}</strong>
        <CustomSectionLayers
          section={section}
          parentLayerId="about-panel"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </aside>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </section>
  );
}

function FooterSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  return (
    <footer
      id="contact"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-footer selectable ${isSelected ? "selected" : ""}`}
    >
      <strong
        {...editorTarget(section.id, "text:logoText")}
        style={toElementStyle(getElementSettings(section, "text:logoText"))}
        onClick={(event) => {
          event.stopPropagation();
          if (editable)
            onSelect({
              kind: "text",
              sectionId: section.id,
              field: "logoText",
              label: "Footer Logo",
              limit: 60,
            });
        }}
      >
        {String(contentValue(section, "logoText") || portfolio.owner.fullName)}
      </strong>
      <span
        {...editorTarget(section.id, "text:message")}
        style={toElementStyle(getElementSettings(section, "text:message"))}
        onClick={(event) => {
          event.stopPropagation();
          if (editable)
            onSelect({
              kind: "text",
              sectionId: section.id,
              field: "message",
              label: "Footer Message",
              limit: 160,
            });
        }}
      >
        {String(contentValue(section, "message") || "")}
      </span>
      <a
        {...editorTarget(section.id, "layer:back-to-top")}
        {...anchorAttributes(
          getElementSettings(section, "layer:back-to-top"),
          "#top",
        )}
        style={toElementStyle(getElementSettings(section, "layer:back-to-top"))}
        onClick={(event) => {
          if (!editable) return;
          event.preventDefault();
          event.stopPropagation();
          onSelect({
            kind: "layer",
            sectionId: section.id,
            layerId: "back-to-top",
            label: "Back to Top Link",
          });
        }}
      >
        {anchorLabel(
          getElementSettings(section, "layer:back-to-top"),
          "Back to top",
        )}
      </a>
      <small
        {...editorTarget(section.id, "text:copyright")}
        style={toElementStyle(getElementSettings(section, "text:copyright"))}
        onClick={(event) => {
          event.stopPropagation();
          if (editable)
            onSelect({
              kind: "text",
              sectionId: section.id,
              field: "copyright",
              label: "Copyright Text",
              limit: 160,
            });
        }}
      >
        {String(contentValue(section, "copyright") || "")}
      </small>
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </footer>
  );
}

function BlankSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const rootLayers = (section.customLayers || []).filter(
    (layer) => !layer.parentLayerId,
  );
  const hasNestedSections = portfolio.sections.some(
    (candidate) =>
      candidate.visible &&
      candidate.parentSectionId === section.id &&
      candidate.parentLayerId === undefined,
  );
  return (
    <section
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section blank-canvas-section selectable ${isSelected ? "selected" : ""}`}
    >
      <CustomSectionLayers
        section={section}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
      {editable && rootLayers.length === 0 && !hasNestedSections && (
        <div
          aria-hidden="true"
          style={{
            alignItems: "center",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            display: "flex",
            justifyContent: "center",
            minHeight: "240px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          Select this section, then add or drop a div, text, or image layer.
        </div>
      )}
    </section>
  );
}

function CustomSectionLayers({
  section,
  parentLayerId,
  selected,
  onSelect,
  editable,
}: {
  section: Portfolio["sections"][number];
  parentLayerId?: string;
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  editable?: boolean;
}) {
  return (
    <>
      {(section.customLayers || [])
        .filter((layer) => layer.parentLayerId === parentLayerId)
        .map((layer) => (
        <CustomLayerView
          key={layer.id}
          layer={layer}
          section={section}
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
        ))}
      <NestedSections
        section={section}
        parentLayerId={parentLayerId}
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </>
  );
}

function NestedSections({
  section,
  parentLayerId,
  selected,
  onSelect,
  editable,
}: {
  section: Portfolio["sections"][number];
  parentLayerId?: string;
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  editable?: boolean;
}) {
  const portfolio = React.useContext(PortfolioRenderContext);
  if (!portfolio) return null;

  const nestedSections = portfolio.sections
    .filter(
      (candidate) =>
        candidate.visible &&
        candidate.parentSectionId === section.id &&
        candidate.parentLayerId === parentLayerId,
    )
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {nestedSections.map((nestedSection) => (
        <SectionRenderer
          key={nestedSection.id}
          portfolio={portfolio}
          section={nestedSection}
          selected={selected}
          onSelect={onSelect}
          isSelected={
            selected?.kind === "section" &&
            selected.sectionId === nestedSection.id
          }
          editable={editable}
        />
      ))}
    </>
  );
}

function CustomLayerView({
  layer,
  section,
  selected,
  onSelect,
  editable,
}: {
  layer: CustomLayer;
  section: Portfolio["sections"][number];
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  editable?: boolean;
}) {
  const portfolio = React.useContext(PortfolioRenderContext);
  const layerId = `custom:${layer.id}`;
  const isSelected =
    selected?.kind === "layer" &&
    selected.sectionId === section.id &&
    selected.layerId === layerId;
  const target = editorTarget(section.id, `layer:${layerId}`);
  const selectLayer = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (editable) {
      onSelect({
        kind: "layer",
        sectionId: section.id,
        layerId,
        label: layer.name,
      });
    }
  };
  const className = `custom-layer custom-layer-${layer.type} ${isSelected ? "selected" : ""}`;
  const style = toElementStyle(getElementSettings(section, `layer:${layerId}`));

  if (layer.type === "div") {
    const hasNestedSections = portfolio?.sections.some(
      (candidate) =>
        candidate.visible &&
        candidate.parentSectionId === section.id &&
        candidate.parentLayerId === `custom:${layer.id}`,
    );
    const isEmpty = !layer.children?.length && !hasNestedSections;
    return (
      <div
        {...target}
        id={`custom-${layer.id}`}
        className={`${className} ${isEmpty ? "empty" : ""}`}
        style={style}
        onClick={selectLayer}
      >
        {layer.children?.map((child) => (
          <CustomLayerView
            key={child.id}
            layer={child}
            section={section}
            selected={selected}
            onSelect={onSelect}
            editable={editable}
          />
        ))}
        <NestedSections
          section={section}
          parentLayerId={`custom:${layer.id}`}
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
        {editable && isEmpty && (
          <span className="custom-layer-placeholder">Empty Div</span>
        )}
      </div>
    );
  }

  if (layer.type === "image") {
    return (
      <div
        {...target}
        id={`custom-${layer.id}`}
        className={className}
        style={{ ...style, ...toImageFrameStyle(layer.image) }}
        onClick={selectLayer}
      >
        {layer.image?.url ? (
          <img
            src={layer.image.url}
            alt={layer.image.alt || layer.name}
            style={toImageContentStyle(layer.image)}
          />
        ) : (
          <span>Image layer</span>
        )}
      </div>
    );
  }

  return (
    <p
      {...target}
      id={`custom-${layer.id}`}
      className={className}
      style={style}
      onClick={selectLayer}
    >
      {layer.text || "New text layer"}
    </p>
  );
}

function ProjectSectionIntro({
  section,
  selected,
  onSelect,
  editable,
}: {
  section: Portfolio["sections"][number];
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  editable?: boolean;
}) {
  const contentSettings = getElementSettings(section, "layer:section-heading");
  const titleSettings = getElementSettings(section, "text:title");
  const descriptionSettings = getElementSettings(section, "text:description");
  const shouldExpand =
    contentSettings.width ||
    contentSettings.spanSection ||
    titleSettings.width ||
    titleSettings.spanSection ||
    descriptionSettings.width ||
    descriptionSettings.spanSection;
  const nestedTextFields = projectTextFields(section, "section-heading");

  return (
    <div
      {...selectableLayer(
        section.id,
        "section-heading",
        "Project Content",
        onSelect,
        editable,
      )}
      id="project-content"
      className="section-heading"
      style={{
        order:
          templateLayerPosition(
            section,
            `${section.id}-project-content`,
            0,
          ) - 10,
        ...toElementStyle(contentSettings),
        maxWidth: shouldExpand ? "none" : undefined,
        width: shouldExpand ? "100%" : undefined,
      }}
    >
      {nestedTextFields.map((field) => (
        <ProjectTextLayer
          key={field}
          section={section}
          field={field}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
      <CustomSectionLayers
        section={section}
        parentLayerId="section-heading"
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </div>
  );
}

type ProjectTextField = "title" | "description";

function projectTextFields(
  section: Portfolio["sections"][number],
  parentLayerId: "section-heading" | null,
) {
  return (["title", "description"] as ProjectTextField[])
    .filter(
      (field) =>
        templateLayerParent(
          section,
          `${section.id}-text-${field}`,
          "section-heading",
        ) === parentLayerId,
    )
    .sort(
      (left, right) =>
        templateLayerPosition(section, `${section.id}-text-${left}`, 0) -
        templateLayerPosition(section, `${section.id}-text-${right}`, 1),
    );
}

function ProjectTextLayer({
  section,
  field,
  selected,
  onSelect,
  style,
}: {
  section: Portfolio["sections"][number];
  field: ProjectTextField;
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  style?: React.CSSProperties;
}) {
  const title = field === "title";
  return (
    <EditableText
      section={section}
      field={field}
      label={title ? "Projects Title" : "Projects Description"}
      limit={title ? 80 : 250}
      value={String(
        title
          ? contentValue(section, "title") || "Projects"
          : contentValue(section, "description") || contentValue(section, "subtitle") || "",
      )}
      selected={selected}
      onSelect={onSelect}
      as={title ? "h2" : "p"}
      className={
        title ? "project-section-title" : "project-section-description"
      }
      style={style}
    />
  );
}

function SectionHeading({
  section,
  selected,
  onSelect,
  titleLimit,
  editable,
}: {
  section: Portfolio["sections"][number];
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  titleLimit: number;
  editable?: boolean;
}) {
  const headingLayerSettings = getElementSettings(
    section,
    "layer:section-heading",
  );
  const titleSettings = getElementSettings(section, "text:title");
  const subtitleSettings = getElementSettings(section, "text:subtitle");
  const shouldExpand =
    headingLayerSettings.width ||
    headingLayerSettings.spanSection ||
    titleSettings.width ||
    titleSettings.spanSection ||
    subtitleSettings.width ||
    subtitleSettings.spanSection;

  return (
    <div
      {...selectableLayer(
        section.id,
        "section-heading",
        "Section Heading",
        onSelect,
        editable,
      )}
      className="section-heading"
      style={{
        ...toElementStyle(headingLayerSettings),
        maxWidth: shouldExpand ? "none" : undefined,
        width: shouldExpand ? "100%" : undefined,
      }}
    >
      <EditableText
        section={section}
        field="title"
        label={`${section.label} Title`}
        limit={titleLimit}
        value={String(contentValue(section, "title") || section.label)}
        selected={selected}
        onSelect={onSelect}
        as="h2"
      />
      {hasContentField(section, "subtitle") && (
        <EditableText
          section={section}
          field="subtitle"
          label={`${section.label} Subtitle`}
          limit={250}
          value={String(contentValue(section, "subtitle") || "")}
          selected={selected}
          onSelect={onSelect}
          as="p"
        />
      )}
      <CustomSectionLayers
        section={section}
        parentLayerId="section-heading"
        selected={selected}
        onSelect={onSelect}
        editable={editable}
      />
    </div>
  );
}

function EditableText({
  section,
  field,
  label,
  limit,
  value,
  selected,
  onSelect,
  as = "span",
  className = "",
  style: styleOverride,
}: {
  section: Portfolio["sections"][number];
  field: string;
  label: string;
  limit: number;
  value: string;
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) {
  const sectionId = section.id;
  const Tag = as;
  const active =
    selected?.kind === "text" &&
    selected.sectionId === sectionId &&
    selected.field === field;
  const updateSectionContent = useEditorStore(
    (state) => state.updateSectionContent,
  );
  const style = {
    ...toElementStyle(getElementSettings(section, `text:${field}`)),
    ...styleOverride,
  };
  return (
    <Tag
      {...editorTarget(sectionId, `text:${field}`)}
      className={`editable-text ${className} ${active ? "selected" : ""}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      onClick={(event) => {
        event.stopPropagation();
        onSelect({ kind: "text", sectionId, field, label, limit });
      }}
      onBlur={(event) =>
        updateSectionContent(
          sectionId,
          field,
          event.currentTarget.textContent?.slice(0, limit) || "",
        )
      }
    >
      {value || "Empty text"}
    </Tag>
  );
}
