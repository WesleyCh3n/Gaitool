import { MouseEventHandler } from "react";
import { ButtonOutline } from "../components/button/Button";
import { open } from "@tauri-apps/api/dialog";
import { useStore } from "../store";

const Setting = () => {
  const cfgPath = useStore((state) => state.cfgPath);
  const setCfgPath = useStore((state) => state.setCfgPath);

  return (
    <div className="h-screen w-screen flex flex-col p-4 dark:bg-gray-800">
      <div
        className="flex flex-col h-full w-full bg-gray-200 dark:bg-gray-700
        rounded-lg p-4 gap-4"
      >
        <h1 className="text-xl font-bold dark:text-gray-100">CSV Config</h1>
        <PathItem
          title={"Remap CSV"}
          content={cfgPath.remapCsv}
          f={() => {
            open({
              title: "Select File",
              filters: [],
              multiple: false,
              directory: false,
            }).then((res) => { if (Array.isArray(res) || !res) {
                return;
              }
              setCfgPath({ ...cfgPath, remapCsv: res });
            });
          }}
        />
        <PathItem
          title={"Filter CSV"}
          content={cfgPath.filterCsv}
          f={() => {
            open({
              title: "Select File",
              filters: [],
              multiple: false,
              directory: false,
            }).then((res) => {
              if (Array.isArray(res) || !res) {
                return;
              }
              setCfgPath({ ...cfgPath, filterCsv: res });
            });
          }}
        />
      </div>
    </div>
  );
};

const PathItem = (props: {
  title: string;
  content: string;
  f: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <div className="flex">
      <div className="flex-grow">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-500">
            {props.title}
          </span>
          <span className="text-lg whitespace-nowrap dark:text-gray-400">{props.content}</span>
        </div>
      </div>
      <ButtonOutline content="Modify" onClick={props.f} />
    </div>
  );
};

export default Setting;
