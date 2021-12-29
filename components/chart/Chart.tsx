import { FC, useEffect, useRef, RefObject } from "react";
import * as d3 from "d3";
import { IUpdateFunc } from "./Dataset";
import { Dataset, GaitCycle } from "./Dataset.var";
import { createLineChart } from "./LineChart";
// import { createAreaChart } from "./AreaChart";
import { createGaitNav } from "./Navigator";
import { createMultiAreaChart } from './MultiAreaChart'

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv",
];

const DrawChart: FC = () => {
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
          }
        });
        var multiFunc = createMultiAreaChart("double_support")
        multiFunc(Dataset.slice(-3), true)
        updateLists.push({
          data: Dataset.slice(-3),
          func: multiFunc,
        })
        createGaitNav(
          GaitCycle,
          [0, Dataset[0].data.slice(-1)[0].x],
          updateLists
        );
      }
    );
  }, []);

  return (
    <div>
      <div id="accel_x"></div>
      <div id="accel_y"></div>
      <div id="accel_z"></div>
      <div id="double_support"></div>
      <div id="lt_single_support"></div>
      <div id="rt_single_support"></div>
      <div id="minimap"></div>
    </div>
  );
};

export default DrawChart;
