import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent, RefObject } from "react";
import * as d3 from "d3";

import {
  // Interface
  IDatasetInfo,
  ICycle,
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

function DrawChart(): ReactElement | null {
  const dataSInit: IDataSPos = {};
  position.forEach((p) => {
    dataSInit[p] = JSON.parse(JSON.stringify(content)); // HACK: deep copy
  });

  const cycleInit: ICycle = { step: [[]], sel: [0, 0] };

  // NOTE: create references (2 places: useEffect, embeded)
  const chartKey = ["line", "bmax", "bmin", "lnav", "bclt", "bcrt", "bcdb"];
  const refs: { [k: string]: RefObject<HTMLDivElement> } = {};
  chartKey.forEach((k) => {
    refs[k] = useRef<HTMLDivElement>(null);
  });

  // NOTE: data(parse, sel update), cycles(sel update, export, updateApp)
  const [dataS, setDataS] = useState<IDataSPos>(dataSInit);
  const [cygt, setCygt] = useState<ICycle>(cycleInit);
  const [cylt, setCylt] = useState<ICycle>(cycleInit);
  const [cyrt, setCyrt] = useState<ICycle>(cycleInit);
  const [cydb, setCydb] = useState<ICycle>(cycleInit);

  // NOTE: updator(useEffect, updateApp)
  const [updators] = useState<{ [key: string]: Function }>({
    _: new Function(),
  });

  const [selPos, setSelPos] = useState<string>(position[0]);
  const [selOpt, setSelOpt] = useState<string>(Object.keys(content)[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);

  const csvFiles = [
    "./2021-09-26-18-36_result_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_lt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_rt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_db_Dr Tsai_1.csv",
  ];

  async function createChart(res: FilterdData) {
    // create chart when upload response
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
    updators.bclt = createBoxChart(refs.bclt);
    updators.bcrt = createBoxChart(refs.bcrt);
    updators.bcdb = createBoxChart(refs.bcdb);
    updators.lnav = createGaitNav(refs.lnav);

    // DUBUG:
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
  }, []);

  const updateLogic = (d: IData[], c: ICycleList) => {
    // preprocess/filter data
    let lineD = selLineRange(d, c.gait);
    let lineRange = d3.extent(lineD, (d) => d.x).map((x) => x ?? 0);
    let minD = cycleMin(d, c.gait);
    let maxD = cycleMax(d, c.gait);
    let ltD = cycleDuration(c.lt);
    let rtD = cycleDuration(c.rt);
    let dbD = cycleDuration(c.db);

    /*
     * updator.line({
     *  data: {
     *    x: 'x',
     *    columns: [
     *      ['x': d.map(d => d.x)],
     *      ['y': d.map(d => d.y)]
     *    ]
     *  }
     * })
     * updator.bmax({
     *  data: {
     *    columns: [
     *      ['data1': minD]
     *    ]
     *  }
     * })
     * */
    // input data to update fig
    updators.line(d, lineRange);
    updators.bmax(minD);
    updators.bmin(maxD);
    updators.bclt(ltD);
    updators.bcrt(rtD);
    updators.bcdb(dbD);
  };

  const updateApp = (schema: IDatasetInfo, c: ICycleList) => {
    setCygt(c.gait);
    setCylt(c.lt);
    setCyrt(c.rt);
    setCydb(c.db);
    updateLogic(schema.data, c);
    updators.lnav(updateLogic, schema.data, c);
  };

  const selOptChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[selPos][e.target.value], {
      gait: cygt,
      lt: cylt,
      rt: cyrt,
      db: cydb,
    });
    setSelOpt(e.target.value);
  };

  const selPosChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateApp(dataS[e.target.value][selOpt], {
      gait: cygt,
      lt: cylt,
      rt: cyrt,
      db: cydb,
    });
    setSelPos(e.target.value);
  };

  return (
    <div className="border rounded-lg border-solid border-gray-300">
      <div className="flex justify-center">
        <Uploader handleFile={createChart} />
      </div>
      <div className="grid grid-cols-7 gap-4 m-4">
        <div className="mt-[28px] row-span-2">
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
        <div className="col-span-6">
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
        <div className="col-span-1">
          <h1 className="text-center text-xl">Max</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.bmax}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">Min</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.bmin}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">LT support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.bclt}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">RT support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.bcrt}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">DB support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={refs.bcdb}
          ></div>
        </div>
        <div className="col-span-1 grid grid-rows-2 items-center justify-center">
          <button
            className="btn btn-outline"
            onClick={(_) => {
              console.log(cygt);
              console.log(cylt);
              console.log(cyrt);
            }}
          >
            Select Cycle
          </button>
          <button className="btn btn-outline">Export</button>
        </div>
      </div>
    </div>
  );
}

export default DrawChart;
