import type { ReactElement } from "react";
import { useState } from "react";

import { Button } from "../button/Button";
import { open } from "@tauri-apps/api/dialog";

export function Uploader(props: {
  file: string,
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
    // if (!selectedFile) return;
    if (!props.file) return;
    setIsLoading(true);

    await props.handleFile(props.file);

    // const result = await sendFile(selectedFile[0])
    // await props.handleFile(result);
    setIsLoading(false);
  }

  return (
    <div className="grid lg:grid-cols-6 gap-4 content-center">
      <button
        className="lg:col-span-5 baseSize
          form-control block p-1 font-normal normal-case
          text-gray-700 bg-white bg-clip-padding border border-solid
          border-gray-300 rounded-lg transition ease-in-out hover:text-gray-700
          hover:bg-white hover:border-blue-600 hover:outline-none shadow-md"
        title=" "
        onClick={openDialog}
        // onChange={selectOnChange}
        // multiple
      >
        {props.file ? "file: " + props.file : "Open File"}
      </button>
      <div className="col-span-1 flex items-center justify-center">
        <Button
          title={"Upload"}
          onClick={handleSelectList}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
