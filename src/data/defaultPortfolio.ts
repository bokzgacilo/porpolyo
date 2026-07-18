import { nanoid } from "nanoid";
import { getTemplateDefinition } from "../templates";
import type {
  PersonalInformation,
  Portfolio,
  PortfolioSection,
} from "../types/portfolio";
import type { TemplateSectionDefinition } from "../templates";
import { materializeContent } from "../utils/contentFields";

const now = () => new Date().toISOString();

export function createDefaultPortfolio(
  templateId: string,
  paletteId: string,
  owner: PersonalInformation,
): Portfolio {
  const definition = getTemplateDefinition(templateId);
  const sections = definition.structure.sections.map((section, order) =>
    materializeSection(section, order, owner),
  );

  return {
    id: nanoid(),
    title: `${owner.fullName || "Untitled"} Portfolio`,
    templateId: definition.id,
    paletteId,
    head: {
      title: `${owner.fullName} - ${owner.professionalTitle}`,
      description: owner.shortDescription,
      keywords: `${owner.fullName}, ${owner.professionalTitle}, portfolio`,
      author: owner.fullName,
      canonicalUrl: "",
      favicon: "",
      ogTitle: `${owner.fullName} Portfolio`,
      ogDescription: owner.shortDescription,
      ogImage: owner.profileImage?.url || "",
      twitterTitle: `${owner.fullName} Portfolio`,
      twitterDescription: owner.shortDescription,
      twitterImage: owner.profileImage?.url || "",
      robots: "index,follow",
    },
    owner,
    sections,
    settings: structuredClone(definition.structure.settings),
    createdAt: now(),
    updatedAt: now(),
  };
}

function materializeSection(
  definition: TemplateSectionDefinition,
  order: number,
  owner: PersonalInformation,
): PortfolioSection {
  const id = nanoid();
  const rawContent = hydrateTemplateValue(
    definition.content || {},
    templateContext(owner),
  ) as Record<string, unknown>;
  const items = Array.isArray(rawContent.items)
    ? rawContent.items.map((item) => ({
        ...(item as Record<string, unknown>),
        id: nanoid(),
      }))
    : undefined;
  const content = materializeContent(
    items ? { ...rawContent, items } : rawContent,
  );

  return {
    id,
    type: definition.type,
    label: definition.label,
    visible: definition.visible ?? true,
    locked: definition.locked ?? false,
    order,
    variant: definition.variant,
    content,
    settings: {
      ...(definition.settings || {}),
      templateLayerOrder: definition.layerOrder?.map((layerKey) =>
        templateTreeNodeId(id, layerKey),
      ),
    },
    customLayers: definition.type === "custom" ? [] : undefined,
  };
}

function templateTreeNodeId(sectionId: string, layerKey: string) {
  if (layerKey.startsWith("image:")) {
    return `${sectionId}-image-${layerKey.slice("image:".length)}`;
  }
  if (layerKey.startsWith("text:")) {
    return `${sectionId}-text-${layerKey.slice("text:".length)}`;
  }
  return `${sectionId}-${layerKey}`;
}

function templateContext(owner: PersonalInformation) {
  return {
    owner: {
      ...owner,
      professionalTitleLower: owner.professionalTitle.toLowerCase(),
    },
    heroHeadline:
      owner.heroHeadline || `${owner.fullName} builds thoughtful digital work.`,
    aboutDescription: owner.aboutDescription || owner.shortDescription,
    year: String(new Date().getFullYear()),
  };
}

function hydrateTemplateValue(value: unknown, context: Record<string, unknown>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => hydrateTemplateValue(item, context));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        hydrateTemplateValue(item, context),
      ]),
    );
  }
  if (typeof value !== "string") return value;

  const exactToken = value.match(/^\{\{([^}]+)\}\}$/);
  if (exactToken) return valueAtPath(context, exactToken[1]);

  return value.replace(/\{\{([^}]+)\}\}/g, (_match, path: string) => {
    const replacement = valueAtPath(context, path);
    return replacement == null ? "" : String(replacement);
  });
}

function valueAtPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}
