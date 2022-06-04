import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import type { ChangeEvent, RefObject } from "react";
import * as d3 from "d3";

import {
  // Interface
  IDatasetInfo,
  ICycleList,
  IDataSPos,
  IData,
  // Create chart
  createLineChart,
  createGaitNav,
  createBoxChart,
  // Utility
  parseResult,
  parseCycle,
} from "../components/chart";

import {
  cycleMax,
  cycleMin,
  cycleDuration,
  selLineRange,
} from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";
import { Table, IRow } from "../components/table/Table";
import { postRange } from "../api/exporter";
import { findIndex } from "../utils/utils";
import { ResUpload } from "../models/response_models";
import { col_schema } from "../models/column_schema";

import { invoke } from "@tauri-apps/api/tauri";
import { copyFile, readTextFile, removeFile } from "@tauri-apps/api/fs";
import { join, appDir, homeDir } from "@tauri-apps/api/path";
import { save, message } from "@tauri-apps/api/dialog";

const position = Object.keys(col_schema);
const content = ["Accel X", "Accel Y", "Accel Z", "Gyro X", "Gyro Y", "Gyro Z"];
const refKey = ["line", "bmax", "bmin", "lnav", "bclt", "bcrt", "bcdb", "bcgt"];

const AppDir = await appDir();
const DataDir = "data";
const FilterDir = "filter";
const ExportDir = "export";
const SwriteDir = "swrite";

export interface ChartProps {}

