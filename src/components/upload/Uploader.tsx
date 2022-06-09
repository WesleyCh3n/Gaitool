import type { ReactElement } from "react";
import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { message } from "@tauri-apps/api/dialog";
import { AiOutlineUpload } from "react-icons/ai";

export function Uploader(props: {
  file: string;
  setFile: (file: string) => void;
  handleFile: (file: string) => Promise<void>;
}): ReactElement | null {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openDialog = () => {
    open({
      title: "File Picker",
      filters: [
        { name: "CSV File", extensions: ["csv"] },
        { name: "All", extensions: ["*"] },
      ],
      multiple: false,
      directory: false,
    }).then((res) => {
      if (Array.isArray(res) || !res) {
        return;
      }
      props.setFile(res);
    });
  };

  async function handleSelectList() {
    if (!props.file) return;
    setIsLoading(true);
    await props.handleFile(props.file).catch(e => message(e, "Error"));
    setIsLoading(false);
  }

  return (
    <div className="grid lg:grid-cols-6 gap-4 content-center">
      <button
        className="chart-btn"
        onClick={openDialog}
      >
        {props.file ? "file: " + props.file : "Open File"}
      </button>
      <div className="col-span-1">
        <button
          className={`
            text-gray-800 dark:text-gray-400
            border-none bg-transparent
            transition-all ease-in-out
            hover:text-white hover:bg-gray-600
            dark:hover:bg-gray-600
            ${isLoading ? "loading" : ""}`}
          onClick={handleSelectList}
        >
          {isLoading ? "" : <AiOutlineUpload size={25} strokeWidth={5} />}
        </button>
      </div>
    </div>
  );
}
