import {
  CertificationItem,
  CustomLayer,
  PortfolioSection,
  ProjectItem,
  SectionType,
  SelectedElement,
  ServiceItem,
} from "../../types/portfolio";

export type LayerNode = {
  id: string;
  label: string;
  selection: SelectedElement;
  removable: boolean;
  sortable?: boolean;
  acceptsChildren?: boolean;
  customType?: CustomLayer["type"];
  children?: LayerNode[];
};

export function getSectionLayers(
  section: PortfolioSection,
  allSections: PortfolioSection[] = [section],
): LayerNode[] {
  const customLayers = section.customLayers || [];
  return [{
    id: `${section.id}-root`,
    label: `${section.label} section`,
    selection: { kind: "section", sectionId: section.id },
    removable: false,
    acceptsChildren: true,
    children: [
      ...attachNativeContainerChildren(
        section,
        sectionChildren(section, allSections),
        customLayers,
      ),
      ...customLayerNodes(
        section,
        customLayers.filter((layer) => !layer.parentLayerId),
      ),
    ],
  }];
}

function sectionChildren(
  section: PortfolioSection,
  allSections: PortfolioSection[],
): LayerNode[] {
  if (section.type === "header") {
    return [
      textLayer(section, "logoText", "Logo", "Header Logo", 60),
      {
        id: `${section.id}-navigation`,
        label: "Navigation",
        selection: layerSelection(section, "navigation", "Navigation"),
        removable: false,
        acceptsChildren: true,
        children: allSections
          .filter(
            (item) => item.visible && !["header", "footer"].includes(item.type),
          )
          .map((item) => ({
            id: `${section.id}-navigation-${item.id}`,
            label: item.label,
            selection: layerSelection(
              section,
              `navigation-link:${item.id}`,
              `${item.label} Navigation Link`,
            ),
            removable: false,
          })),
      },
      textLayer(section, "contactButton", "Contact button", "Contact Button", 40),
    ];
  }

  if (section.type === "hero") {
    return [
      {
        id: `${section.id}-hero-content`,
        label: "Hero content",
        selection: layerSelection(section, "hero-content", "Hero Content"),
        removable: false,
        acceptsChildren: true,
        children: [
          textLayer(section, "eyebrow", "Eyebrow", "Hero Eyebrow", 80),
          textLayer(section, "headline", "Headline", "Hero Headline", 120),
          textLayer(section, "description", "Description", "Hero Description", 250),
          textLayer(section, "primaryCta", "Primary button", "Primary Button", 40),
          textLayer(section, "secondaryCta", "Secondary button", "Secondary Button", 40),
        ],
      },
      imageLayer(section, "image", "Hero image", "Hero Image", "hero-image"),
    ];
  }

  if (section.type === "projects") {
    const projects = (section.content.items || []) as ProjectItem[];
    return [
      {
        id: `${section.id}-project-content`,
        label: "Content",
        selection: layerSelection(section, "section-heading", "Project Content"),
        removable: false,
        acceptsChildren: true,
        children: [
          textLayer(section, "title", "Title", "Projects Title", 80),
          textLayer(
            section,
            "description",
            "Description",
            "Projects Description",
            250,
          ),
        ],
      },
      {
        id: `${section.id}-projects-list`,
        label: "Project list",
        selection: layerSelection(section, "project-grid", "Projects List"),
        removable: false,
        acceptsChildren: true,
        children: projects.map((project, index) => {
          const name = project.title || `Project ${index + 1}`;
          return {
            id: project.id,
            label: name,
            selection: { kind: "project", sectionId: section.id, itemId: project.id },
            removable: true,
            sortable: true,
            acceptsChildren: true,
            children: [
              childLayer(project.id, "image", "Image", `${name} Image`, section.id),
              childLayer(project.id, "title", "Title", `${name} Title`, section.id),
              childLayer(project.id, "description", "Description", `${name} Description`, section.id),
              childLayer(project.id, "tags", "Tags", `${name} Tags`, section.id),
              childLayer(project.id, "cta", "CTA", `${name} CTA`, section.id),
            ],
          };
        }),
      },
    ];
  }

  if (section.type === "certifications") {
    const certifications = (section.content.items || []) as CertificationItem[];
    return [
      headingLayer(section, 100),
      {
        id: `${section.id}-certification-list`,
        label: "Certification list",
        selection: layerSelection(section, "certification-list", "Certification List"),
        removable: false,
        acceptsChildren: true,
        children: certifications.map((certification, index) => ({
          id: certification.id,
          label: certification.name || `Certification ${index + 1}`,
          selection: { kind: "certification", sectionId: section.id, itemId: certification.id },
          removable: true,
          sortable: true,
          acceptsChildren: true,
          children: [{
            id: `${certification.id}-image`,
            label: "Image",
            selection: layerSelection(
              section,
              `certification:${certification.id}:image`,
              `${certification.name || `Certification ${index + 1}`} Image`,
            ),
            removable: false,
          }],
        })),
      },
    ];
  }

  if (section.type === "services") {
    const services = (section.content.items || []) as ServiceItem[];
    return [
      headingLayer(section, 80),
      {
        id: `${section.id}-services-list`,
        label: "Service cards",
        selection: layerSelection(section, "service-cards", "Service Cards"),
        removable: false,
        acceptsChildren: true,
        children: services.map((service, index) => ({
          id: service.id,
          label: service.title || `Service card ${index + 1}`,
          selection: { kind: "service", sectionId: section.id, itemId: service.id },
          removable: true,
          sortable: true,
          acceptsChildren: true,
          children: [{
            id: `${service.id}-icon`,
            label: "Icon / image",
            selection: layerSelection(
              section,
              `service:${service.id}:icon`,
              `${service.title || `Service ${index + 1}`} Icon/Image`,
            ),
            removable: false,
          }],
        })),
      },
    ];
  }

  if (section.type === "about") {
    return [
      {
        id: `${section.id}-about-content`,
        label: "About content",
        selection: layerSelection(section, "about-content", "About Content"),
        removable: false,
        acceptsChildren: true,
        children: [
          textLayer(section, "title", "Heading", "About Heading", 80),
          textLayer(section, "description", "Description", "About Description", 1000),
          {
            id: `${section.id}-skills`,
            label: "Skills",
            selection: layerSelection(section, "skills", "Skills"),
            removable: false,
          },
        ],
      },
      {
        id: `${section.id}-about-panel`,
        label: "Contact panel",
        selection: layerSelection(section, "about-panel", "About Contact Panel"),
        removable: false,
        acceptsChildren: true,
      },
    ];
  }

  if (section.type === "custom") return [];

  return [
    textLayer(section, "logoText", "Logo", "Footer Logo", 60),
    textLayer(section, "message", "Message", "Footer Message", 160),
    {
      id: `${section.id}-back-to-top`,
      label: "Back to top link",
      selection: layerSelection(section, "back-to-top", "Back to Top Link"),
      removable: false,
    },
    textLayer(section, "copyright", "Copyright", "Copyright Text", 160),
  ];
}

