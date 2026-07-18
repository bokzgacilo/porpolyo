import type {
  Portfolio,
  PortfolioSection,
  PortfolioTemplate,
  SectionSettings,
} from "../types/portfolio";

export interface TemplateSectionDefinition {
  key: string;
  type: PortfolioSection["type"];
  label: string;
  visible?: boolean;
  locked?: boolean;
  variant?: string;
  content?: Record<string, unknown>;
  settings?: SectionSettings;
  layerOrder?: string[];
}

export interface PortfolioTemplateDefinition extends PortfolioTemplate {
  structure: {
    settings: Portfolio["settings"];
    sections: TemplateSectionDefinition[];
  };
}
