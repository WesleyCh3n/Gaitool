import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent } from "react";
import * as d3 from "d3";

import {
  // Interface
  IDatasetInfo,
  IDataSchema,
  ICycle,
  // Create chart
  createLineChart,
  createGaitNav,
  createBoxChart,
  // Utility
  parseResult,
  parseCycle,
} from "../components/chart";

import { cycleMaxIQR, cycleMinIQR, timeIQR } from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";

const dataSInit: IDataSchema = {
  "Pelvis aX": { data: [], csvX: "time", csvY: "Pelvis_A_X" },
  "Pelvis aY": { data: [], csvX: "time", csvY: "Pelvis_A_Y" },
  "Pelvis aZ": { data: [], csvX: "time", csvY: "Pelvis_A_Z" },
  "Pelvis gX": { data: [], csvX: "time", csvY: "Pelvis_Gyro_X" },
  "Pelvis gY": { data: [], csvX: "time", csvY: "Pelvis_Gyro_Y" },
  "Pelvis gZ": { data: [], csvX: "time", csvY: "Pelvis_Gyro_Z" },
  "Up Spine aX": { data: [], csvX: "time", csvY: "Upper spine_A_X" },
  "Up Spine aY": { data: [], csvX: "time", csvY: "Upper spine_A_Y" },
  "Up Spine aZ": { data: [], csvX: "time", csvY: "Upper spine_A_Z" },
  "Up Spine gX": { data: [], csvX: "time", csvY: "Upper spine_Gyro_X" },
  "Up Spine gY": { data: [], csvX: "time", csvY: "Upper spine_Gyro_Y" },
  "Up Spine gZ": { data: [], csvX: "time", csvY: "Upper spine_Gyro_Z" },
  "Lo Spine aX": { data: [], csvX: "time", csvY: "Lower spine_A_X" },
  "Lo Spine aY": { data: [], csvX: "time", csvY: "Lower spine_A_Y" },
  "Lo Spine aZ": { data: [], csvX: "time", csvY: "Lower spine_A_Z" },
  "Lo Spine gX": { data: [], csvX: "time", csvY: "Lower spine_Gyro_X" },
  "Lo Spine gY": { data: [], csvX: "time", csvY: "Lower spine_Gyro_Y" },
  "Lo Spine gZ": { data: [], csvX: "time", csvY: "Lower spine_Gyro_Z" },
  // db: { data: [], csvX: "time", csvY: "double_support" },
};

const cycleInit: ICycle = { step: [[]], sel: [0, 0] };

const chartUpdatorInit: { [key: string]: Function } = {
  line: new Function(),
  maxBox: new Function(),
  minBox: new Function(),
  ltBox: new Function(),
  rtBox: new Function(),
  dbBox: new Function(),
  navLine: new Function(),
};

