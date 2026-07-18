import { templateDefinitions } from "../templates";
import type { ColorPalette, PortfolioTemplate } from "../types/portfolio";

export const templates: PortfolioTemplate[] = templateDefinitions.map(
  ({ structure: _structure, ...metadata }) => metadata,
);

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
  { id: "electric-blue", name: "Black, Off-White, Electric Blue", primary: "#050505", secondary: "#f5f2e8", accent: "#2563ff", background: "#f5f2e8", surface: "#ffffff", text: "#050505", muted: "#5b5b5b", border: "#191919" },
  { id: "mono-ink", name: "Black, White, Gray", primary: "#111111", secondary: "#ffffff", accent: "#111111", background: "#ffffff", surface: "#f5f5f5", text: "#1a1a1a", muted: "#666666", border: "#dddddd" }
];
