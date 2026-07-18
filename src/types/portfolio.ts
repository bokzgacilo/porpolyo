export type SectionType =
  | "header"
  | "hero"
  | "projects"
  | "certifications"
  | "services"
  | "about"
  | "custom"
  | "footer";

export type PreviewMode = "desktop" | "tablet" | "mobile";

export interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  slot: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  shape?: "auto" | "square" | "rounded" | "circle" | "arch";
  width?: SizeValue;
  height?: SizeValue;
  aspectRatio?:
    | "auto"
    | "1 / 1"
    | "4 / 3"
    | "16 / 9"
    | "3 / 4"
    | "4 / 5"
    | "21 / 9";
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PersonalInformation {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone?: string;
  contactInfo?: string;
  location?: string;
  shortDescription: string;
  aboutDescription?: string;
  heroHeadline?: string;
  profileImage?: ImageAsset;
  socialLinks: SocialLink[];
  username: string;
}

export interface SectionSettings {
  layoutMode?: "grid" | "stack";
  gridColumns?: number;
  gridGapX?: number;
  gridGapY?: number;
  gridAlignItems?: "stretch" | "start" | "center" | "end";
  gridJustifyContent?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  stackDirection?: "row" | "column";
  stackAlign?: "stretch" | "flex-start" | "center" | "flex-end";
  stackJustify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  stackGap?: number;
  layoutWrap?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  alignment?: "left" | "center" | "right";
  spacing?: "small" | "medium" | "large";
  contentWidth?: "narrow" | "standard" | "wide";
  width?: SizeValue;
  height?: SizeValue;
  minHeight?: SizeValue;
  margin?: BoxSpacing;
  padding?: BoxSpacing;
  marginTop?: number;
  marginBottom?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingInline?: number;
  borderWidth?: number;
  borderWidths?: BoxSpacing;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: number;
  borderRadii?: BorderRadiusValues;
  templateLayerOrder?: string[];
  templateLayerParents?: Record<string, string | null>;
}

export interface BoxSpacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  unit?: SpacingUnit;
}

export interface BorderRadiusValues {
  topLeft?: number;
  topRight?: number;
  bottomRight?: number;
  bottomLeft?: number;
  unit?: SpacingUnit;
}

export type SpacingUnit = "px" | "rem" | "em" | "%" | "vw" | "vh";

export interface ElementSettings {
  layoutMode?: "grid" | "stack";
  gridColumns?: number;
  gridGapX?: number;
  gridGapY?: number;
  gridAlignItems?: SectionSettings["gridAlignItems"];
  gridJustifyContent?: SectionSettings["gridJustifyContent"];
  stackDirection?: "row" | "column";
  stackAlign?: "stretch" | "flex-start" | "center" | "flex-end";
  stackJustify?: SectionSettings["stackJustify"];
  stackGap?: number;
  layoutWrap?: boolean;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontSizeUnit?: TypographyUnit;
  fontWeight?: number;
  lineHeight?: number;
  lineHeightUnit?: TypographyUnit;
  letterSpacing?: number;
  letterSpacingUnit?: TypographyUnit;
  textAlign?: "left" | "center" | "right";
  margin?: BoxSpacing;
  padding?: BoxSpacing;
  borderWidth?: number;
  borderWidths?: BoxSpacing;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: number;
  borderRadii?: BorderRadiusValues;
  boxShadow?: string;
  width?: SizeValue;
  height?: SizeValue;
  order?: number;
  spanSection?: boolean;
  anchor?: AnchorContent;
}

export interface AnchorContent {
  id?: string;
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  label?: string;
}

export type TypographyUnit = "rem" | "em" | "px" | "%" | "ch";

export interface SizeValue {
  value?: number;
  unit: "px" | "%" | "fill";
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image?: ImageAsset;
  tags: string[];
  projectUrl?: string;
  repositoryUrl?: string;
  role?: string;
  completionDate?: string;
  featured: boolean;
}

export interface CertificationItem {
  id: string;
  name: string;
  organization: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: ImageAsset;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: ImageAsset;
  startingPrice?: string;
  ctaText: string;
  contactLink?: string;
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  parentSectionId?: string;
  parentLayerId?: string;
  label: string;
  visible: boolean;
  locked: boolean;
  order: number;
  variant?: string;
  content: PortfolioContent;
  settings: SectionSettings;
  elements?: Record<string, ElementSettings>;
  customLayers?: CustomLayer[];
}

export interface ContentField<T = unknown> {
  value: T | null;
  style: ElementSettings;
}

export type PortfolioContent = Record<string, ContentField>;

export type CustomLayerType = "div" | "text" | "image";

export interface CustomLayer {
  id: string;
  type: CustomLayerType;
  name: string;
  text?: string;
  image?: ImageAsset;
  parentLayerId?: string;
  children?: CustomLayer[];
}

export interface PortfolioSettings {
  stickyHeader: boolean;
  public: boolean;
  customDomain?: string;
  breakpointWidths?: BreakpointWidths;
  bodyLayout?: ElementSettings;
  editor?: EditorSettings;
}

export interface BreakpointWidths {
  tablet: number;
  mobile: number;
}

export type EditorPanelSize = "small" | "default" | "large";

export interface EditorSettings {
  panelSize?: EditorPanelSize;
  propertiesPanelWidth?: number;
  propertiesPanelMinWidth?: number;
  propertiesPanelMaxWidth?: number;
  alwaysOpenTour?: boolean;
  showStructureOverlay?: boolean;
  showBoxModelOverlay?: boolean;
  showStructureTab?: boolean;
  showBoxModelTab?: boolean;
}

export interface PortfolioHead {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  canonicalUrl?: string;
  favicon?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: "index,follow" | "noindex,nofollow";
}

export interface Portfolio {
  id: string;
  title: string;
  templateId: string;
  paletteId: string;
  head: PortfolioHead;
  owner: PersonalInformation;
  sections: PortfolioSection[];
  settings: PortfolioSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  supportedSections: SectionType[];
  sectionVariants: Record<string, string[]>;
  defaultPaletteId: string;
  typography: string;
  spacing: string;
  borders: string;
  cards: string;
  buttons: string;
  imageShapes: string;
}

export type SelectedElement =
  | { kind: "head" }
  | { kind: "body" }
  | { kind: "section"; sectionId: string }
  | { kind: "layer"; sectionId: string; layerId: string; label: string }
  | { kind: "text"; sectionId: string; field: string; label: string; limit: number }
  | { kind: "image"; sectionId: string; field: string; label: string; slot: string }
  | { kind: "project"; sectionId: string; itemId: string }
  | { kind: "certification"; sectionId: string; itemId: string }
  | { kind: "service"; sectionId: string; itemId: string };
