import { create } from 'zustand'

export const useFilePreview = create((set) => ({
  file: null,
  setFile: (file) => set({ file: file }),
}));
