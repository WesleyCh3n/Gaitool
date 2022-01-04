import { useEffect, useRef, useState, } from "react";
import type { ReactElement, ChangeEvent } from "react";
import * as d3 from "d3";

import {
  IData,
  IUpdateList,
  IDatasetInfo,
  IDataSchema,
  IUpdatorList,
  createLineChart,
  createGaitNav,
  createBoxChart,
  selectRange,
  parseResult,
  parseCycle,
} from "../components/chart";
import { cycleMaxIQR, cycleMinIQR } from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader";

// declare update chart function
// var navFunc: (
  // updateLists: IUpdateList[],
  // data: IData[],
  // first: boolean,
  // cycle: number[]
// ) => void;

function DrawChart(): ReactElement | null {
  const d3Line = useRef<HTMLDivElement>(null);
  const d3BoxMax = useRef<HTMLDivElement>(null);
  const d3BoxMin = useRef<HTMLDivElement>(null);
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
  const [cycle, setCycle] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<string>(Object.keys(dataS)[0]);
  const [selectDisable, setSelectDisable] = useState<boolean>(true);
  const [funcs, setFuncs] = useState<IUpdatorList>({
      lineChart:   () => {},
      boxMaxChart: () => {},
      boxMinChart: () => {},
      navFunc: ()=>{},
    })

  function sendFile(f: File) {
    const csvFiles = [
      "./2021-09-26-18-36_result_Dr Tsai_1.csv",
      "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
    ];
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle]) => {
        setDataS(parseResult([csvResult, csvGaitCycle], dataS));
        var tempCycle = parseCycle(csvGaitCycle, dataS.aX.data)
        setCycle(tempCycle)

        // init selected range to max
        selectRange.index.s = 0;
        selectRange.index.e = tempCycle.length - 1;
        selectRange.value.s = tempCycle[0];
        selectRange.value.e = tempCycle[tempCycle.length - 1];


        // update chart
        updateApp(dataS.aX, true, tempCycle);

        setSelectDisable(false);
      }
    );

    const formData = new FormData();

    formData.append("file", f);
{/*
  *     fetch("/api/upload", {
  *       method: "POST",
  *       body: formData,
  *     })
  *       .then((res) => res.json())
  *       .then((jsonData) => {
  *         Promise.all(
  *           [jsonData["resultUrl"], jsonData["cycleUrl"]].map((file) =>
  *             d3.csv(file)
  *           )
  *         ).then(([csvResult, csvGaitCycle]) => {
  *
  *           setDataS(parseResult([csvResult, csvGaitCycle], dataS));
  *           var tempCycle = parseCycle(csvGaitCycle, dataS.aX.data)
  *           setCycle(tempCycle)
  *
  *           // init selected range to max
  *           selectRange.index.s = 0;
  *           selectRange.index.e = tempCycle.length - 1;
  *           selectRange.value.s = tempCycle[0];
  *           selectRange.value.e = tempCycle[tempCycle.length - 1];
  *
  *           // create chart
  *           navFunc = createGaitNav(d3Nav, [
  *             selectRange.value.s,
  *             selectRange.value.e,
  *           ]);
  *
  *           // update chart
  *           updateApp(dataS.aX, true, tempCycle);
  *
  *           setSelectDisable(false);
  *         });
  *       }); */}
  }

  useEffect(() => {
    setFuncs({
      lineChart: createLineChart(d3Line),
      boxMaxChart: createBoxChart(d3BoxMax, cycleMaxIQR),
      boxMinChart: createBoxChart(d3BoxMin, cycleMinIQR),
      navFunc: createGaitNav(d3Nav),
    })
  }, []);

  const updateApp = (schema: IDatasetInfo, first: boolean, cycle: number[]) => {
    // console.log(selectRange.index.s, selectRange.index.e);

    funcs.lineChart(schema.data, first);
    funcs.boxMaxChart(schema.data, first, cycle);
    funcs.boxMinChart(schema.data, first, cycle);

    var updateLists: IUpdateList[] = [];
    updateLists.push({ data: schema.data, func: funcs.lineChart });
    updateLists.push({ data: schema.data, func: funcs.boxMaxChart, cycle: cycle});
    updateLists.push({ data: schema.data, func: funcs.boxMinChart, cycle: cycle});
    funcs.navFunc(updateLists, schema.data, first, cycle);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    updateApp(dataS[e.target.value], false, cycle);
  };

  return (
    <div className="m-4 border rounded-lg border-solid border-gray-300">
      <div className="flex justify-center">
        <Uploader handleFile={sendFile} />
      </div>
      <div className="grid grid-cols-7 flex-col gap-4 m-4">
        <div className="mt-[28px]">
          <Selector
            options={Object.keys(dataS)}
            selectedOption={selectedOption}
            onChange={selectChange}
            disable={selectDisable}
          />
        </div>
        <div className="col-span-4">
          <h1 className="text-center text-xl">Accelration</h1>
          <div className="border rounded-lg border-solid border-gray-300 shadow-md" ref={d3Line}></div>
        </div>
        <div>
          <h1 className="text-center text-xl">Max</h1>
          <div className="border rounded-lg border-solid border-gray-300 shadow-md" ref={d3BoxMax}></div>
        </div>
        <div>
          <h1 className="text-center text-xl">Min</h1>
          <div className="border rounded-lg border-solid border-gray-300 shadow-md" ref={d3BoxMin}></div>
        </div>
      </div>
        <h1 className="text-center text-xl">Navigator</h1>
        <div className="m-4 border rounded-lg border-solid border-gray-300 shadow-lg" ref={d3Nav}></div>
    </div>
  );
}

export default DrawChart;
