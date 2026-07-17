import { ColorPalette, PortfolioTemplate } from "../types/portfolio";

export const templates: PortfolioTemplate[] = [
  {
    id: "neo-brutal",
    name: "Neo-Brutalism",
    thumbnail: "Bold borders, offset shadows, loud calls to action",
    description: "High contrast, sharp blocks, expressive buttons, and structured section bands.",
    supportedSections: ["header", "hero", "projects", "certifications", "services", "about", "footer"],
    sectionVariants: {
      hero: ["Text left, image right", "Centered text", "Full-width hero"],
      projects: ["Feature first", "Three column grid"],
      about: ["Text block", "Image and bio"]
    },
    defaultPaletteId: "black-yellow",
    typography: "Heavy sans display with tight utility labels",
    spacing: "Compact bands with emphatic gutters",
    borders: "3px solid borders with offset shadows",
    cards: "Flat surfaces with hard outlines",
    buttons: "Chunky rectangular buttons",
    imageShapes: "Squares and hard-radius portraits"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    thumbnail: "Quiet typography, airy spacing, subtle dividers",
    description: "Refined whitespace, small accents, and editorial rhythm for professionals.",
    supportedSections: ["header", "hero", "projects", "certifications", "services", "about", "footer"],
    sectionVariants: {
      hero: ["Text left, image right", "Centered text", "Image left, text right"],
      projects: ["Editorial list", "Clean grid"],
      about: ["Narrow essay", "Split profile"]
    },
    defaultPaletteId: "blue-cyan",
    typography: "Modern sans with generous line height",
    spacing: "Large whitespace and narrow text measures",
    borders: "Hairline dividers",
    cards: "Low-contrast surfaces",
    buttons: "Slim rounded buttons",
    imageShapes: "Soft rounded rectangles"
  },
  {
    id: "bento",
    name: "Bento Grid",
    thumbnail: "Modular panels, dense highlights, flexible visual blocks",
    description: "A structured panel system for showing projects, services, and proof quickly.",
    supportedSections: ["header", "hero", "projects", "certifications", "services", "about", "footer"],
    sectionVariants: {
      hero: ["Bento-style hero", "Centered text", "Text left, image right"],
      projects: ["Bento feature grid", "Compact cards"],
      about: ["Stats and bio", "Profile panel"]
    },
    defaultPaletteId: "electric-blue",
    typography: "Crisp product sans with strong labels",
    spacing: "Dense modular gaps",
    borders: "Subtle radius with clear panel boundaries",
    cards: "Responsive bento cells",
    buttons: "Pill and icon-led actions",
    imageShapes: "Rounded cards and circles"
  }
];

export const palettes: ColorPalette[] = [
  { id: "black-yellow", name: "Black, White, Yellow", primary: "#111111", secondary: "#ffffff", accent: "#ffd43b", background: "#f7f3e8", surface: "#ffffff", text: "#111111", muted: "#555555", border: "#111111" },
  { id: "black-red", name: "Black, White, Red", primary: "#0d0d0d", secondary: "#ffffff", accent: "#ff3b30", background: "#fbfbfb", surface: "#ffffff", text: "#121212", muted: "#5c5c5c", border: "#171717" },
  { id: "navy-orange", name: "Navy, Cream, Orange", primary: "#102a43", secondary: "#f7efe1", accent: "#f97316", background: "#fff7ed", surface: "#fffbf3", text: "#102a43", muted: "#64748b", border: "#d6c7ad" },
  { id: "forest-brown", name: "Forest Green, Beige, Brown", primary: "#1f4d3a", secondary: "#f1ead9", accent: "#8b5e34", background: "#f8f4ea", surface: "#fffaf0", text: "#1f2a24", muted: "#6f6a5f", border: "#c7b99e" },
  { id: "purple-pink", name: "Purple, Pink, Cream", primary: "#5b21b6", secondary: "#fff7ed", accent: "#ec4899", background: "#fff7fb", surface: "#ffffff", text: "#231334", muted: "#765d86", border: "#e8d5ef" },
  { id: "blue-cyan", name: "Blue, Cyan, White", primary: "#1d4ed8", secondary: "#ffffff", accent: "#06b6d4", background: "#f8fbff", surface: "#ffffff", text: "#0f172a", muted: "#64748b", border: "#d7e3f5" },
  { id: "charcoal-lime", name: "Charcoal, Gray, Lime", primary: "#202124", secondary: "#f3f4f6", accent: "#a3e635", background: "#f5f6f2", surface: "#ffffff", text: "#202124", muted: "#62656a", border: "#d4d4d8" },
  { id: "burgundy-peach", name: "Burgundy, Peach, Cream", primary: "#7f1d1d", secondary: "#fff1e6", accent: "#fb7185", background: "#fff8f1", surface: "#fffdf8", text: "#3b1717", muted: "#8a6767", border: "#f0c9bd" },
  { id: "dark-lavender", name: "Dark Blue, Lavender, White", primary: "#172554", secondary: "#ffffff", accent: "#a78bfa", background: "#f8f7ff", surface: "#ffffff", text: "#111827", muted: "#667085", border: "#dcd7fb" },
  { id: "electric-blue", name: "Black, Off-White, Electric Blue", primary: "#050505", secondary: "#f5f2e8", accent: "#2563ff", background: "#f5f2e8", surface: "#ffffff", text: "#050505", muted: "#5b5b5b", border: "#191919" }
];
