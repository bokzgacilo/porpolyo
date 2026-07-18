import { Mail, MapPin, Menu } from "lucide-react";
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
  ImageAsset,
  Portfolio,
  ProjectItem,
  SelectedElement,
  ServiceItem,
} from "../types/portfolio";
import { getElementSettings, toElementStyle } from "../utils/elementSettings";
import { resolveSectionLayoutSettings } from "../config/sectionLayoutSettings";
import { resolveBodyLayout } from "../config/bodySettings";

interface Props {
  portfolio: Portfolio;
  selected?: SelectedElement;
  onSelect: (selected: SelectedElement) => void;
  editable?: boolean;
}

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
        .filter((section) => section.visible),
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
    <article
      className={`portfolio-site template-${portfolio.templateId} ${editable ? "editable-preview" : ""}`}
      style={style}
    >
      {sorted.map((section) => {
        const isSelected =
          selected?.kind === "section" && selected.sectionId === section.id;
        const props = {
          portfolio,
          section,
          selected,
          onSelect,
          isSelected,
          editable,
        };
        if (section.type === "header")
          return <MemoHeaderSection key={section.id} {...props} />;
        if (section.type === "hero")
          return <MemoHeroSection key={section.id} {...props} />;
        if (section.type === "projects")
          return <MemoProjectsSection key={section.id} {...props} />;
        if (section.type === "certifications")
          return <MemoCertificationsSection key={section.id} {...props} />;
        if (section.type === "services")
          return <MemoServicesSection key={section.id} {...props} />;
        if (section.type === "about")
          return <MemoAboutSection key={section.id} {...props} />;
        if (section.type === "custom")
          return <MemoBlankSection key={section.id} {...props} />;
        return <MemoFooterSection key={section.id} {...props} />;
      })}
    </article>
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

