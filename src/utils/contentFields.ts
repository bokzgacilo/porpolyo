import type {
  ContentField,
  ElementSettings,
  PortfolioContent,
  PortfolioSection,
} from "../types/portfolio";

export function createContentField<T>(
  value: T,
  style: ElementSettings = {},
): ContentField<T> {
  return { value: value ?? null, style };
}

export function contentValue<T>(
  section: PortfolioSection,
  field: string,
): T | undefined {
  return (section.content[field]?.value ?? undefined) as T | undefined;
}

export function hasContentField(section: PortfolioSection, field: string) {
  return Object.prototype.hasOwnProperty.call(section.content, field);
}

export function materializeContent(
  content: Record<string, unknown>,
): PortfolioContent {
  return Object.fromEntries(
    Object.entries(content).map(([field, value]) => [
      field,
      createContentField(value),
    ]),
  );
}
