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
    <div className="mt-3 mb-3 w-96">
      <input
        className="form-control block w-full px-3 py-1.5 text-base font-normal
          text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300
          rounded-lg transition ease-in-out m-0 focus:text-gray-700 focus:bg-white
          focus:border-blue-600 focus:outline-none shadow-md"
        type="file"
        name="file"
        title=" "
        onChange={selectOnChange}
        multiple
      />
      <div
        className="block rounded-lg shadow-md max-w-sm mt-3 border border-solid
        border-gray-300"
      >
        <div className="text-gray-700 py-1.5 px-3">
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
      </div>
      <div className="flex justify-center">
        <Button title={"Submit"} onClick={handleSelectList} />
      </div>
    </div>
  );
}
