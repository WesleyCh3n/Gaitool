import { Route, Routes, HashRouter } from "react-router-dom";
import { appWindow } from "@tauri-apps/api/window";

import DualChart from "./pages/DualChart";
import SideBar from "./components/SideBar";
import Home from "./pages/Home";
import Split from "./pages/Split";
import Setting from "./pages/Setting";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const titleBar = (
  <div data-tauri-drag-region className="fixed top-0 right-0 h-8 bg-white select-none">
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
  useEffect(() => {
    invoke('show_main_window');
  }, [])
  return (
    <HashRouter>
      <div className="flex ml-16 overscroll-contain">
        <SideBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart" element={<DualChart />} />
          <Route path="/split" element={<Split />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