function DrawChart(): ReactElement | null {
  const d3Line = useRef<HTMLDivElement>(null);
  const d3BoxMax = useRef<HTMLDivElement>(null);
  const d3BoxMin = useRef<HTMLDivElement>(null);
  const d3BoxLt = useRef<HTMLDivElement>(null);
  const d3BoxRt = useRef<HTMLDivElement>(null);
  const d3BoxDb = useRef<HTMLDivElement>(null);
  const d3Nav = useRef<HTMLDivElement>(null);

  const [dataS, setDataS] = useState<IDataSchema>(dataSInit);
  const [cycle, setCycle] = useState<ICycle>(cycleInit);
  const [ltCycle, setLtCycle] = useState<ICycle>(cycleInit);
  const [rtCycle, setRtCycle] = useState<ICycle>(cycleInit);
  const [dbCycle, setDbCycle] = useState<ICycle>(cycleInit);
  const [updators, setUpdators] =
    useState<{ [key: string]: Function }>(chartUpdatorInit);

  const [selOpt, setSelOpt] = useState<string>(Object.keys(dataS)[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);

  const csvFiles = [
    "./2021-09-26-18-36_result_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_lt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_rt_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_db_Dr Tsai_1.csv",
  ];

  async function sendFile(f: File) {
    const formData = new FormData();
    formData.append("file", f); // NOTE: append("key", value)

    return fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((jsonRslt) => {
        Promise.all(
          [
            jsonRslt["rsltUrl"],
            jsonRslt["cyclUrl"],
            jsonRslt["ltcyUrl"],
            jsonRslt["rtcyUrl"],
            jsonRslt["dbcyUrl"],
          ].map((file) => d3.csv(file))
        ).then(
          ([csvResult, csvGaitCycle, csvLtCycle, csvRtCycle, csvDbCycle]) => {
            setDataS(parseResult(csvResult, dataS));
            let cycleList: { [key: string]: ICycle } = {
              gait: parseCycle(csvGaitCycle),
              lt: parseCycle(csvLtCycle),
              rt: parseCycle(csvRtCycle),
              db: parseCycle(csvDbCycle),
            };
            // update chart
            updateApp(dataS[Object.keys(dataS)[0]], cycleList);

            setSelDisable(false);
          }
        );
      });
  }

  useEffect(() => {
    // setup chart when component mount
    setUpdators({
      line: createLineChart(d3Line),
      maxBox: createBoxChart(d3BoxMax, cycleMaxIQR),
      minBox: createBoxChart(d3BoxMin, cycleMinIQR),
      ltBox: createBoxChart(d3BoxLt, timeIQR),
      rtBox: createBoxChart(d3BoxRt, timeIQR),
      dbBox: createBoxChart(d3BoxDb, timeIQR),
      navLine: createGaitNav(d3Nav),
    });
    // DUBUG:
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle, csvLtCycle, csvRtCycle, csvDbCycle]) => {
        setDataS(parseResult(csvResult, dataS));
        let cycleList: { [key: string]: ICycle } = {
          gait: parseCycle(csvGaitCycle),
          lt: parseCycle(csvLtCycle),
          rt: parseCycle(csvRtCycle),
          db: parseCycle(csvDbCycle),
        };
        //
        // update chart
        updateApp(dataS[Object.keys(dataS)[0]], cycleList);

        setSelDisable(false);
      }
    );
  }, []);

  const updateApp = (schema: IDatasetInfo, c: { [key: string]: ICycle }) => {
    setCycle(c.gait);
    setLtCycle(c.lt);
    setRtCycle(c.rt);
    setDbCycle(c.db);
    updators.line(schema.data, c.gait);
    updators.maxBox(schema.data, c.gait);
    updators.minBox(schema.data, c.gait);
    updators.ltBox(schema.data, c.lt);
    updators.rtBox(schema.data, c.rt);
    updators.dbBox(schema.data, c.db);

    var updateLists = [
      function () {
        return updators.line;
      },
      function () {
        return updators.maxBox;
      },
      function () {
        return updators.minBox;
      },
      function () {
        return { f: updators.ltBox, c: c.lt };
      },
      function () {
        return { f: updators.rtBox, c: c.rt };
      },
      function () {
        return { f: updators.dbBox, c: c.db };
      },
    ];
    updators.navLine(updateLists, schema.data, c.gait);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelOpt(e.target.value);
    updateApp(dataS[e.target.value], {
      gait: cycle,
      lt: ltCycle,
      rt: rtCycle,
      db: dbCycle,
    });
  };

  return (
    <div className="min-w-[1100px] border rounded-lg border-solid border-gray-300">
      <div className="flex justify-center">
        <Uploader handleFile={sendFile} />
      </div>
      <div className="grid grid-cols-7 gap-4 m-4">
        <div className="mt-[28px] row-span-2">
          <Selector
            options={Object.keys(dataS)}
            selectedOption={selOpt}
            onChange={selectChange}
            disable={selDisable}
          />
        </div>
        <div className="col-span-6">
          <h1 className="text-center text-xl">Accelration</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3Line}
          ></div>
          <div
            className="mt-4 border rounded-lg border-solid border-gray-300 shadow-lg"
            ref={d3Nav}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">Max</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMax}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">Min</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMin}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">LT support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxLt}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">RT support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxRt}
          ></div>
        </div>
        <div className="col-span-1">
          <h1 className="text-center text-xl">DB support</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxDb}
          ></div>
        </div>
        <div className="col-span-1 grid grid-rows-2 items-center justify-center">
          <button
            className="btn btn-outline"
            onClick={(_) => {
              console.log(cycle);
              console.log(ltCycle);
              console.log(rtCycle);
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
