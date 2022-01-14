import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent, RefObject } from "react";
import * as d3 from "d3";

import {
  // Interface
  IDatasetInfo,
  ICycleList,
  // Create chart
  createLineChart,
  createGaitNav,
  createBoxChart,
  // Utility
  parseResult,
  parseCycle,
  IDataSPos,
  IData,
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

function DrawChart(): ReactElement | null {
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

  const csvFiles = [
    "./2021-09-26-18-36_result_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_lt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_rt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_db_Dr Tsai_1.csv",
  ];

  // create chart when upload response
  async function createChart(res: FilterdData) {
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

    if (1) { // DEBUG:
      Promise.all(csvFiles.map((file) => d3.csv(file))).then(
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
    let minD = cycleMin(d, c.gait);
    let maxD = cycleMax(d, c.gait);
    let gtD = cycleDuration(c.gait);
    let ltD = cycleDuration(c.lt);
    let rtD = cycleDuration(c.rt);
    let dbD = cycleDuration(c.db);

    // input data to update fig
    updators.line(d, lineRange);
    updators.bmax(maxD);
    updators.bmin(minD);
    updators.bcgt(gtD);
    updators.bclt(ltD);
    updators.bcrt(rtD);
    updators.bcdb(dbD);
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
        range: cyS.gait.sel
          .map((i) => cyS.gait.step[i][0].toFixed(2))
          .join("-"),
        gt: d3.median(cycleDuration(cyS.gait))?.toFixed(2) ?? 0,
        lt: d3.median(cycleDuration(cyS.lt))?.toFixed(2) ?? 0,
        rt: d3.median(cycleDuration(cyS.rt))?.toFixed(2) ?? 0,
        db: d3.median(cycleDuration(cyS.db))?.toFixed(2) ?? 0,
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

  return (
    <div className="border rounded-lg border-solid border-gray-300">
      <div className="flex justify-center">
        <Uploader handleFile={createChart} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 m-4">
        <div className="lg:mt-[28px] col-span-2 md:col-span-4 lg:col-span-1 row-span-2">
          <div className="row-span-1 mb-4 text-sm">
            <Selector
              options={position}
              selectedOption={selPos}
              onChange={selPosChange}
              disable={selDisable}
            />
          </div>
          <div className="h-max">
            <Selector
              options={Object.keys(content)}
              selectedOption={selOpt}
              onChange={selOptChange}
              disable={selDisable}
            />
          </div>
        </div>
        <div className="col-span-2 md:col-span-4 lg:col-span-6">
          <h1 className="text-center text-xl">Accelration</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.line}
          ></div>
          <div
            className="mt-4 border rounded-lg border-solid border-gray-300 shadow-lg"
            ref={refs.lnav}
          ></div>
        </div>
        {[
          { title: "Max", ref: refs.bmax },
          { title: "Min", ref: refs.bmin },
          { title: "GAIT", ref: refs.bcgt },
          { title: "LT support", ref: refs.bclt },
          { title: "RT support", ref: refs.bcrt },
          { title: "DB support", ref: refs.bcdb },
        ].map((d) => (
          <div className="col-span-1" key={d.title}>
            <h1 className="text-center text-xl">{d.title}</h1>
            <div
              className="border rounded-lg border-solid border-gray-300 shadow-md"
              ref={d.ref}
            ></div>
          </div>
        ))}
        <div className="col-span-2 md:col-span-4 lg:col-span-7 flex justify-center space-x-4">
          <button className="btn btn-outline" onClick={addTrNode}>
            Select Cycle
          </button>
          <button className="btn btn-outline">Export</button>
        </div>
        <div className="col-span-2 md:col-span-4 lg:col-span-7">
          <Table
            content={trContent}
            removeNode={removeTrNode}
            removeAll={removeAllTrNode}
          />
        </div>
      </div>
    </div>
  );
}

export default DrawChart;
