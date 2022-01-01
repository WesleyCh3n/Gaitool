import { FC, useEffect, useRef, RefObject, useState } from "react";
import * as d3 from "d3";
import { IUpdateFunc } from "./Dataset";
import { Dataset, GaitCycle } from "./Dataset.var";
import { createLineChart } from "./LineChart";
// import { createAreaChart } from "./AreaChart";
import { createGaitNav } from "./Navigator";
import { createMultiAreaChart } from "./MultiAreaChart";
import { createBoxChart } from "./BoxChart";
import { IQR, cycleMaxIQR, cycleMinIQR } from "../../utils/dataPreprocess";

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
];

const DrawChart: FC = () => {
  var options = ["1", "2", "3"];
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);

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

        var updateLists: IUpdateFunc[] = [];
        Dataset.forEach((dataObj) => {
          if (dataObj.mode === "line") {
            var updateFunc = createLineChart(dataObj.name);
            updateFunc(dataObj.data, true);
            updateLists.push({
              data: dataObj.data,
              func: updateFunc,
            });
            var barFuncMax = createBoxChart(`${dataObj.name}_max`, cycleMaxIQR);
            barFuncMax(dataObj.data, true);
            updateLists.push({
              data: dataObj.data,
              func: barFuncMax,
            });
            var barFuncMin = createBoxChart(`${dataObj.name}_min`, cycleMinIQR);
            barFuncMin(dataObj.data, true);
            updateLists.push({
              data: dataObj.data,
              func: barFuncMin,
            });
          }
        });

        var multiFunc = createMultiAreaChart("double_support");
        multiFunc(Dataset.slice(-3), true);
        updateLists.push({
          data: Dataset.slice(-3),
          func: multiFunc,
        });

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
      {Dataset.map((dataObj) => {
        return (
          <div className="grid grid-flow-row-dense grid-cols-6" key={dataObj.name}>
            <div className="col-span-4">
              <h1 className="text-center">{dataObj.name}</h1>
              <div id={dataObj.name}></div>
            </div>
            <div>
              <h1 className="text-center">Max</h1>
              <div id={`${dataObj.name}_max`}></div>
            </div>
            <div>
              <h1 className="text-center">Min</h1>
              <div id={`${dataObj.name}_min`}></div>
            </div>
          </div>
        );
      })}
      <div id="minimap"></div>
      {/* <div id="double_support"></div> */}
    </div>
  );
};

export default DrawChart;
