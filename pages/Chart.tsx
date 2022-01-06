import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent } from "react";
import * as d3 from "d3";

import {
  // Interface
  IDatasetInfo,
  IDataSchema,
  ICycle,
  IUpdator,
  INavUpdator,
  // Create chart
  createLineChart,
  createGaitNav,
  createBoxChart,
  // Utility
  parseResult,
  parseCycle,
} from "../components/chart";

import { cycleMaxIQR, cycleMinIQR } from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";
import { Button } from "../components/button/Button";

interface IUpdatorList {
  [key: string]: IUpdator | INavUpdator;
  line: IUpdator;
  maxBox: IUpdator;
  minBox: IUpdator;
  navLine: INavUpdator;
}

const dataSInit: IDataSchema = {
  aX: { data: [], csvX: "time", csvY: "Pelvis_A_X" },
  aY: { data: [], csvX: "time", csvY: "Pelvis_A_Y" },
  aZ: { data: [], csvX: "time", csvY: "Pelvis_A_Z" },
  gX: { data: [], csvX: "time", csvY: "Pelvis_Gyro_X" },
  gY: { data: [], csvX: "time", csvY: "Pelvis_Gyro_Y" },
  gZ: { data: [], csvX: "time", csvY: "Pelvis_Gyro_Z" },
};

const cycleInit: ICycle = { step: [[]], sel: [0, 0] };

const chartUpdatorInit: IUpdatorList = {
  line: () => {},
  maxBox: () => {},
  minBox: () => {},
  navLine: () => {},
};

function DrawChart(): ReactElement | null {
  const d3Line = useRef<HTMLDivElement>(null);
  const d3BoxMax = useRef<HTMLDivElement>(null);
  const d3BoxMin = useRef<HTMLDivElement>(null);
  const d3Nav = useRef(null);

  const [dataS, setDataS] = useState<IDataSchema>(dataSInit);
  const [cycle, setCycle] = useState<ICycle>(cycleInit);
  const [updators, setUpdators] = useState<IUpdatorList>(chartUpdatorInit);

  const [selOpt, setSelOpt] = useState<string>(Object.keys(dataS)[0]);
  const [selDisable, setSelDisable] = useState<boolean>(true);

  const csvFiles = [
    "./2021-09-26-18-36_result_Dr Tsai_1.csv",
    "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
  ];

  async function sendFile(f: File) {
    console.log("start");
    const formData = new FormData();
    formData.append("file", f); // NOTE: append("key", value)

    return fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((jsonRslt) => {
        Promise.all(
          [jsonRslt["resultUrl"], jsonRslt["cycleUrl"]].map((file) =>
            d3.csv(file)
          )
        ).then(([csvResult, csvGaitCycle]) => {
          setDataS(parseResult(csvResult, dataS));
          var tmpCycle = parseCycle(csvGaitCycle);
          setCycle(tmpCycle);

          // update chart
          updateApp(dataS.aX, tmpCycle);

          setSelDisable(false);
        });
      });
  }

  useEffect(() => {
    setUpdators({
      line: createLineChart(d3Line),
      maxBox: createBoxChart(d3BoxMax, cycleMaxIQR),
      minBox: createBoxChart(d3BoxMin, cycleMinIQR),
      navLine: createGaitNav(d3Nav),
    });
    // DUBUG:
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle]) => {
        setDataS(parseResult(csvResult, dataS));
        var tmpCycle = parseCycle(csvGaitCycle);
        setCycle(tmpCycle);

        // update chart
        updateApp(dataS.aX, tmpCycle);

        setSelDisable(false);
      }
    );
  }, []);

  const updateApp = (schema: IDatasetInfo, cycle: ICycle) => {
    updators.line(schema.data, cycle);
    updators.maxBox(schema.data, cycle);
    updators.minBox(schema.data, cycle);

    var updateLists = [
      { data: schema.data, func: updators.line, cycle: cycle },
      { data: schema.data, func: updators.maxBox, cycle: cycle },
      { data: schema.data, func: updators.minBox, cycle: cycle },
    ];
    updators.navLine(updateLists, schema.data, cycle);
    setCycle(cycle);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelOpt(e.target.value);
    updateApp(dataS[e.target.value], cycle);
  };

  return (
    <div className="border rounded-lg border-solid border-gray-300">
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
        <div className="col-span-4">
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
        <div className="col-span-1 row-span-2">
          <h1 className="text-center text-xl">Max</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMax}
          ></div>
          <Button title={"Select Cycle"} onClick={ _ => console.log(cycle) } />
        </div>
        <div className="col-span-1 row-span-2">
          <h1 className="text-center text-xl">Min</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMin}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default DrawChart;
