import {
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  Home,
  PanelLeft,
  User,
  Wrench,
} from "lucide-react";
import {
  CertificationItem,
  PortfolioSection,
  ProjectItem,
  SectionType,
  SelectedElement,
  ServiceItem,
} from "../../types/portfolio";

export const sectionIcons: Record<SectionType, React.ElementType> = {
  header: Home,
  hero: User,
  projects: BriefcaseBusiness,
  certifications: BadgeCheck,
  services: Wrench,
  about: FileText,
  footer: PanelLeft,
};

export type LayerNode = {
  id: string;
  label: string;
  selection: SelectedElement;
  removable: boolean;
  sortable?: boolean;
  children?: LayerNode[];
};

export function layerNames(type: SectionType) {
  const layers: Record<SectionType, string[]> = {
    header: ["Logo", "Navigation", "Contact button"],
    hero: [
      "Eyebrow text",
      "Headline",
      "Description",
      "Primary button",
      "Secondary button",
      "Hero image",
    ],
    projects: ["Section heading", "Project grid", "Project cards"],
    certifications: ["Section heading", "Certification list"],
    services: ["Section heading", "Service cards"],
    about: ["Heading", "Long-form description", "Skills", "Profile image"],
    footer: ["Logo", "Social links", "Copyright text"],
  };
  return layers[type];
}

export function getLayerSelection(
  section: PortfolioSection,
  layer: string,
): SelectedElement {
  const layerMap: Record<string, SelectedElement> = {
    Logo: { kind: "text", sectionId: section.id, field: "logoText", label: "Header Logo", limit: 60 },
    Navigation: { kind: "layer", sectionId: section.id, layerId: "navigation", label: "Navigation" },
    "Contact button": { kind: "text", sectionId: section.id, field: "contactButton", label: "Contact Button", limit: 40 },
    "Eyebrow text": { kind: "text", sectionId: section.id, field: "eyebrow", label: "Hero Eyebrow", limit: 80 },
    Headline: { kind: "text", sectionId: section.id, field: "headline", label: "Hero Headline", limit: 120 },
    Description: { kind: "text", sectionId: section.id, field: "description", label: `${section.label} Description`, limit: section.type === "about" ? 1000 : 250 },
    "Primary button": { kind: "text", sectionId: section.id, field: "primaryCta", label: "Primary Button", limit: 40 },
    "Secondary button": { kind: "text", sectionId: section.id, field: "secondaryCta", label: "Secondary Button", limit: 40 },
    "Hero image": { kind: "image", sectionId: section.id, field: "image", label: "Hero Image", slot: "hero-image" },
    "Section heading": { kind: "text", sectionId: section.id, field: "title", label: `${section.label} Title`, limit: 100 },
    "Project grid": { kind: "layer", sectionId: section.id, layerId: "project-grid", label: "Project Grid" },
    "Project cards": { kind: "layer", sectionId: section.id, layerId: "project-grid", label: "Project Cards" },
    "Certification list": { kind: "layer", sectionId: section.id, layerId: "certification-list", label: "Certification List" },
    "Service cards": { kind: "layer", sectionId: section.id, layerId: "service-cards", label: "Service Cards" },
    Heading: { kind: "text", sectionId: section.id, field: "title", label: `${section.label} Heading`, limit: 80 },
    "Long-form description": { kind: "text", sectionId: section.id, field: "description", label: "About Description", limit: 1000 },
    Skills: { kind: "layer", sectionId: section.id, layerId: "about-content", label: "Skills" },
    "Profile image": { kind: "image", sectionId: section.id, field: "profileImage", label: "Profile Image", slot: "profile-image" },
    "Copyright text": { kind: "text", sectionId: section.id, field: "copyright", label: "Copyright Text", limit: 120 },
    "Social links": { kind: "layer", sectionId: section.id, layerId: "social-links", label: "Social Links" },
  };
  return layerMap[layer] || { kind: "section", sectionId: section.id };
}

export function getSectionLayers(section: PortfolioSection): LayerNode[] {
  if (section.type === "projects") {
    const projects = (section.content.items || []) as ProjectItem[];
    return [
      { id: `${section.id}-heading`, label: "Section heading", selection: { kind: "text", sectionId: section.id, field: "title", label: "Projects Section Heading", limit: 80 }, removable: false },
      { id: `${section.id}-subheading`, label: "Section subheading", selection: { kind: "text", sectionId: section.id, field: "subtitle", label: "Projects Section Subheading", limit: 250 }, removable: false },
      {
        id: `${section.id}-list`,
        label: "Projects list",
        selection: { kind: "layer", sectionId: section.id, layerId: "project-grid", label: "Projects List" },
        removable: false,
        children: projects.map((project, index) => ({
          id: project.id,
          label: project.title || `Project card ${index + 1}`,
          selection: { kind: "project", sectionId: section.id, itemId: project.id } as SelectedElement,
          removable: true,
          sortable: true,
          children: [
            childLayer(project.id, "image", "Project image", `${project.title || `Project ${index + 1}`} Image`, section.id),
            childLayer(project.id, "title", "Title", `${project.title || `Project ${index + 1}`} Title`, section.id),
            childLayer(project.id, "description", "Description", `${project.title || `Project ${index + 1}`} Description`, section.id),
            childLayer(project.id, "tags", "Tags", `${project.title || `Project ${index + 1}`} Tags`, section.id),
            childLayer(project.id, "cta", "CTA", `${project.title || `Project ${index + 1}`} CTA`, section.id),
          ],
        })),
      },
    ];
  }

  const baseLayers = layerNames(section.type).map((layer) => ({
    id: `${section.id}-${layer}`,
    label: layer,
    selection: getLayerSelection(section, layer),
    removable: false,
  }));

  if (section.type === "certifications") {
    const certifications = (section.content.items || []) as CertificationItem[];
    return [
      ...baseLayers,
      ...certifications.map((certification, index) => ({
        id: certification.id,
        label: certification.name || `Certification ${index + 1}`,
        selection: { kind: "certification", sectionId: section.id, itemId: certification.id } as SelectedElement,
        removable: true,
      })),
      ...certifications.map((certification, index) => ({
        id: `${certification.id}-image`,
        label: `${certification.name || `Certification ${index + 1}`} image`,
        selection: { kind: "layer", sectionId: section.id, layerId: `certification:${certification.id}:image`, label: `${certification.name || `Certification ${index + 1}`} Image` } as SelectedElement,
        removable: false,
      })),
    ];
  }

  if (section.type === "services") {
    const services = (section.content.items || []) as ServiceItem[];
    return [
      ...baseLayers,
      ...services.map((service, index) => ({
        id: service.id,
        label: service.title || `Service card ${index + 1}`,
        selection: { kind: "service", sectionId: section.id, itemId: service.id } as SelectedElement,
        removable: true,
      })),
      ...services.map((service, index) => ({
        id: `${service.id}-icon`,
        label: `${service.title || `Service ${index + 1}`} icon/image`,
        selection: { kind: "layer", sectionId: section.id, layerId: `service:${service.id}:icon`, label: `${service.title || `Service ${index + 1}`} Icon/Image` } as SelectedElement,
        removable: false,
      })),
    ];
  }

  return baseLayers;
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
