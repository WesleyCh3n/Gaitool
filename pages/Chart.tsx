import { useEffect, useRef, useState } from "react";
import type { FC, ChangeEvent } from "react";
import * as d3 from "d3";

import {
  IData,
  IUpdateFunc,
  IDatasetInfo,
  createLineChart,
  createGaitNav,
  createBoxChart,
  dataSchema,
  GaitCycle,
  selectRange,
} from "../components/chart";
import { cycleMaxIQR, cycleMinIQR } from "../utils/dataPreprocess";
import { Selector } from "../components/selector/Selector";
import { Uploader } from "../components/upload/Uploader"

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
];

const options = Object.keys(dataSchema);
// declare update chart function
var navFunc: (
  updateLists: IUpdateFunc[],
  data: IData[],
  first: boolean
) => void;
var lineFunc: (data: IData[], first: boolean) => void;
var barMaxFunc: (data: IData[], first: boolean) => void;
var barMinFunc: (data: IData[], first: boolean) => void;

const DrawChart: FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  const d3Line = useRef(null);
  const d3BoxMax = useRef(null);
  const d3BoxMin = useRef(null);
  const d3Nav = useRef(null);

  useEffect(() => {
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle]) => {
        // load data into corresponding index/axis
        for (let key in dataSchema) {
          csvResult.forEach((row) => {
            dataSchema[key].data.push({
              x: +(row[dataSchema[key].csvX] ?? 0),
              y: +(row[dataSchema[key].csvY] ?? 0),
            });
          });
        }

        // load Gait cycle
        csvGaitCycle.forEach((row) => {
          GaitCycle.push(+(row.time ?? 0));
        });
        var startEnd = d3
          .extent(dataSchema.aX.data, (d) => d.x)
          .map((x) => x ?? 0);
        GaitCycle.unshift(startEnd[0]);
        GaitCycle.push(startEnd[1]);

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
        lineFunc = createLineChart(d3Line);
        barMaxFunc = createBoxChart(d3BoxMax, cycleMaxIQR);
        barMinFunc = createBoxChart(d3BoxMin, cycleMinIQR);

        // update chart
        updateApp(dataSchema.aX, true);
      }
    );
  }, []);

  const updateApp = (schema: IDatasetInfo, first: boolean) => {
    lineFunc(schema.data, first);
    barMaxFunc(schema.data, first);
    barMinFunc(schema.data, first);

    var updateLists: IUpdateFunc[] = [];
    updateLists.push({ data: schema.data, func: lineFunc });
    updateLists.push({ data: schema.data, func: barMaxFunc });
    updateLists.push({ data: schema.data, func: barMinFunc });

    navFunc(updateLists, schema.data, first);
  };

  const selectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
    updateApp(dataSchema[e.target.value], false);
  };

  return (
    <div className="grid grid-cols-7 grid-rows-3 flex-col gap-4">
      <div className="col-span-7">
        <Uploader handleFile={(f) => {console.log(f)}}/>
      </div>
      <div className="row-span-2 m-5 w-full">
        <Selector
          options={options}
          selectedOption={selectedOption}
          onChange={selectChange}
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
};

export default DrawChart;
