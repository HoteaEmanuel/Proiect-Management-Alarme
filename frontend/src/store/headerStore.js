import { create } from "zustand";

export const useHeaderStore = create((set) => ({
  headerVisible: true,

  setHeaderVisible: (visible) =>
    set({ headerVisible: visible }),
}));