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
import { postRange, saveExport, saveRange } from "../api/exporter";
import { findIndex } from "../utils/utils";
import { ResUpload } from "../models/response_models";
import { col_schema } from "../models/column_schema";

import { invoke } from "@tauri-apps/api/tauri";
import { createDir } from "@tauri-apps/api/fs";

const position = ["L", "T", "Scapular LT", "Scapular RT"];
const content = {
  "Accel X": { data: [], csvX: "time", csvY: "A_X" },
  "Accel Y": { data: [], csvX: "time", csvY: "A_Y" },
  "Accel Z": { data: [], csvX: "time", csvY: "A_Z" },
  "Gyro X": { data: [], csvX: "time", csvY: "Gyro_X" },
  "Gyro Y": { data: [], csvX: "time", csvY: "Gyro_Y" },
  "Gyro Z": { data: [], csvX: "time", csvY: "Gyro_Z" },
};
const refKey = ["line", "bmax", "bmin", "lnav", "bclt", "bcrt", "bcdb", "bcgt"];

export interface ChartProps { }

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
  const [selOpt, setSelOpt] = useState<string>(Object.keys(content)[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);
  const [trContent, setTrContent] = useState<IRow[]>([]);

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

  async function initChartTest(file: string) {
    var saveDir = "saved"
    invoke("filter_csv", { file, saveDir }).then(() => {
      console.log("Succedd");
    })
  }

  /* Create chart when upload api response FilterdData*/
  async function initChart(res: ResUpload) {
    setResUpld(res);
    return Promise.all(
      [
        `${res.serverRoot}/${res.saveDir}/${res.python.FltrFile.rslt}`,
        `${res.serverRoot}/${res.saveDir}/${res.python.FltrFile.cyGt}`,
        `${res.serverRoot}/${res.saveDir}/${res.python.FltrFile.cyLt}`,
        `${res.serverRoot}/${res.saveDir}/${res.python.FltrFile.cyRt}`,
        `${res.serverRoot}/${res.saveDir}/${res.python.FltrFile.cyDb}`,
      ].map((file) => d3.csv(file))
    ).then(([csvResult, csvGaitCycle, csvLtCycle, csvRtCycle, csvDbCycle]) => {
      setDataS(parseResult(csvResult, dataS));
      cyS.gait = parseCycle(csvGaitCycle);
      cyS.lt = parseCycle(csvLtCycle);
      cyS.rt = parseCycle(csvRtCycle);
      cyS.db = parseCycle(csvDbCycle);
      updateApp(dataS[selPos][selOpt], cyS, [
        0,
        cyS["gait"]["step"].length - 1,
      ]);
      trInit(res["python"]["Range"]);
      setSelDisable(false);
    });
  }

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

  const trInit = (ranges: any) => {
    let trRows: IRow[] = [];
    for (let range of ranges) {
      let cycle = {
        gait: [0, 0] as [number, number],
        lt: [0, 0] as [number, number],
        rt: [0, 0] as [number, number],
        db: [0, 0] as [number, number],
      };
      let selValue = Object.values(range) as number[];
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

  /* Export result */
  const exportResult = async () => {
    let ranges = trContent.map((row) => {
      return { Start: row.range[0], End: row.range[1] };
    });
    if (ranges.length == 0 || !resUpld) return;
    await saveExport(resUpld, ranges);
  };

  const saveSelection = async () => {
    let ranges_value = trContent
      .map((row) => {
        return row.range.map((i) => cyS.gait.step[i][0]).join("-");
      })
      .join(" ");
    if (!resUpld) return;
    await saveRange(resUpld.uploadFile, ranges_value);
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
        <Uploader handleFile={initChartTest} />
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
            options={Object.keys(content)}
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
            className={`btn btn-sm w-full lg:w-fit ${selDisable ? "btn-disabled" : ""
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
