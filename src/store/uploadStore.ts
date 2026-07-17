import { create } from "zustand";

type UploadState = {
  active: boolean;
  label: string;
  controller?: AbortController;
  start: (label: string, controller: AbortController) => void;
  finish: () => void;
  cancel: () => void;
};

export const useUploadStore = create<UploadState>((set, get) => ({
  active: false,
  label: "",
  controller: undefined,
  start: (label, controller) => set({ active: true, label, controller }),
  finish: () => set({ active: false, label: "", controller: undefined }),
  cancel: () => {
    get().controller?.abort();
    set({ active: false, label: "", controller: undefined });
  },
}));
