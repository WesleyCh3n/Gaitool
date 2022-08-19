import { open } from "@tauri-apps/api/dialog";

export const openDirDialog = (setDir: (dir: string) => void) => {
  open({
    title: "Choose a directory",
    filters: [],
    multiple: false,
    directory: true,
  }).then((res) => {
    if (Array.isArray(res) || !res) {
      return;
    }
    setDir(res);
  });
};