function headingLayer(section: PortfolioSection, limit: number): LayerNode {
  const children = [textLayer(section, "title", "Title", `${section.label} Title`, limit)];
  if (section.content.subtitle !== undefined) {
    children.push(textLayer(section, "subtitle", "Subtitle", `${section.label} Subtitle`, 250));
  }
  return {
    id: `${section.id}-section-heading`,
    label: "Section heading",
    selection: layerSelection(section, "section-heading", "Section Heading"),
    removable: false,
    acceptsChildren: true,
    children,
  };
}

function textLayer(
  section: PortfolioSection,
  field: string,
  label: string,
  fullLabel: string,
  limit: number,
): LayerNode {
  return {
    id: `${section.id}-text-${field}`,
    label,
    selection: { kind: "text", sectionId: section.id, field, label: fullLabel, limit },
    removable: false,
  };
}

function imageLayer(
  section: PortfolioSection,
  field: string,
  label: string,
  fullLabel: string,
  slot: string,
): LayerNode {
  return {
    id: `${section.id}-image-${field}`,
    label,
    selection: { kind: "image", sectionId: section.id, field, label: fullLabel, slot },
    removable: false,
  };
}

function layerSelection(
  section: PortfolioSection,
  layerId: string,
  label: string,
): SelectedElement {
  return { kind: "layer", sectionId: section.id, layerId, label };
}

