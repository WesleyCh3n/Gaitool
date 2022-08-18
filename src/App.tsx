import { useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { join, resourceDir } from "@tauri-apps/api/path";

import SideBar from "./components/SideBar";
import AnimatedRoute from "./components/AnimatedRoute";

import { useStore } from "./store";

const titleBar = (
  <div
    data-tauri-drag-region
    className="fixed top-0 right-0 h-8 bg-white select-none"
  >
    <div
      className="inline-flex justify-center items-center w-8 h-8 hover:bg-gray-300"
      onClick={() => appWindow.close()}
    >
      <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
    </div>
    <div
      className="inline-flex justify-center items-center w-8 h-8 hover:bg-gray-300"
      onClick={() => appWindow.minimize()}
    >
      <img
        src="https://api.iconify.design/mdi:window-minimize.svg"
        alt="minimize"
      />
    </div>
    <div
      className="inline-flex justify-center items-center w-8 h-8 hover:bg-gray-300"
      onClick={() => appWindow.toggleMaximize()}
    >
      <img
        src="https://api.iconify.design/mdi:window-maximize.svg"
        alt="maximize"
      />
    </div>
  </div>
);

function App() {
  const setPath = useStore((state) => state.setCfgPath);
  useEffect(() => {
    invoke("show_main_window");
    (async () => {
      let remap = await join(
        (await resourceDir()).replace("\\\\?\\", ""),
        "assets/all.csv"
      );
      let filter = await join(
        (await resourceDir()).replace("\\\\?\\", ""),
        "assets/filter.csv"
      );
      setPath({ remapCsv: remap, filterCsv: filter });
    })();
  }, []);

  return (
    <Router>
      {
        //titleBar
      }
      <div className="flex ml-16 overscroll-contain">
        <SideBar />
        <AnimatedRoute />
      </div>
    </Router>
  );
}

export default App;
