import type { ReactElement } from "react";
import { useState } from "react";

import { PrintFileInfo } from "./PrintFileInfo";
import { Button } from "../button/Button"

export interface UploaderProps {
  handleFile: (f: File) => void;
}

export function Uploader(props: UploaderProps): ReactElement | null {
  const [selectedFile, setSelectedFile] = useState<FileList>();
  const [isSelected, setIsSelected] = useState(false);

  const selectOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setSelectedFile(e.target.files);
    setIsSelected(true);
  };

  const handleSelectList = () => {
    if (!selectedFile) return;

    Array.from(selectedFile).forEach((file) => {
      props.handleFile(file)
    });
  }


  return (
    <div className="grid grid-cols-7 h-20 ml-4 gap-4 content-center">
      <input
        className="col-span-3
          form-control block w-full p-2 text-base font-normal
          text-gray-700 bg-white bg-clip-padding border border-solid
          border-gray-300 rounded-lg transition ease-in-out hover:text-gray-700
          hover:bg-white hover:border-blue-600 hover:outline-none shadow-md"
        type="file"
        name="file"
        title=" "
        onChange={selectOnChange}
        // multiple
      />
      <div
        className="col-span-3
          block rounded-lg shadow-md max-w-sm border
          border-solid border-gray-300 text-gray-700 p-3"
      >
        {isSelected ? (
          selectedFile ? (
            Array.from(selectedFile).map((file, i) => (
              <PrintFileInfo file={file} index={i + 1} key={file.name} />
            ))
          ) : (
            <p></p>
          )
        ) : (
          <p className="text-center">Select a file to show details</p>
        )}
      </div>
      <div className="col-span-1 flex items-center">
        <Button title={"Submit"} onClick={handleSelectList} />
      </div>
    </div>
  );
}
