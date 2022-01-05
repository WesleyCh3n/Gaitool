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

interface IUpdatorList {
  [key: string]: IUpdator | INavUpdator;
  lineChart: IUpdator;
  boxMaxChart: IUpdator;
  boxMinChart: IUpdator;
  navFunc: INavUpdator;
}

const dataSInit: IDataSchema = {
  aX: {
    name: "Accel_x",
    data: [],
    csvX: "time",
    csvY: "Pelvis_A_X",
  },
  aY: {
    name: "Accel_y",
    data: [],
    csvX: "time",
    csvY: "Pelvis_A_Y",
  },
  aZ: {
    name: "Accel_z",
    data: [],
    csvX: "time",
    csvY: "Pelvis_A_Z",
  },
};

const cycleInit: ICycle = {
  step: [[]],
  sel: [0, 0],
};

const chartUpdatorInit: IUpdatorList = {
  lineChart: () => {},
  boxMaxChart: () => {},
  boxMinChart: () => {},
  navFunc: () => {},
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

  function sendFile(f: File) {
    const formData = new FormData();
    formData.append("file", f); // NOTE: append("key", value)

    fetch("/api/upload", { method: "POST", body: formData })
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
      lineChart: createLineChart(d3Line),
      boxMaxChart: createBoxChart(d3BoxMax, cycleMaxIQR),
      boxMinChart: createBoxChart(d3BoxMin, cycleMinIQR),
      navFunc: createGaitNav(d3Nav),
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
    updators.lineChart(schema.data, cycle);
    updators.boxMaxChart(schema.data, cycle);
    updators.boxMinChart(schema.data, cycle);

    var updateLists = [
      {
        data: schema.data,
        func: updators.lineChart,
        cycle: cycle,
      },
      {
        data: schema.data,
        func: updators.boxMaxChart,
        cycle: cycle,
      },
      {
        data: schema.data,
        func: updators.boxMinChart,
        cycle: cycle,
      },
    ];
    updators.navFunc(updateLists, schema.data, cycle);
    setCycle(cycle);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelOpt(e.target.value);
    updateApp(dataS[e.target.value], cycle);
  };

  return (
    <div className="border rounded-lg border-solid border-gray-300
      ">
      <div className="flex justify-center">
        <Uploader handleFile={sendFile} />
      </div>
      <div className="grid grid-cols-7 flex-col gap-4 m-4">
        <div className="mt-[28px]">
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
        </div>
        <div>
          <h1 className="text-center text-xl">Max</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMax}
          ></div>
        </div>
        <div>
          <h1 className="text-center text-xl">Min</h1>
          <div
            className="border rounded-lg border-solid border-gray-300 shadow-md"
            ref={d3BoxMin}
          ></div>
        </div>
      </div>
      <h1 className="text-center text-xl">Navigator</h1>
      <div
        className="m-4 border rounded-lg border-solid border-gray-300 shadow-lg"
        ref={d3Nav}
      ></div>
    </div>
  );
}

export default DrawChart;
