import type { ReactElement } from "react";
import { useState } from "react";

import { Button } from "../button/Button";
import { open } from "@tauri-apps/api/dialog";

export interface UploaderProps {
  // handleFile: (res: ResData) => Promise<void>;
  handleFile: (file: string) => Promise<void>;
}

export function Uploader(props: UploaderProps): ReactElement | null {
  // const [selectedFile, setSelectedFile] = useState<FileList>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<string>('')

  /* const selectOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setSelectedFile(e.target.files);
  }; */

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
      setFile(res)
    });
  };

  async function handleSelectList() {
    // if (!selectedFile) return;
    if (!file) return;
    setIsLoading(true);

    await props.handleFile(file);

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
        {file ? "file: " + file : "Open File"}
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
