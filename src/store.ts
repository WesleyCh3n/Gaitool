import create from "zustand";

interface ConfigStore {
  value: number;
  cfgPath: { remapCsv: string; filterCsv: string };
  setCfgPath: (path: { remapCsv: string; filterCsv: string }) => void;
  inc: () => void;
}

export const useStore = create<ConfigStore>((set) => ({
  value: 0,
  cfgPath: { remapCsv: "", filterCsv: "" },
  setCfgPath: (path) => {
    set(() => ({
      cfgPath: { remapCsv: path.remapCsv, filterCsv: path.filterCsv },
    }));
  },
  inc: () => {
    set((state) => ({
      value: state.value + 1,
    }));
  },
}));
