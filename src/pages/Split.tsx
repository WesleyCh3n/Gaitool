import { open, message } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { useState } from "react";
import { Button, ButtonOutline } from "../components/button/Button";

function Split() {
  const [fileDir, setFileDir] = useState("");
  const [saveDir, setSaveDir] = useState("");
  const [percent, setPercent] = useState(70);
  const [loading, setloading] = useState(false);

  const openDialog = (setDir: (dir: string) => void) => {
    open({
      title: "Choose a directory",
      filters: [],
      multiple: false,
      directory: true,
    }).then((res) => {
      if (Array.isArray(res) || !res) {
        return;
      }
      setDir(res);
    });
  };

  const splitCsv = async () => {
    setloading(true);
    await invoke("split_csv", { fileDir, saveDir, percent }).catch((e) =>
      message(e));
    setloading(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 dark:bg-gray-800">
      <ButtonOutline
        className="my-1"
        onClick={() => openDialog(setFileDir)}
        content={fileDir ? fileDir : "Open Csv Directory"}
      />
      <ButtonOutline
        className="my-1"
        onClick={() => openDialog(setSaveDir)}
        content={saveDir ? saveDir : "Open Save Directory"}
      />
      <div className="flex">
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="70"
          step="5"
          onChange={(e) => setPercent(+e.target.value)}
          className="my-4 min-w-[80vw] h-2 bg-gray-200 rounded-lg appearance-none
        cursor-pointer dark:bg-gray-700"
        />
        <p className="flex w-full justify-center items-center">{percent}</p>
      </div>
      <Button
        className="my-1"
        onClick={splitCsv}
        content={"Split"}
        isLoading={loading}
      />
    </div>
  );
}

export default Split;
