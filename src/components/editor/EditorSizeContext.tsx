import { createContext, useContext, type ReactNode } from "react";
import type { EditorPanelSize } from "../../types/portfolio";

export type EditorControlSize = "xs" | "sm" | "md";

const EditorControlSizeContext = createContext<EditorControlSize>("sm");

export function EditorControlSizeProvider({
  panelSize,
  children,
}: {
  panelSize: EditorPanelSize;
  children: ReactNode;
}) {
  return (
    <EditorControlSizeContext.Provider value={editorControlSize(panelSize)}>
      {children}
    </EditorControlSizeContext.Provider>
  );
}

export function useEditorControlSize() {
  return useContext(EditorControlSizeContext);
}

export function editorControlSize(
  panelSize: EditorPanelSize,
): EditorControlSize {
  if (panelSize === "small") return "xs";
  if (panelSize === "large") return "md";
  return "sm";
}
