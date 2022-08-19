import { message } from "@tauri-apps/api/dialog";
import { readDir } from "@tauri-apps/api/fs";
import { join, resourceDir } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonOutline } from "../components/button/Button";
import { openDirDialog } from "../components/Dialog";

const Tool = () => {
  const [fileDir, setFileDir] = useState("");
  const [saveDir, setSaveDir] = useState("");
  const [percent, setPercent] = useState(70);

  const [msg, setMsg] = useState<
    { msg: string; key: string; success: boolean }[]
  >([]);
  const [isSpliting, setIsSplitting] = useState(false);
  const [isGenMD5, setIsGenMD5] = useState(false);

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
    var remapCsvDir = await join(
      (await resourceDir()).replace("\\\\?\\", ""),
      "assets",
    );
    const entries = await readDir(fileDir);
    for (const entry of entries) {
      let file = entry.path;
      await invoke("split_csv", { file, saveDir, percent, remapCsvDir })
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
    <div className="h-screen w-screen flex page">
      <div className="w-1/2 m-2 space-y-2 ml-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold dark:text-gray-100 mt-2 mb-2">
            Open Directory
          </h1>
          <ButtonOutline
            className="my-1"
            onClick={() => openDirDialog(setFileDir)}
            content={fileDir ? fileDir : "Open Csv Directory"}
          />
          <ButtonOutline
            className="my-1"
            onClick={() => openDirDialog(setSaveDir)}
            content={saveDir ? saveDir : "Open Save Directory"}
          />
        </div>

        <div className="flex w-full border-2 p-2 rounded-xl dark:border-gray-600">
          <h1 className="text-xl font-bold dark:text-gray-100 mb-2 w-1/3 flex items-center">
            Auto-Split Gait
          </h1>
          <div className="flex flex-col w-full pl-4">
            <div className="flex w-full">
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                step="5"
                onChange={(e) => setPercent(+e.target.value)}
                className="my-4 w-[80%] h-1 bg-gray-200 rounded-lg appearance-none
                         cursor-pointer dark:bg-gray-700"
              />
              <p className="flex w-[20%] justify-center items-center">
                {percent}
              </p>
            </div>
            <Button
              onClick={splitCsv}
              content={"Split"}
              isLoading={isSpliting}
              disabled={isSpliting}
            />
          </div>
        </div>

        <div className="flex w-full border-2 p-2 rounded-xl dark:border-gray-600">
          <h1 className="text-xl font-bold dark:text-gray-100 mb-2 w-1/3">
            Create MD5
          </h1>
          <Button
            className="ml-auto px-7"
            onClick={async () => {
              setIsGenMD5(() => true);
              await invoke("hash_file", { dir: fileDir, saveDir: saveDir });
              setIsGenMD5(() => false);
            }}
            content={"Start"}
            isLoading={isGenMD5}
          />
        </div>

        <div></div>
      </div>
      <div className="flex flex-col w-1/2 m-2">
        <h1 className="flex justify-center text-2xl font-bold dark:text-gray-100">
          Log
        </h1>
        <Log messages={msg} />
      </div>
    </div>
  );
};

const Log = (props: {
  messages: { msg: string; key: string; success: boolean }[];
}) => {
  const msgEndRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [props.messages]);
  return (
    <div className="h-full w-full bg-gray-200 dark:bg-gray-900
        rounded-lg p-3 mt-2
        overflow-y-scroll overflow-visible custom-scrollbar">
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

export default Tool;
