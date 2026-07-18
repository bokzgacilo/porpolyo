import bentoDefinition from "./bento/template.json";
import blankDefinition from "./blank/template.json";
import minimalistDefinition from "./minimalist/template.json";
import neoBrutalDefinition from "./neo-brutal/template.json";
import type { PortfolioTemplateDefinition } from "./types";

export type { PortfolioTemplateDefinition, TemplateSectionDefinition } from "./types";

export const templateDefinitions = [
  blankDefinition,
  neoBrutalDefinition,
  minimalistDefinition,
  bentoDefinition,
] as unknown as PortfolioTemplateDefinition[];

export function getTemplateDefinition(templateId: string) {
  return (
    templateDefinitions.find((definition) => definition.id === templateId) ||
    templateDefinitions[0]
  );
}
