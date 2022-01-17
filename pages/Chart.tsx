import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent, RefObject } from "react";
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
import { FilterdData } from "../api/filter";

const position = ["Pelvis", "Upper spine", "Lower spine"];
const content = {
  "Accel X": { data: [], csvX: "time", csvY: "A_X" },
  "Accel Y": { data: [], csvX: "time", csvY: "A_Y" },
  "Accel Z": { data: [], csvX: "time", csvY: "A_Z" },
  "Gyro X": { data: [], csvX: "time", csvY: "Gyro_X" },
  "Gyro Y": { data: [], csvX: "time", csvY: "Gyro_Y" },
  "Gyro Z": { data: [], csvX: "time", csvY: "Gyro_Z" },
};
const refKey = ["line", "bmax", "bmin", "lnav", "bclt", "bcrt", "bcdb", "bcgt"];

function Chart(): ReactElement | null {
  const dataSInit: IDataSPos = {};
  position.forEach((p) => {
    dataSInit[p] = JSON.parse(JSON.stringify(content)); // HACK: deep copy
  });
  const refs: { [k: string]: RefObject<HTMLDivElement> } = {};
  refKey.forEach((k) => {
    refs[k] = useRef<HTMLDivElement>(null);
  });
  const [dataS, setDataS] = useState<IDataSPos>(dataSInit);
  const [cyS, setCyS] = useState<ICycleList>({
    gait: { step: [[]], sel: [0, 0] },
    lt: { step: [[]], sel: [0, 0] },
    rt: { step: [[]], sel: [0, 0] },
    db: { step: [[]], sel: [0, 0] },
  });
  const [updators] = useState<{ [key: string]: Function }>({
    _: new Function(),
  });

  const [selPos, setSelPos] = useState<string>(position[0]);
  const [selOpt, setSelOpt] = useState<string>(Object.keys(content)[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);
  const [trContent, setTrContent] = useState<IRow[]>([]);

  // create chart when upload response
  async function initChart(res: FilterdData) {
    return Promise.all(
      [
        res["rsltUrl"],
        res["cyclUrl"],
        res["cyltUrl"],
        res["cyrtUrl"],
        res["cydbUrl"],
      ].map((file) => d3.csv(file))
    ).then(([csvResult, csvGaitCycle, csvLtCycle, csvRtCycle, csvDbCycle]) => {
      setDataS(parseResult(csvResult, dataS));
      updateApp(dataS[selPos][selOpt], {
        gait: parseCycle(csvGaitCycle),
        lt: parseCycle(csvLtCycle),
        rt: parseCycle(csvRtCycle),
        db: parseCycle(csvDbCycle),
      });

      setSelDisable(false);
    });
  }

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

    if (1) {
      // DEBUG:
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
          updateApp(dataS[selPos][selOpt], {
            gait: parseCycle(csvGaitCycle),
            lt: parseCycle(csvLtCycle),
            rt: parseCycle(csvRtCycle),
            db: parseCycle(csvDbCycle),
          });
          setSelDisable(false);
        }
      );
    }
  }, []);

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

  const updateApp = (schema: IDatasetInfo, c: ICycleList) => {
    updateLogic(schema.data, c);
    updators.lnav(updateLogic, schema.data, c);
    setCyS(c);
  };

  const selOptChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[selPos][e.target.value], cyS);
    setSelOpt(e.target.value);
  };

  const selPosChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[e.target.value][selOpt], cyS);
    setSelPos(e.target.value);
  };

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

  const removeTrNode = (id: string) => {
    setTrContent(trContent.filter((d) => d.id !== id));
  };

  const removeAllTrNode = () => {
    setTrContent([]);
  };

  const showSel = (range: [number, number]) => {
    updators.lnav(updateLogic, dataS[selPos][selOpt].data, cyS, range);
  };

  return (
    <div className="normalBox w-full">
      <div className="flex justify-center m-2">
        <Uploader handleFile={initChart} />
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
            <div ref={d.ref}></div>
          </div>
        ))}
        <div className="normalBox col-span-2 md:col-span-3 lg:col-span-6">
          <h1>Accelration</h1>
          <div ref={refs.line}></div>
          <div className="mt-4" ref={refs.lnav}></div>
        </div>

        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <Selector
            options={position}
            selectedOption={selPos}
            onChange={selPosChange}
            disable={selDisable}
          />
        </div>
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
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
          >
            Export
          </button>
        </div>

        <div className="col-span-2 md:col-span-3 lg:col-span-6">
          <Table
            content={trContent}
            removeNode={removeTrNode}
            removeAll={removeAllTrNode}
            updateView={showSel}
          />
        </div>
      </div>
    </div>
  );
}

export default Chart;
