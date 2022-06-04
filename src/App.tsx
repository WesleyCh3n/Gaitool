import { appWindow } from "@tauri-apps/api/window";
import DualChart from "./pages/DualChart";

function App() {
  return (
    <div>
      <div data-tauri-drag-region className="h-8 bg-white select-none">
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
      <DualChart />
    </div>
  );
}

export default App;
