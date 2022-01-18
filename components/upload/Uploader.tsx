import type { ReactElement } from "react";
import { useState } from "react";

import { Button } from "../button/Button";
import { FilterdData, sendFile } from "../../api/filter"

export interface UploaderProps {
  handleFile: (res: FilterdData) => Promise<void>;
}

export function Uploader(props: UploaderProps): ReactElement | null {
  const [selectedFile, setSelectedFile] = useState<FileList>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setSelectedFile(e.target.files);
  };

  async function handleSelectList() {
    if (!selectedFile) return;
    setIsLoading(true);

    const result = await sendFile(selectedFile[0])
    await props.handleFile(result);
    setIsLoading(false);
  }

  return (
    <div className="grid lg:grid-cols-6 gap-4 content-center">
      <input
        className="lg:col-span-5 baseSize
          form-control block p-1 font-normal
          text-gray-700 bg-white bg-clip-padding border border-solid
          border-gray-300 rounded-lg transition ease-in-out hover:text-gray-700
          hover:bg-white hover:border-blue-600 hover:outline-none shadow-md"
        type="file"
        name="file"
        title=" "
        onChange={selectOnChange}
        // multiple
      />
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
