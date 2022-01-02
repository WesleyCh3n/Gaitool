import { FC, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { cycleMaxIQR, cycleMinIQR } from "../utils/dataPreprocess";

import {
  IData,
  IUpdateFunc,
  IDatasetInfo,
  GaitCycle,
  createLineChart,
  createGaitNav,
  createBoxChart,

  dataSchema,
} from "../components/chart";

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
];


const options = Object.keys(dataSchema);
var navFunc: (updateLists: IUpdateFunc[], data: IData[]) => void
var lineFunc: (data: IData[], first: boolean) => void
var barMaxFunc: (data: IData[], first: boolean) => void
var barMinFunc: (data: IData[], first: boolean) => void

const DrawChart: FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  const d3Line = useRef(null)
  const d3BoxMax = useRef(null)
  const d3BoxMin = useRef(null)
  const d3Nav = useRef(null)

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

        csvGaitCycle.forEach((row) => {
          GaitCycle.push(+(row.time ?? 0));
        });
        var startEnd = d3
          .extent(dataSchema.aX.data, (d) => d.x)
          .map((x) => x ?? 0);
        GaitCycle.unshift(startEnd[0]);
        GaitCycle.push(startEnd[1]);

        navFunc = createGaitNav(d3Nav, GaitCycle, [0, dataSchema.aX.data.slice(-1)[0].x])
        lineFunc = createLineChart(d3Line);
        barMaxFunc = createBoxChart(d3BoxMax, cycleMaxIQR);
        barMinFunc = createBoxChart(d3BoxMin, cycleMinIQR);
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

    {/* var multiFunc = createMultiAreaChart("double_support");
      * multiFunc(dataSchema.slice(-3), true);
      * updateLists.push({
      *   data: dataSchema.slice(-3),
      *   func: multiFunc,
      * }); */}

    navFunc(updateLists, schema.data)
  };

  return (
    <div>
      <div className="flex justify-center">
        <div className="mb-3 xl:w-96">
          <select
            defaultValue={selectedOption}
            onChange={(e) => {
              setSelectedOption(e.target.value)
              updateApp(dataSchema[e.target.value], false)
            }}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
          <div
            className="grid grid-flow-row-dense grid-cols-6"
          >
            <div className="col-span-4">
              <h1 className="text-center">Accelration</h1>
              <div ref={d3Line}></div>
            </div>
            <div>
              <h1 className="text-center">Max</h1>
              <div ref={d3BoxMax}></div>
            </div>
            <div>
              <h1 className="text-center">Min</h1>
              <div ref={d3BoxMin}></div>
            </div>
          </div>
      <div ref={d3Nav}></div>
      {/* <div id="double_support"></div> */}
    </div>
  );
};

export default DrawChart;
