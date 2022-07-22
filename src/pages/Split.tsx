import { open, message } from "@tauri-apps/api/dialog";
import { readDir } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { useState, useRef, useEffect } from "react";
import { Button, ButtonOutline } from "../components/button/Button";
import { useStore } from "../store";

function Split() {
  const cfgPath = useStore((state) => state.cfgPath);
  const [fileDir, setFileDir] = useState("");
  const [saveDir, setSaveDir] = useState("");
  const [percent, setPercent] = useState(70);

  const [msg, setMsg] = useState<
    { msg: string; key: string; success: boolean }[]
  >([]);
  const [isSpliting, setIsSplitting] = useState(false);

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
    if (fileDir == "") {
      message("input dir cannot be empty");
      return;
    }
    if (saveDir == "") {
      message("save dir cannot be empty");
      return;
    }

    setIsSplitting(() => true);
    setMsg((m) => [
      ...m,
      {
        msg: `Start Spliting ${fileDir} to ${saveDir}`,
        key: `${new Date().getTime()}`,
        success: true,
      },
    ]);
    var remapCsv = cfgPath.remapCsv;
    const entries = await readDir(fileDir);
    for (const entry of entries) {
      let file = entry.path;
      await invoke("split_csv", { file, saveDir, percent, remapCsv })
        .then(() => {
          setMsg((m) => [
            ...m,
            {
              msg: `${file}: Success`,
              key: `${new Date().getTime()} ${file}`,
              success: true,
            },
          ]);
        })
        .catch((e) => {
          setMsg((m) => [
            ...m,
            {
              msg: `${file}: ${e}`,
              key: `${new Date().getTime()} ${file}`,
              success: false,
            },
          ]);
        });
    }
    setIsSplitting(false);
    setMsg((m) => [
      ...m,
      {
        msg: `Finished`,
        key: `${new Date().getTime()}`,
        success: true,
      },
    ]);
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
        isLoading={isSpliting}
        disabled={isSpliting}
      />
      <Log messages={msg} />
    </div>
  );
}

const Log = (props: {
  messages: { msg: string; key: string; success: boolean }[];
}) => {
  const msgEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.messages]);
  return (
    <div
      className="h-full w-full bg-gray-200 dark:bg-gray-900 rounded-lg p-3 mt-2
        overflow-y-scroll overflow-visible custom-scrollbar"
    >
      {props.messages.map((msg) => (
        <div
          key={msg.key}
          className={`${msg.success ? "text-gray-400" : "text-red-500"
            } text-sm`}
        >
          {msg.msg}
        </div>
      ))}
      <div ref={msgEndRef} />
    </div>
  );
};

export default Split;
