import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import type { ChangeEvent, RefObject, ForwardedRef } from "react";
import * as d3 from "d3";

import {
  createLineChart,
  createGaitNav,
  createBoxChart,
  parseResult,
  parseCycle,
} from "../components/chart";
import type { ICsvData, ICyData, IData, IPosition } from "../components/chart";

import {
  cycleMax,
  cycleMin,
  cycleDuration,
  selLineRange,
} from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";
import { Table, IRow } from "../components/table/Table";
import { findIndex } from "../utils/utils";
import dataInit, { location, sensor } from "../models/dataInit";

import { invoke } from "@tauri-apps/api/tauri";
import {
  copyFile,
  readTextFile,
  removeDir,
  removeFile,
} from "@tauri-apps/api/fs";
import { join, appDir, homeDir, basename, resourceDir } from "@tauri-apps/api/path";
import { save, message } from "@tauri-apps/api/dialog";
import { Button, ButtonOutline } from "../components/button/Button";

const refKey = ["line", "bmax", "bmin", "lnav", "bclt", "bcrt", "bcdb", "bcgt"];

const AppDir = appDir();
const DataDir = "data";
const FilterDir = "filter";
const ExportDir = "export";
const SwriteDir = "swrite";

export interface ChartProps {}

const Chart = forwardRef((_props: ChartProps, ref) => {
  const refs: { [k: string]: RefObject<SVGSVGElement> } = {};
  refKey.forEach((k) => {
    refs[k] = useRef<SVGSVGElement>(null);
  });
  const [updators] = useState<{ [key: string]: Function }>({
    _: new Function(),
  });

  const [dataS, setDataS] = useState<IData>(JSON.parse(JSON.stringify(dataInit)));
  const [cyS, setCyS] = useState<ICyData>({
    gait: { step: [[]], sel: [0, 0] },
    lt: { step: [[]], sel: [0, 0] },
    rt: { step: [[]], sel: [0, 0] },
    db: { step: [[]], sel: [0, 0] },
  });

  const [selPos, setSelPos] = useState<string>(location[0]);
  const [selOpt, setSelOpt] = useState<string>(sensor[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);
  const [trContent, setTrContent] = useState<IRow[]>([]);
  const [inputFile, setInputFile] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState(false);

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

    (async () => {
      await removeDir(await join(await AppDir, DataDir), {
        recursive: true,
      }).catch((e) => e);
    })();
  }, []);

  /* Create chart when upload api response FilterdData*/
  async function initChart(file: string) {
    var saveDir = await join(await AppDir, DataDir, FilterDir);
    var remapCsv = await join(await resourceDir(), "assets/all.csv")
    var filterCsv = await join(await resourceDir(), "assets/filter.csv")

    const result = (await invoke("filter_csv", { file, saveDir, remapCsv, filterCsv})) as any;

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
    if (ranges.length == 0 || !inputFile) return;

    const saveDir = await join(await AppDir, DataDir, ExportDir);
    const file = await join(
      await AppDir,
      DataDir,
      FilterDir,
      await basename(inputFile)
    );
    const result = (await invoke("export_csv", {
      file,
      saveDir,
      ranges,
    }).catch()) as any; // TODO: ???
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
    setSaveLoading(true);
    let rangesValue = trContent
      .map((row) => {
        return row.range.map((i) => cyS.gait.step[i][0]).join("-");
      })
      .join(" ");
    if (!inputFile) return;
    const saveDir = await join(await AppDir, DataDir, SwriteDir);
    var remapCsv = await join(await resourceDir(), "assets/all.csv")
    const file = inputFile;
    const result = (await invoke("swrite_csv", {
      file,
      saveDir,
      rangesValue,
      remapCsv
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
    setSaveLoading(false);
  };

  /* Update all chart logic */
  const updateLogic = (d: IPosition[], c: ICyData) => {
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
    schema: ICsvData,
    c: ICyData,
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
      if (ranges.length == 0 || !inputFile) return;
      // let res = await postRange(resUpld.python.FltrFile, ranges);
      var res;
      return res;
    },
  }));

  return (
    <div>
      <div className="flex justify-center">
        <Uploader
          file={inputFile}
          setFile={setInputFile}
          handleFile={initChart}
        />
      </div>

      <div className="grid grid-cols-6 gap-1 m-2">
        <Plot title="Max" ref={refs.bmax} />
        <Plot title="Min" ref={refs.bmin} />
        <Plot title="Gait" ref={refs.bcgt} />
        <Plot title="LT Sup" ref={refs.bclt} />
        <Plot title="RT Sup" ref={refs.bcrt} />
        <Plot title="DB Sup" ref={refs.bcdb} />
        <div className="chart-box col-span-6">
          <svg ref={refs.line}></svg>
          <svg ref={refs.lnav}></svg>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1 m-2">
        <div className="col-span-2">
          <Selector
            options={location}
            selectedOption={selPos}
            onChange={selPosChange}
            disable={selDisable}
          />
        </div>
        <div className="col-span-2">
          <Selector
            options={sensor}
            selectedOption={selOpt}
            onChange={selOptChange}
            disable={selDisable}
          />
        </div>
        <ButtonOutline
          className="col-span-1 w-full"
          onClick={addTrNode}
          content={"Select"}
          disabled={selDisable}
        />
        <ButtonOutline
          className="col-span-1 w-full"
          onClick={saveSelection}
          content={"Save"}
          disabled={selDisable}
          isLoading={saveLoading}
        />
        <div
          className="col-span-6 h-[18vh] shadow-lg rounded-xl mt-1
          overflow-y-scroll overscroll-none custom-scrollbar"
        >
          <Table
            content={trContent}
            removeNode={removeTrNode}
            removeAll={removeAllTrNode}
            updateView={showSel}
          />
        </div>
        <Button
          className="col-start-3 col-span-2 mt-2"
          onClick={exportResult}
          content={"Export"}
        />
      </div>
    </div>
  );
});

const Plot = forwardRef(
  (props: { title: string }, ref: ForwardedRef<SVGSVGElement>) => {
    return (
      <div className="chart-box" key={props.title}>
        <p className="text-center text-sm dark:text-gray-400">{props.title}</p>
        <svg ref={ref}></svg>
      </div>
    );
  }
);

export default Chart;