function customLayerNodes(
  section: PortfolioSection,
  layers: CustomLayer[],
): LayerNode[] {
  return layers.map((layer) => ({
    id: `custom:${layer.id}`,
    label: layer.name,
    selection: layerSelection(section, `custom:${layer.id}`, layer.name),
    removable: true,
    sortable: true,
    acceptsChildren: layer.type === "div",
    customType: layer.type,
    children:
      layer.type === "div"
        ? customLayerNodes(section, layer.children || [])
        : undefined,
  }));
}

function attachNativeContainerChildren(
  section: PortfolioSection,
  nodes: LayerNode[],
  customLayers: CustomLayer[],
): LayerNode[] {
  return nodes.map((node) => {
    const nativeLayerId = node.acceptsChildren
      ? nativeContainerLayerIdFromSelection(node.selection)
      : undefined;
    const assignedLayers = nativeLayerId
      ? customLayers.filter((layer) => layer.parentLayerId === nativeLayerId)
      : [];
    return {
      ...node,
      children: [
        ...attachNativeContainerChildren(
          section,
          node.children || [],
          customLayers,
        ),
        ...customLayerNodes(section, assignedLayers),
      ],
    };
  });
}

export function isNativeContainerLayerId(layerId: string) {
  return [
    "navigation",
    "hero-content",
    "project-grid",
    "certification-list",
    "service-cards",
    "about-content",
    "about-panel",
    "section-heading",
  ].includes(layerId) || /^(project|certification|service):[^:]+$/.test(layerId);
}

export function nativeContainerLayerIdFromSelection(
  selected: SelectedElement | undefined,
) {
  if (!selected) return undefined;
  if (selected.kind === "layer" && isNativeContainerLayerId(selected.layerId)) {
    return selected.layerId;
  }
  if (
    selected.kind === "project" ||
    selected.kind === "certification" ||
    selected.kind === "service"
  ) {
    return `${selected.kind}:${selected.itemId}`;
  }
  return undefined;
}

export function customLayerIdFromSelection(
  selected: SelectedElement | undefined,
) {
  if (selected?.kind !== "layer" || !selected.layerId.startsWith("custom:")) {
    return undefined;
  }
  return selected.layerId.slice("custom:".length);
}

export function selectedLabel(
  selected: SelectedElement | undefined,
  sections: PortfolioSection[],
) {
  if (!selected) return "";
  const section = sections.find((item) => "sectionId" in selected && item.id === selected.sectionId);
  if (selected.kind === "section") return section ? `${section.label} Section` : "Section";
  if (selected.kind === "layer") return selected.label;
  if (selected.kind === "text" || selected.kind === "image") return selected.label;
  if (selected.kind === "project") return "Project Card";
  if (selected.kind === "certification") return "Certification Card";
  if (selected.kind === "service") return "Service Card";
  return "Layer";
}

export function isCollectionSection(type: SectionType) {
  return type === "projects" || type === "certifications" || type === "services";
}

export function collectionLabel(type: SectionType) {
  if (type === "projects") return "project";
  if (type === "certifications") return "certification";
  return "service";
}

function childLayer(projectId: string, key: string, label: string, fullLabel: string, sectionId: string): LayerNode {
  return {
    id: `${projectId}-${key}`,
    label,
    selection: { kind: "layer", sectionId, layerId: `project:${projectId}:${key}`, label: fullLabel },
    removable: false,
  };
}