function sameSectionProps(previous: SectionProps, next: SectionProps) {
  if (
    previous.section !== next.section ||
    previous.isSelected !== next.isSelected ||
    previous.editable !== next.editable ||
    previous.onSelect !== next.onSelect ||
    previous.portfolio.owner !== next.portfolio.owner
  ) {
    return false;
  }
  if (
    previous.section.type === "header" &&
    previous.portfolio.sections !== next.portfolio.sections
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
          : section.settings.spacing
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
          : section.settings.spacing
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
      section.settings.borderWidth !== undefined
        ? `${section.settings.borderWidth}px`
        : undefined,
    borderStyle: section.settings.borderStyle,
    borderColor: section.settings.borderColor,
    borderRadius:
      section.settings.borderRadius !== undefined
        ? `${section.settings.borderRadius}px`
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
      layout?.layoutMode === "stack" ? layout.stackAlign : undefined,
    justifyContent:
      layout?.layoutMode === "stack" ? layout.stackJustify : undefined,
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

function sectionSizeValue(size?: { value?: number; unit: "px" | "%" }) {
  return size?.value !== undefined ? `${size.value}${size.unit}` : undefined;
}

function HeaderSection({
  portfolio,
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const visibleSections = portfolio.sections.filter(
    (item) => item.visible && !["header", "footer"].includes(item.type),
  );
  const tabletNavigationMode =
    section.content.tabletNavigationMode === "menu" ? "menu" : "text";
  const mobileNavigationMode =
    section.content.mobileNavigationMode === "menu" ? "menu" : "text";
  return (
    <header
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-header navigation-tablet-${tabletNavigationMode} navigation-mobile-${mobileNavigationMode} selectable ${isSelected ? "selected" : ""}`}
    >
      <button
        {...editorTarget(section.id, "text:logoText")}
        className="brand"
        style={toElementStyle(getElementSettings(section, "text:logoText"))}
        onClick={(event) => {
          event.stopPropagation();
          if (editable)
            onSelect({
              kind: "text",
              sectionId: section.id,
              field: "logoText",
              label: "Header Logo",
              limit: 60,
            });
        }}
      >
        {String(section.content.logoText || portfolio.owner.fullName)}
      </button>
      <div
        {...editorTarget(section.id, "layer:navigation")}
        className="portfolio-navigation"
        style={toElementStyle(getElementSettings(section, "layer:navigation"))}
      >
        <nav className="portfolio-nav-links" aria-label="Primary navigation">
          {visibleSections.map((item) => (
            <a
              key={item.id}
              {...editorTarget(
                section.id,
                `layer:navigation-link:${item.id}`,
              )}
              href={`#${item.type}`}
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
                  label: `${item.label} Navigation Link`,
                });
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <details className="portfolio-nav-menu">
          <summary>
            <Menu size={18} aria-hidden="true" />
            <span>Menu</span>
          </summary>
          <nav aria-label="Compact navigation">
            {visibleSections.map((item) => (
              <a
                key={item.id}
                {...editorTarget(
                  section.id,
                  `layer:navigation-link:${item.id}`,
                )}
                href={`#${item.type}`}
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
                    label: `${item.label} Navigation Link`,
                  });
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </details>
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
        className="portfolio-button"
        style={toElementStyle(
          getElementSettings(section, "text:contactButton"),
        )}
        href={`mailto:${portfolio.owner.email}`}
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
        {String(section.content.contactButton || "Contact")}
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
  const image = section.content.image as ImageAsset | undefined;
  return (
    <section
      id="hero"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section portfolio-hero selectable ${isSelected ? "selected" : ""}`}
    >
      <div
        {...editorTarget(section.id, "layer:hero-content")}
        style={toElementStyle(getElementSettings(section, "layer:hero-content"))}
      >
        <EditableText
          section={section}
          field="eyebrow"
          label="Hero Eyebrow"
          limit={80}
          value={String(section.content.eyebrow || "")}
          selected={selected}
          onSelect={onSelect}
          className="eyebrow"
        />
        <EditableText
          section={section}
          field="headline"
          label="Hero Headline"
          limit={120}
          value={String(section.content.headline || "")}
          selected={selected}
          onSelect={onSelect}
          as="h1"
        />
        <EditableText
          section={section}
          field="description"
          label="Hero Description"
          limit={250}
          value={String(
            section.content.description || portfolio.owner.shortDescription,
          )}
          selected={selected}
          onSelect={onSelect}
          as="p"
        />
        <div className="hero-actions">
          <a
            {...editorTarget(section.id, "text:primaryCta")}
            className="portfolio-button"
            style={toElementStyle(
              getElementSettings(section, "text:primaryCta"),
            )}
            href="#projects"
          >
            {String(section.content.primaryCta || "View Projects")}
          </a>
          <a
            {...editorTarget(section.id, "text:secondaryCta")}
            className="portfolio-button secondary"
            style={toElementStyle(
              getElementSettings(section, "text:secondaryCta"),
            )}
            href={`mailto:${portfolio.owner.email}`}
          >
            {String(section.content.secondaryCta || "Contact Me")}
          </a>
        </div>
        <div className="social-row">
          {portfolio.owner.socialLinks.map((link) => (
            <a key={link.platform} href={link.url}>
              {link.platform}
            </a>
          ))}
        </div>
        <CustomSectionLayers
          section={section}
          parentLayerId="hero-content"
          selected={selected}
          onSelect={onSelect}
          editable={editable}
        />
      </div>
      <button
        {...editorTarget(section.id, "image:image")}
        className="image-slot hero-image"
        style={{
          ...toElementStyle(getElementSettings(section, "image:image")),
          ...toImageFrameStyle(image),
        }}
        onClick={(event) => {
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
  const items = (section.content.items || []) as ProjectItem[];

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
      <div
        {...editorTarget(section.id, "layer:project-grid")}
        id="project-list"
        className="project-grid"
        style={toElementStyle(
          getElementSettings(section, "layer:project-grid"),
        )}
      >
        {items.map((project, projectIndex) => (
          <button
            {...editorTarget(section.id, `project:${project.id}`)}
            key={project.id || `project-${projectIndex}`}
            className="portfolio-card project-card"
            style={toElementStyle(
              getElementSettings(section, `project:${project.id}`),
            )}
            onClick={(event) => {
              event.stopPropagation();
              onSelect({
                kind: "project",
                sectionId: section.id,
                itemId: project.id,
              });
            }}
          >
            <div
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
            {project.featured && <small>Featured</small>}
            <CustomSectionLayers
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
  const items = (section.content.items || []) as CertificationItem[];
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
        {...editorTarget(section.id, "layer:certification-list")}
        className="cert-list"
        style={toElementStyle(
          getElementSettings(section, "layer:certification-list"),
        )}
      >
        {items.map((item) => (
          <button
            {...editorTarget(section.id, `certification:${item.id}`)}
            key={item.id}
            className="portfolio-card cert-card"
            style={toElementStyle(
              getElementSettings(section, `certification:${item.id}`),
            )}
            onClick={(event) => {
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
  const items = (section.content.items || []) as ServiceItem[];
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
        {...editorTarget(section.id, "layer:service-cards")}
        className="service-grid"
        style={toElementStyle(
          getElementSettings(section, "layer:service-cards"),
        )}
      >
        {items.map((item) => (
          <button
            {...editorTarget(section.id, `service:${item.id}`)}
            key={item.id}
            className="portfolio-card service-card"
            style={toElementStyle(
              getElementSettings(section, `service:${item.id}`),
            )}
            onClick={(event) => {
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
  const skills = (section.content.skills || []) as string[];
  return (
    <section
      id="about"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section portfolio-about selectable ${isSelected ? "selected" : ""}`}
    >
      <div
        {...editorTarget(section.id, "layer:about-content")}
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
            section.content.description ||
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
        {...editorTarget(section.id, "layer:about-panel")}
        style={toElementStyle(getElementSettings(section, "layer:about-panel"))}
      >
        <span>
          <MapPin size={16} /> {portfolio.owner.location}
        </span>
        <span>
          <Mail size={16} /> {portfolio.owner.email}
        </span>
        <strong>{String(section.content.availability || "Available")}</strong>
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
        {String(section.content.logoText || portfolio.owner.fullName)}
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
        {String(section.content.message || "")}
      </span>
      <a
        {...editorTarget(section.id, "layer:back-to-top")}
        href="#top"
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
        Back to top
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
        {String(section.content.copyright || "")}
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
  section,
  selected,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const rootLayers = (section.customLayers || []).filter(
    (layer) => !layer.parentLayerId,
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
      {editable && rootLayers.length === 0 && (
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
    const isEmpty = !layer.children?.length;
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

  return (
    <div
      {...editorTarget(section.id, "layer:section-heading")}
      id="project-content"
      className="section-heading"
      style={{
        ...toElementStyle(contentSettings),
        maxWidth: shouldExpand ? "none" : undefined,
        width: shouldExpand ? "100%" : undefined,
      }}
    >
      <EditableText
        section={section}
        field="title"
        label="Projects Title"
        limit={80}
        value={String(section.content.title || "Projects")}
        selected={selected}
        onSelect={onSelect}
        as="h2"
      />
      <EditableText
        section={section}
        field="description"
        label="Projects Description"
        limit={250}
        value={String(
          section.content.description || section.content.subtitle || "",
        )}
        selected={selected}
        onSelect={onSelect}
        as="p"
      />
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
      {...editorTarget(section.id, "layer:section-heading")}
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
        value={String(section.content.title || section.label)}
        selected={selected}
        onSelect={onSelect}
        as="h2"
      />
      {section.content.subtitle !== undefined && (
        <EditableText
          section={section}
          field="subtitle"
          label={`${section.label} Subtitle`}
          limit={250}
          value={String(section.content.subtitle || "")}
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
  const style = toElementStyle(getElementSettings(section, `text:${field}`));
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
