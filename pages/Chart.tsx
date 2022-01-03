import { useEffect, useRef, useState } from "react";
import type { ReactElement, ChangeEvent } from "react";
import * as d3 from "d3";

import {
  IData,
  IUpdateList,
  IDatasetInfo,
  IDataSchema,
  IUpdateFunc,
  createLineChart,
  createGaitNav,
  createBoxChart,
  GaitCycle,
  selectRange,
  parseCSV,
} from "../components/chart";
import { cycleMaxIQR, cycleMinIQR } from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";

// declare update chart function
var navFunc: (
  updateLists: IUpdateList[],
  data: IData[],
  first: boolean
) => void;
var lineFunc: (data: IData[], first: boolean) => void;
var barMaxFunc: (data: IData[], first: boolean) => void;
var barMinFunc: (data: IData[], first: boolean) => void;

function DrawChart(): ReactElement | null {
  const d3Line = useRef(null);
  const d3BoxMax = useRef(null);
  const d3BoxMin = useRef(null);
  const d3Nav = useRef(null);
  const [dataS, setDataS] = useState<IDataSchema>({
    aX: {
      name: "Accel_x",
      data: new Array<IData>(),
      csvX: "time",
      csvY: "Pelvis_A_X",
    },
    aY: {
      name: "Accel_y",
      data: new Array<IData>(),
      csvX: "time",
      csvY: "Pelvis_A_Y",
    },
    aZ: {
      name: "Accel_z",
      data: new Array<IData>(),
      csvX: "time",
      csvY: "Pelvis_A_Z",
    },
  });
  const options = Object.keys(dataS);
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  const [selectDisable, setSelectDisable] = useState<boolean>(true);

  function initChart() {
    // init selected range to max
    selectRange.index.s = 0;
    selectRange.index.e = GaitCycle.length - 1;
    selectRange.value.s = GaitCycle[0];
    selectRange.value.e = GaitCycle[GaitCycle.length - 1];

    // create chart
    navFunc = createGaitNav(d3Nav, GaitCycle, [
      selectRange.value.s,
      selectRange.value.e,
    ]);

    // update chart
    updateApp(dataS.aX, true);
  }

  function sendFile(f: File) {
    const formData = new FormData();

    formData.append("file", f);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        Promise.all(
          [jsonData["resultUrl"], jsonData["cycleUrl"]].map((file) =>
            d3.csv(file)
          )
        ).then(([csvResult, csvGaitCycle]) => {
          setDataS(parseCSV([csvResult, csvGaitCycle], dataS));
          initChart();
          setSelectDisable(false);
        });
      });
  }

  useEffect(() => {
    const csvFiles = [
      "./2021-09-26-18-36_result_Dr Tsai_1.csv",
      "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
    ];
    lineFunc = createLineChart(d3Line)
    barMaxFunc = createBoxChart(d3BoxMax, cycleMaxIQR);
    barMinFunc = createBoxChart(d3BoxMin, cycleMinIQR);
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle]) => {
        setDataS(parseCSV([csvResult, csvGaitCycle], dataS));
        initChart();
        setSelectDisable(false);
      }
    );
  }, []);

  const updateApp = (schema: IDatasetInfo, first: boolean) => {
    // console.log(selectRange.index.s, selectRange.index.e);
    lineFunc(schema.data, first);
    barMaxFunc(schema.data, first);
    barMinFunc(schema.data, first);

    var updateLists: IUpdateList[] = [];
    updateLists.push({ data: schema.data, func: lineFunc });
    updateLists.push({ data: schema.data, func: barMaxFunc });
    updateLists.push({ data: schema.data, func: barMinFunc });

    navFunc(updateLists, schema.data, first);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    updateApp(dataS[e.target.value], false);
  };

  return (
    <div className="grid grid-cols-7 grid-rows-3 flex-col gap-4">
      <div className="col-span-7">
        <Uploader handleFile={sendFile} />
      </div>
      <div className="row-span-2 m-5 w-full">
        <Selector
          options={options}
          selectedOption={selectedOption}
          onChange={selectChange}
          disable={selectDisable}
        />
      </div>
      <div className="col-span-4">
        <h1 className="text-center">Accelration</h1>
        <div ref={d3Line}></div>
      </div>
      <div>
        <h1 className="text-center row-span-2">Max</h1>
        <div ref={d3BoxMax}></div>
      </div>
      <div>
        <h1 className="text-center row-span-2">Min</h1>
        <div ref={d3BoxMin}></div>
      </div>
      <div ref={d3Nav} className="col-span-4"></div>
    </div>
  );
}

export default DrawChart;
