import { Mail, MapPin } from "lucide-react";
import React from "react";
import { palettes } from "../data/templates";
import { useEditorStore } from "../store/editorStore";
import {
  CertificationItem,
  Portfolio,
  ProjectItem,
  SelectedElement,
  ServiceItem,
} from "../types/portfolio";
import { getElementSettings, toElementStyle } from "../utils/elementSettings";

interface Props {
  portfolio: Portfolio;
  selected?: SelectedElement;
  onSelect: (selected: SelectedElement) => void;
  editable?: boolean;
}

export function PortfolioPreview({
  portfolio,
  selected,
  onSelect,
  editable = false,
}: Props) {
  const palette = palettes.find((item) => item.id === portfolio.paletteId)!;
  const sorted = [...portfolio.sections]
    .sort((a, b) => a.order - b.order)
    .filter((section) => section.visible);
  const style = {
    "--primary": palette.primary,
    "--secondary": palette.secondary,
    "--accent": palette.accent,
    "--bg": palette.background,
    "--surface": palette.surface,
    "--text": palette.text,
    "--muted": palette.muted,
    "--border": palette.border,
  } as React.CSSProperties;

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
          return <HeaderSection key={section.id} {...props} />;
        if (section.type === "hero")
          return <HeroSection key={section.id} {...props} />;
        if (section.type === "projects")
          return <ProjectsSection key={section.id} {...props} />;
        if (section.type === "certifications")
          return <CertificationsSection key={section.id} {...props} />;
        if (section.type === "services")
          return <ServicesSection key={section.id} {...props} />;
        if (section.type === "about")
          return <AboutSection key={section.id} {...props} />;
        return <FooterSection key={section.id} {...props} />;
      })}
    </article>
  );
}

type SectionProps = Props & {
  section: Portfolio["sections"][number];
  isSelected: boolean;
};

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

function sectionStyle(section: Portfolio["sections"][number]) {
  const spacing = {
    small: "34px",
    medium: "58px",
    large: "92px",
  };
  const contentWidths = {
    narrow: "760px",
    standard: "1000px",
    wide: "1220px",
  };
  const style: React.CSSProperties & Record<string, string | undefined> = {
    "--section-content-width":
      contentWidths[section.settings.contentWidth || "standard"],
    backgroundColor: section.settings.backgroundColor,
    color: section.settings.textColor,
    textAlign: section.settings.alignment,
    marginTop:
      section.settings.marginTop !== undefined
        ? `${section.settings.marginTop}px`
        : undefined,
    marginBottom:
      section.settings.marginBottom !== undefined
        ? `${section.settings.marginBottom}px`
        : undefined,
    marginRight:
      section.settings.margin?.right !== undefined
        ? `${section.settings.margin.right}px`
        : undefined,
    marginLeft:
      section.settings.margin?.left !== undefined
        ? `${section.settings.margin.left}px`
        : undefined,
    paddingTop:
      section.settings.padding?.top !== undefined
        ? `${section.settings.padding.top}px`
        : section.settings.paddingTop !== undefined
          ? `${section.settings.paddingTop}px`
          : section.settings.spacing
            ? spacing[section.settings.spacing]
            : undefined,
    paddingRight:
      section.settings.padding?.right !== undefined
        ? `${section.settings.padding.right}px`
        : section.settings.paddingInline !== undefined
          ? `${section.settings.paddingInline}px`
          : undefined,
    paddingBottom:
      section.settings.padding?.bottom !== undefined
        ? `${section.settings.padding.bottom}px`
        : section.settings.paddingBottom !== undefined
          ? `${section.settings.paddingBottom}px`
          : section.settings.spacing
            ? spacing[section.settings.spacing]
            : undefined,
    paddingLeft:
      section.settings.padding?.left !== undefined
        ? `${section.settings.padding.left}px`
        : section.settings.paddingInline !== undefined
          ? `${section.settings.paddingInline}px`
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
  };
  if (section.settings.textColor) {
    style["--text"] = section.settings.textColor;
    style["--muted"] = section.settings.textColor;
  }
  if (section.settings.accentColor) {
    style["--accent"] = section.settings.accentColor;
  }
  return style;
}

