import { useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { join, resourceDir } from "@tauri-apps/api/path";

import SideBar from "./components/SideBar";
import AnimatedRoute from "./components/AnimatedRoute";
import { VscCircleFilled } from "react-icons/vsc";

import { useStore } from "./store";

const titleBar = (
  <div
    data-tauri-drag-region
    className="fixed h-8 bg-white select-none w-full flex justify-end
    dark:bg-gray-800 rounded-t-2xl"
  >
    <div
      className="inline-flex justify-center items-center w-8 h-8 text-yellow-400 hover:text-yellow-600"
      onClick={() => appWindow.minimize()}
    >
      <VscCircleFilled size={25} />
    </div>
    <div
      className="inline-flex justify-center items-center w-8 h-8 text-green-400 hover:text-green-600"
      onClick={() => appWindow.toggleMaximize()}
    >
      <VscCircleFilled size={25} />
    </div>
    <div
      className="inline-flex justify-center items-center w-8 h-8 text-red-400 hover:text-red-600"
      onClick={() => appWindow.close()}
    >
      <VscCircleFilled size={25} />
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
        titleBar
      }
      <div className="flex ml-16 overscroll-contain">
        <SideBar />
        {
          <AnimatedRoute />
        }
      </div>
    </Router>
  );
}

export default App;