const Chart = forwardRef((_props: ChartProps, ref) => {
  const dataSInit: IDataSPos = {};
  position.forEach((p) => {
    dataSInit[p] = JSON.parse(JSON.stringify((col_schema as any)[p])); // HACK: deep copy
  });

  const refs: { [k: string]: RefObject<SVGSVGElement> } = {};
  refKey.forEach((k) => {
    refs[k] = useRef<SVGSVGElement>(null);
  });
  const [dataS, setDataS] = useState<IDataSPos>(dataSInit);
  const [cyS, setCyS] = useState<ICycleList>({
    gait: { step: [[]], sel: [0, 0] },
    lt: { step: [[]], sel: [0, 0] },
    rt: { step: [[]], sel: [0, 0] },
    db: { step: [[]], sel: [0, 0] },
  });
  const [resUpld, setResUpld] = useState<ResUpload>();
  const [updators] = useState<{ [key: string]: Function }>({
    _: new Function(),
  });

  const [selPos, setSelPos] = useState<string>(position[0]);
  const [selOpt, setSelOpt] = useState<string>(content[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);
  const [trContent, setTrContent] = useState<IRow[]>([]);
  const [inputFile, setInputFile] = useState<string>("");

  useEffect(() => {
    // setup chart manually when component mount
    updators.line = createLineChart(refs.line);
    updators.bmax = createBoxChart(refs.bmax);
    updators.bmin = createBoxChart(refs.bmin);
    updators.bcgt = createBoxChart(refs.bcgt);
    updators.bclt = createBoxChart(refs.bclt);
    updators.bcrt = createBoxChart(refs.bcrt);
    updators.bcdb = createBoxChart(refs.bcdb);
    updators.lnav = createGaitNav(refs.lnav);

    // DEBUG:
    if (0) {
      const csvs = [
        "./result.csv",
        "./cygt.csv",
        "./cylt.csv",
        "./cyrt.csv",
        "./cydb.csv",
      ];
      Promise.all(csvs.map((file) => d3.csv(file))).then(
        ([csvResult, csvGaitCycle, csvLtCycle, csvRtCycle, csvDbCycle]) => {
          setDataS(parseResult(csvResult, dataS));
          cyS.gait = parseCycle(csvGaitCycle);
          cyS.lt = parseCycle(csvLtCycle);
          cyS.rt = parseCycle(csvRtCycle);
          cyS.db = parseCycle(csvDbCycle);
          updateApp(dataS[selPos][selOpt], cyS);
          trInit([
            { Start: 3.99, End: 8.545 },
            { Start: 10.21, End: 14.645 },
            { Start: 20.905, End: 25.29 },
            { Start: 28.525, End: 32.825 },
          ]);
          setSelDisable(false);
        }
      );
    }
  }, []);

  /* Create chart when upload api response FilterdData*/
  async function initChart(file: string) {
    var saveDir = await join(AppDir, DataDir, FilterDir);
    const result = (await invoke("filter_csv", { file, saveDir })) as any;

    console.log(result);
    setResUpld(result); // TODO: what is this for?

    const result_path = await join(saveDir, result["FltrFile"]["rslt"]);
    const gt_path = await join(saveDir, result["FltrFile"]["cyGt"]);
    const lt_path = await join(saveDir, result["FltrFile"]["cyLt"]);
    const rt_path = await join(saveDir, result["FltrFile"]["cyRt"]);
    const db_path = await join(saveDir, result["FltrFile"]["cyDb"]);

    return Promise.all([
      readTextFile(result_path),
      readTextFile(gt_path),
      readTextFile(lt_path),
      readTextFile(rt_path),
      readTextFile(db_path),
    ]).then(([resultRawStr, gtRawStr, ltRawStr, rtRawStr, dbRawStr]) => {
      setDataS(parseResult(d3.csvParse(resultRawStr), dataS));
      cyS.gait = parseCycle(d3.csvParse(gtRawStr));
      cyS.lt = parseCycle(d3.csvParse(ltRawStr));
      cyS.rt = parseCycle(d3.csvParse(rtRawStr));
      cyS.db = parseCycle(d3.csvParse(dbRawStr));
      updateApp(dataS[selPos][selOpt], cyS, [
        0,
        cyS["gait"]["step"].length - 1,
      ]);
      trInit(result["Range"]);
      setSelDisable(false);
    });
  }

  /* Export result */
  const exportResult = async () => {
    let ranges = trContent.map((row) => {
      return [row.range[0], row.range[1]];
    });
    if (ranges.length == 0 || !resUpld) return;

    const saveDir = await join(AppDir, DataDir, ExportDir);
    const file = await join(
      AppDir,
      DataDir,
      FilterDir,
      resUpld["FltrFile"]["rslt"]
    );
    const result = (await invoke("export_csv", {
      file,
      saveDir,
      ranges,
    }).catch() as any); // TODO: ???
    const tmp = await join(saveDir, result["ExportFile"]);
    const output = await join(await homeDir(), result["ExportFile"]);
    save({ title: "Save Export File", defaultPath: output }).then(
      async (path) => {
        if (Array.isArray(path) || !path) {
          return;
        }
        await copyFile(tmp, path);
        await removeFile(tmp);
        await message("Done!");
      }
    );
  };

  const saveSelection = async () => {
    let rangesValue = trContent
      .map((row) => {
        return row.range.map((i) => cyS.gait.step[i][0]).join("-");
      })
      .join(" ");
    if (!resUpld) return;
    const saveDir = await join(AppDir, DataDir, SwriteDir);
    const file = inputFile;
    const result = (await invoke("swrite_csv", {
      file,
      saveDir,
      rangesValue,
    })) as any;
    const tmp = await join(saveDir, result["CleanFile"]);
    const output = await join(await homeDir(), result["CleanFile"]);
    save({ title: "Save Swrite File", defaultPath: output }).then(
      async (path) => {
        if (Array.isArray(path) || !path) {
          return;
        }
        await copyFile(tmp, path);
        await removeFile(tmp);
      }
    );
  };

  /* Update all chart logic */
  const updateLogic = (d: IData[], c: ICycleList) => {
    // preprocess/filter data
    let lineD = selLineRange(d, c.gait);
    let lineRange = d3.extent(lineD, (d) => d.x).map((x) => x ?? 0);

    // input data to update fig
    updators.line(d, lineRange);
    updators.bmax(cycleMax(d, c.gait));
    updators.bmin(cycleMin(d, c.gait));
    updators.bcgt(cycleDuration(c.gait));
    updators.bclt(cycleDuration(c.lt));
    updators.bcrt(cycleDuration(c.rt));
    updators.bcdb(cycleDuration(c.db));
  };

  /* Update App include navigator */
  const updateApp = (
    schema: IDatasetInfo,
    c: ICycleList,
    sel_range?: [number, number]
  ) => {
    updateLogic(schema.data, c);
    updators.lnav(updateLogic, schema.data, c, sel_range);
    setCyS(c);
  };

  /* Selected option chanage */
  const selOptChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[selPos][e.target.value], cyS);
    setSelOpt(e.target.value);
  };
  const selPosChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[e.target.value][selOpt], cyS);
    setSelPos(e.target.value);
  };

  const trInit = (ranges: any[]) => {
    // TODO: ranges strange type OAO
    let trRows: IRow[] = [];
    for (let range of ranges) {
      let cycle = {
        gait: [0, 0] as [number, number],
        lt: [0, 0] as [number, number],
        rt: [0, 0] as [number, number],
        db: [0, 0] as [number, number],
      };
      let selValue = (Object.values(range) as number[]).sort((a, b) => a - b);
      ["gait", "lt", "rt", "db"].forEach((k) => {
        (cycle as any)[k] = selValue.map((x) =>
          findIndex(
            cyS[k].step.map((s) => s[0]),
            x
          )
        );
      });
      trRows.push({
        range: cycle.gait,
        gt:
          d3
            .median(cycleDuration({ step: cyS.gait.step, sel: cycle.gait }))
            ?.toFixed(2) ?? 0,
        lt:
          d3
            .median(cycleDuration({ step: cyS.lt.step, sel: cycle.lt }))
            ?.toFixed(2) ?? 0,
        rt:
          d3
            .median(cycleDuration({ step: cyS.rt.step, sel: cycle.rt }))
            ?.toFixed(2) ?? 0,
        db:
          d3
            .median(cycleDuration({ step: cyS.db.step, sel: cycle.db }))
            ?.toFixed(2) ?? 0,
        cycle: { ...cyS },
        id: `${cycle.gait}`,
      });
    }
    setTrContent(trRows);
  };

  /* Add tabel row */
  const addTrNode = () => {
    // check if id exist
    let result = trContent.filter((d) => d.id === `${cyS.gait.sel}`);
    if (result.length > 0) return;
    setTrContent([
      ...trContent,
      {
        range: cyS.gait.sel,
        gt: d3.median(cycleDuration(cyS.gait))?.toFixed(2) ?? 0,
        lt: d3.median(cycleDuration(cyS.lt))?.toFixed(2) ?? 0,
        rt: d3.median(cycleDuration(cyS.rt))?.toFixed(2) ?? 0,
        db: d3.median(cycleDuration(cyS.db))?.toFixed(2) ?? 0,
        cycle: { ...cyS },
        id: `${cyS.gait.sel}`,
      },
    ]);
  };

  /* Remove a tabel row */
  const removeTrNode = (id: string) => {
    setTrContent(trContent.filter((d) => d.id !== id));
  };

  /* Remove all tabel rows */
  const removeAllTrNode = () => {
    setTrContent([]);
  };

  /* Show selected row view */
  const showSel = (range: [number, number]) => {
    updators.lnav(updateLogic, dataS[selPos][selOpt].data, cyS, range);
  };

  /**
   * HACK: pass function upward to parent
   */
  useImperativeHandle(ref, () => ({
    isSel() {
      return trContent.length !== 0;
    },
    async getExportCSV() {
      let ranges = trContent.map((row) => {
        return { Start: row.range[0], End: row.range[1] };
      });
      if (ranges.length == 0 || !resUpld) return;
      let res = await postRange(resUpld.python.FltrFile, ranges);
      return res;
    },
  }));

  return (
    <div className="normalBox w-full">
      <div className="flex justify-center m-2">
        <Uploader
          handleFile={initChart}
          file={inputFile}
          setFile={setInputFile}
        />
      </div>

      <div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6
        gap-1 space-y-1 m-2"
      >
        {[
          { title: "Max", ref: refs.bmax },
          { title: "Min", ref: refs.bmin },
          { title: "GAIT", ref: refs.bcgt },
          { title: "LT support", ref: refs.bclt },
          { title: "RT support", ref: refs.bcrt },
          { title: "DB support", ref: refs.bcdb },
        ].map((d) => (
          <div className="col-span-1 lg:col-span-1 normalBox" key={d.title}>
            <h1>{d.title}</h1>
            <svg ref={d.ref}></svg>
          </div>
        ))}
        <div className="normalBox col-span-2 md:col-span-3 lg:col-span-6">
          <h1>Accelration</h1>
          <svg ref={refs.line}></svg>
          <svg className="mt-4" ref={refs.lnav}></svg>
        </div>

        <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-2">
          <Selector
            options={position}
            selectedOption={selPos}
            onChange={selPosChange}
            disable={selDisable}
          />
        </div>
        <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-2">
          <Selector
            options={content}
            selectedOption={selOpt}
            onChange={selOptChange}
            disable={selDisable}
          />
        </div>
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <button
            className={`btn-outline w-full ${selDisable ? "btn-disabled" : ""}`}
            onClick={addTrNode}
          >
            Select
          </button>
        </div>
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <button
            className={`btn-outline w-full ${selDisable ? "btn-disabled" : ""}`}
            onClick={() => exportResult()}
          >
            Export
          </button>
        </div>

        <div className="col-span-2 overflow-x-auto no-scrollbar md:col-span-3 lg:col-span-6">
          <Table
            content={trContent}
            removeNode={removeTrNode}
            removeAll={removeAllTrNode}
            updateView={showSel}
          />
        </div>
        <div className="flex justify-end col-span-2 md:col-span-3 lg:col-span-6">
          <a
            // href="#save-modal"
            className={`btn btn-sm w-full lg:w-fit ${
              selDisable ? "btn-disabled" : ""
            }`}
            onClick={() => saveSelection()}
          >
            Save
          </a>
        </div>
      </div>

      <div id="save-modal" className="modal">
        <div className="modal-box">
          <p>Selection Saved</p>
          <div className="modal-action">
            <a href="#" className="btn btn-sm">
              OK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Chart;