function HeaderSection({
  portfolio,
  section,
  onSelect,
  isSelected,
  editable,
}: SectionProps) {
  const visibleSections = portfolio.sections.filter(
    (item) => item.visible && !["header", "footer"].includes(item.type),
  );
  return (
    <header
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-header selectable ${isSelected ? "selected" : ""}`}
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
      <nav
        {...editorTarget(section.id, "layer:navigation")}
        style={toElementStyle(getElementSettings(section, "layer:navigation"))}
      >
        {visibleSections.map((item) => (
          <a key={item.id} href={`#${item.type}`}>
            {item.label}
          </a>
        ))}
      </nav>
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
  const image = section.content.image as
    | { url?: string; alt?: string }
    | undefined;
  return (
    <section
      id="hero"
      {...selectable(section, isSelected, onSelect, editable)}
      className={`portfolio-section portfolio-hero selectable ${isSelected ? "selected" : ""}`}
    >
      <div>
        <EditableText
          sectionId={section.id}
          field="eyebrow"
          label="Hero Eyebrow"
          limit={80}
          value={String(section.content.eyebrow || "")}
          selected={selected}
          onSelect={onSelect}
          className="eyebrow"
        />
        <EditableText
          sectionId={section.id}
          field="headline"
          label="Hero Headline"
          limit={120}
          value={String(section.content.headline || "")}
          selected={selected}
          onSelect={onSelect}
          as="h1"
        />
        <EditableText
          sectionId={section.id}
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
      </div>
      <button
        {...editorTarget(section.id, "image:image")}
        className="image-slot hero-image"
        style={toElementStyle(getElementSettings(section, "image:image"))}
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
          <img src={image.url} alt={image.alt || ""} />
        ) : (
          <span>Hero image slot · 4:5 or 1:1</span>
        )}
      </button>
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
      <SectionHeading
        section={section}
        selected={selected}
        onSelect={onSelect}
        titleLimit={80}
      />
      <div
        {...editorTarget(section.id, "layer:project-grid")}
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
              style={toElementStyle(
                getElementSettings(
                  section,
                  `layer:project:${project.id}:image`,
                ),
              )}
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
                <img src={project.image.url} alt={project.image.alt} />
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
          </button>
        ))}
      </div>
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
              style={toElementStyle(
                getElementSettings(
                  section,
                  `layer:certification:${item.id}:image`,
                ),
              )}
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
                <img src={item.image.url} alt={item.image.alt} />
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
          </button>
        ))}
      </div>
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
              style={toElementStyle(
                getElementSettings(section, `layer:service:${item.id}:icon`),
              )}
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
                <img src={item.icon.url} alt={item.icon.alt} />
              ) : (
                <span>Icon</span>
              )}
            </div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span>{item.startingPrice}</span>
            <small>{item.ctaText}</small>
          </button>
        ))}
      </div>
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
        />
        <EditableText
          sectionId={section.id}
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
        <div className="tag-row">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
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
      </aside>
    </section>
  );
}

function FooterSection({
  portfolio,
  section,
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
      <a href="#top">Back to top</a>
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
    </footer>
  );
}

function SectionHeading({
  section,
  selected,
  onSelect,
  titleLimit,
}: {
  section: Portfolio["sections"][number];
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  titleLimit: number;
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
      className="section-heading"
      style={{
        ...toElementStyle(headingLayerSettings),
        maxWidth: shouldExpand ? "none" : undefined,
        width: shouldExpand ? "100%" : undefined,
      }}
    >
      <EditableText
        sectionId={section.id}
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
          sectionId={section.id}
          field="subtitle"
          label={`${section.label} Subtitle`}
          limit={250}
          value={String(section.content.subtitle || "")}
          selected={selected}
          onSelect={onSelect}
          as="p"
        />
      )}
    </div>
  );
}

function EditableText({
  sectionId,
  field,
  label,
  limit,
  value,
  selected,
  onSelect,
  as = "span",
  className = "",
}: {
  sectionId: string;
  field: string;
  label: string;
  limit: number;
  value: string;
  selected?: SelectedElement;
  onSelect: Props["onSelect"];
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}) {
  const Tag = as;
  const active =
    selected?.kind === "text" &&
    selected.sectionId === sectionId &&
    selected.field === field;
  const updateSectionContent = useEditorStore(
    (state) => state.updateSectionContent,
  );
  const section = useEditorStore((state) =>
    state.portfolio?.sections.find((item) => item.id === sectionId),
  );
  const style = section
    ? toElementStyle(getElementSettings(section, `text:${field}`))
    : undefined;
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
