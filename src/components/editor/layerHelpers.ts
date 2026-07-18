import {
  CertificationItem,
  CustomLayer,
  PortfolioSection,
  ProjectItem,
  SectionType,
  SelectedElement,
  ServiceItem,
} from "../../types/portfolio";
import { contentValue, hasContentField } from "../../utils/contentFields";
import { resolveHeaderNavigationLinks } from "../../utils/headerNavigation";

export type LayerNode = {
  id: string;
  label: string;
  selection: SelectedElement;
  removable: boolean;
  sortable?: boolean;
  reparentable?: boolean;
  acceptsChildren?: boolean;
  customType?: CustomLayer["type"];
  children?: LayerNode[];
};

export function getSectionLayers(
  section: PortfolioSection,
  allSections: PortfolioSection[] = [section],
): LayerNode[] {
  return [buildSectionNode(section, allSections, new Set<string>())];
}

function buildSectionNode(
  section: PortfolioSection,
  allSections: PortfolioSection[],
  ancestorSectionIds: Set<string>,
): LayerNode {
  const customLayers = section.customLayers || [];
  const nextAncestorSectionIds = new Set(ancestorSectionIds).add(section.id);
  return {
    id: `section:${section.id}`,
    label: section.label,
    selection: { kind: "section", sectionId: section.id },
    removable: !!section.parentSectionId,
    acceptsChildren: true,
    children: [
      ...attachNativeContainerChildren(
        section,
        sectionChildren(section, allSections),
        customLayers,
        allSections,
        nextAncestorSectionIds,
      ),
      ...customLayerNodes(
        section,
        customLayers.filter((layer) => !layer.parentLayerId),
        allSections,
        nextAncestorSectionIds,
      ),
      ...nestedSectionNodes(
        section,
        allSections,
        undefined,
        nextAncestorSectionIds,
      ),
    ],
  };
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
        children: resolveHeaderNavigationLinks(section, allSections).map(
          ({ section: item, label }) => ({
            id: `${section.id}-navigation-${item.id}`,
            label,
            selection: layerSelection(
              section,
              `navigation-link:${item.id}`,
              `${label} Navigation Link`,
            ),
            removable: false,
          }),
        ),
      },
      textLayer(section, "contactButton", "Contact button", "Contact Button", 40),
    ];
  }

  if (section.type === "hero") {
    const heroContentId = `${section.id}-hero-content`;
    const heroActionsId = `${section.id}-hero-actions`;
    const layers: LayerNode[] = [
      {
        id: heroContentId,
        label: "Hero content",
        selection: layerSelection(section, "hero-content", "Hero Content"),
        removable: false,
        reparentable: true,
        acceptsChildren: true,
      },
      {
        ...imageLayer(section, "image", "Hero image", "Hero Image", "hero-image"),
        reparentable: true,
      },
      {
        ...textLayer(section, "eyebrow", "Eyebrow", "Hero Eyebrow", 80),
        reparentable: true,
      },
      {
        ...textLayer(section, "headline", "Headline", "Hero Headline", 120),
        reparentable: true,
      },
      {
        ...textLayer(
          section,
          "description",
          "Description",
          "Hero Description",
          250,
        ),
        reparentable: true,
      },
      {
        id: heroActionsId,
        label: "Button group",
        selection: layerSelection(section, "hero-actions", "Button Group"),
        removable: false,
        reparentable: true,
        acceptsChildren: true,
      },
      {
        ...textLayer(
          section,
          "primaryCta",
          "Primary button",
          "Primary Button",
          40,
        ),
        reparentable: true,
      },
      {
        ...textLayer(
          section,
          "secondaryCta",
          "Secondary button",
          "Secondary Button",
          40,
        ),
        reparentable: true,
      },
    ];

    return nestTemplateLayers(section, layers, {
      [heroContentId]: null,
      [`${section.id}-image-image`]: null,
      [`${section.id}-text-eyebrow`]: "hero-content",
      [`${section.id}-text-headline`]: "hero-content",
      [`${section.id}-text-description`]: "hero-content",
      [heroActionsId]: "hero-content",
      [`${section.id}-text-primaryCta`]: "hero-actions",
      [`${section.id}-text-secondaryCta`]: "hero-actions",
    });
  }

  if (section.type === "projects") {
    const projects = contentValue<ProjectItem[]>(section, "items") || [];
    const projectTextLayers = [
      {
        ...textLayer(section, "title", "Title", "Projects Title", 80),
        reparentable: true,
      },
      {
        ...textLayer(
          section,
          "description",
          "Description",
          "Projects Description",
          250,
        ),
        reparentable: true,
      },
    ];
    const contentLayers = orderTemplateLayers(
      section,
      projectTextLayers.filter(
        (layer) =>
          templateLayerParent(section, layer.id, "section-heading") ===
          "section-heading",
      ),
    );
    const rootTextLayers = projectTextLayers
      .filter(
        (layer) => templateLayerParent(section, layer.id, "section-heading") === null,
      )
      .map((layer) => ({ ...layer, sortable: true }));

    return orderTemplateLayers(section, [
      {
        id: `${section.id}-project-content`,
        label: "Content",
        selection: layerSelection(section, "section-heading", "Project Content"),
        removable: false,
        sortable: true,
        acceptsChildren: true,
        children: contentLayers,
      },
      {
        id: `${section.id}-projects-list`,
        label: "Project list",
        selection: layerSelection(section, "project-grid", "Projects List"),
        removable: false,
        sortable: true,
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
      ...rootTextLayers,
    ]);
  }

  if (section.type === "certifications") {
    const certifications = contentValue<CertificationItem[]>(section, "items") || [];
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
    const services = contentValue<ServiceItem[]>(section, "items") || [];
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

function orderTemplateLayers(
  section: PortfolioSection,
  layers: LayerNode[],
): LayerNode[] {
  const savedOrder = section.settings.templateLayerOrder;
  if (!savedOrder?.length) return layers;
  const positions = new Map(savedOrder.map((id, index) => [id, index]));
  return [...layers].sort(
    (left, right) =>
      (positions.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (positions.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

function templateLayerParent(
  section: PortfolioSection,
  layerId: string,
  fallback: string | null,
) {
  const parents = section.settings.templateLayerParents;
  return parents && Object.prototype.hasOwnProperty.call(parents, layerId)
    ? parents[layerId]
    : fallback;
}

function nestTemplateLayers(
  section: PortfolioSection,
  layers: LayerNode[],
  defaultParents: Record<string, string | null>,
) {
  const containerIds = new Set(
    layers.flatMap((layer) =>
      layer.acceptsChildren && layer.selection.kind === "layer"
        ? [layer.selection.layerId]
        : [],
    ),
  );
  const childrenByParent = new Map<string | null, LayerNode[]>();

  layers.forEach((layer) => {
    const fallback = defaultParents[layer.id] ?? null;
    const requestedParent = templateLayerParent(
      section,
      layer.id,
      fallback,
    );
    const parent =
      requestedParent && containerIds.has(requestedParent)
        ? requestedParent
        : null;
    childrenByParent.set(parent, [
      ...(childrenByParent.get(parent) || []),
      layer,
    ]);
  });

  const buildChildren = (
    parent: string | null,
    ancestors: Set<string>,
  ): LayerNode[] =>
    orderTemplateLayers(section, childrenByParent.get(parent) || []).map(
      (layer) => {
        if (!layer.acceptsChildren || layer.selection.kind !== "layer") {
          return layer;
        }
        if (ancestors.has(layer.selection.layerId)) return layer;
        const nextAncestors = new Set(ancestors).add(layer.selection.layerId);
        return {
          ...layer,
          children: buildChildren(layer.selection.layerId, nextAncestors),
        };
      },
    );

  return buildChildren(null, new Set());
}

function headingLayer(section: PortfolioSection, limit: number): LayerNode {
  const children = [textLayer(section, "title", "Title", `${section.label} Title`, limit)];
  if (hasContentField(section, "subtitle")) {
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
  allSections: PortfolioSection[],
  ancestorSectionIds: Set<string>,
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
        ? [
            ...customLayerNodes(
              section,
              layer.children || [],
              allSections,
              ancestorSectionIds,
            ),
            ...nestedSectionNodes(
              section,
              allSections,
              `custom:${layer.id}`,
              ancestorSectionIds,
            ),
          ]
        : undefined,
  }));
}

function nestedSectionNodes(
  parentSection: PortfolioSection,
  allSections: PortfolioSection[],
  parentLayerId?: string,
  ancestorSectionIds: Set<string> = new Set([parentSection.id]),
): LayerNode[] {
  return allSections
    .filter(
      (section) =>
        section.parentSectionId === parentSection.id &&
        section.parentLayerId === parentLayerId &&
        !ancestorSectionIds.has(section.id),
    )
    .sort((a, b) => a.order - b.order)
    .map((section) =>
      buildSectionNode(section, allSections, ancestorSectionIds),
    );
}

function attachNativeContainerChildren(
  section: PortfolioSection,
  nodes: LayerNode[],
  customLayers: CustomLayer[],
  allSections: PortfolioSection[],
  ancestorSectionIds: Set<string>,
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
          allSections,
          ancestorSectionIds,
        ),
        ...customLayerNodes(
          section,
          assignedLayers,
          allSections,
          ancestorSectionIds,
        ),
        ...(nativeLayerId
          ? nestedSectionNodes(
              section,
              allSections,
              nativeLayerId,
              ancestorSectionIds,
            )
          : []),
      ],
    };
  });
}

export function isNativeContainerLayerId(layerId: string) {
  return [
    "navigation",
    "hero-content",
    "hero-actions",
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
