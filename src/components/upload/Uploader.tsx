import type { ReactElement } from "react";
import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { message } from "@tauri-apps/api/dialog";
import { AiOutlineUpload } from "react-icons/ai";
import { Button } from "../button/Button";

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
    await props.handleFile(props.file).catch((e) => message(e, "Error"));
    setIsLoading(false);
  }

  return (
    <div className="grid lg:grid-cols-6 gap-2 mx-2 w-full">
      <Button
        className="col-span-5 whitespace-nowrap overflow-x-auto no-scrollbar"
        onClick={openDialog}
        content={props.file ? "file: " + props.file : "Open File"}
      />
      <Button
        className={`col-span-1 border-none bg-transparent shadow-none
         dark:bg-transparent text-gray-800 dark:text-gray-400
         ${
           isLoading
             ? "dark:hover:bg-transparent hover:bg-transparent cursor-default"
             : ""
         }`}
        onClick={handleSelectList}
        content={<AiOutlineUpload size={25} strokeWidth={5} />}
        isLoading={isLoading}
      />
    </div>
  );
}
