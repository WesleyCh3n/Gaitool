import { FC, useEffect, useRef, RefObject, useState } from "react";
import * as d3 from "d3";
import { IUpdateFunc } from "./Dataset";
import { Dataset, GaitCycle } from "./Dataset.var";
import { createLineChart } from "./LineChart";
// import { createAreaChart } from "./AreaChart";
import { createGaitNav } from "./Navigator";
import { createMultiAreaChart } from './MultiAreaChart'
import { createBoxChart } from './BoxChart'

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
];

const DrawChart: FC = () => {

  var options = ['1', '2', '3']
  const [selectedOption, setSelectedOption] = useState<string>(options[0])

  useEffect(() => {
    Promise.all(csvFiles.map((file) => d3.csv(file))).then(
      ([csvResult, csvGaitCycle]) => {
        // load data into corresponding index/axis
        Dataset.forEach((dataObj) => {
          csvResult.forEach((row) => {
            dataObj.data.push({
              x: +(row[dataObj.csvX] ?? 0),
              y: +(row[dataObj.csvY] ?? 0),
            });
          });
        });
        csvGaitCycle.forEach((row) => {
          GaitCycle.push(+(row.time ?? 0));
        });
        var startEnd = d3
          .extent(Dataset[0].data, (d) => d.x)
          .map((x) => x ?? 0);
        GaitCycle.unshift(startEnd[0]);
        GaitCycle.push(startEnd[1]);


        var updateLists: IUpdateFunc[] = []
        Dataset.forEach((dataObj) => {
          if (dataObj.mode === "line") {
            var updateFunc = createLineChart(dataObj.name);
            updateFunc(dataObj.data, true);
            updateLists.push({
              data: dataObj.data,
              func: updateFunc,
            })
            var barFunc = createBoxChart(`${dataObj.name}_box`)
            barFunc(dataObj.data, true)
            updateLists.push({
              data: dataObj.data,
              func: barFunc,
            })
          }
        });

        var multiFunc = createMultiAreaChart("double_support")
        multiFunc(Dataset.slice(-3), true)
        updateLists.push({
          data: Dataset.slice(-3),
          func: multiFunc,
        })

        // create navigator last
        createGaitNav(
          "minimap",
          GaitCycle,
          [0, Dataset[0].data.slice(-1)[0].x],
          updateLists,
          Dataset[0].data
        );
      }
    );
  }, []);

  return (
    <div>
      {/* <div className="flex justify-center">
        *   <div className="mb-3 xl:w-96">
        *     <select
        *       defaultValue={selectedOption}
        *       onChange={(e) => setSelectedOption(e.target.value)}
        *     >
        *       {options.map((opt) => (
        *         <option key={opt} value={opt}>
        *           {opt}
        *         </option>
        *       ))}
        *     </select>
        *   </div>
        * </div> */}
      <div className="grid grid-flow-row-dense grid-cols-5">
        <div id="accel_x" className="col-span-4"></div>
        <div id="accel_x_box"></div>
        <div id="accel_y" className="col-span-4"></div>
        <div id="accel_y_box"></div>
        <div id="accel_z" className="col-span-4"></div>
        <div id="accel_z_box"></div>
        <div id="double_support" className="col-span-4"></div>
      </div>
      <div id="minimap"></div>
    </div>
  );
};

export default DrawChart;
