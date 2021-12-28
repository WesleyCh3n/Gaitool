import { FC, useEffect, useRef, RefObject } from 'react';
import * as d3 from 'd3';
import { Dataset, GaitCycle } from './Dataset.var';
import { createChart } from './DrawLine'
import { createNav } from './Navigator'

const csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv"
]

const DrawChart: FC = () => {

  useEffect(() => {
    Promise.all(
      csvFiles.map(file => d3.csv(file))
    ).then(([csvResult, csvGaitCycle]) => {
      // load data into corresponding index/axis
      Dataset.forEach(dataObj => {
        csvResult.forEach(row => {
          dataObj.data.push({
            x: +(row[dataObj.csvX] ?? 0),
            y: +(row[dataObj.csvY] ?? 0)
          })
        })
      })
      csvGaitCycle.forEach(row => {
        GaitCycle.push(+(row.time ?? 0) )
      })
      var startEnd = d3.extent(Dataset[0].data, (d) => d.x).map(x => x ?? 0)
      GaitCycle.unshift(startEnd[0])
      GaitCycle.push(startEnd[1])

      createNav(Dataset[0].data);
      Dataset.forEach(dataObj => createChart(dataObj.data, dataObj.name, dataObj.mode))
    })
  }, [])

  return(
    <div>
      <div id="accel_x"></div>
      <div id="accel_y"></div>
      <div id="accel_z"></div>
      <div id="double_support"></div>
      <div id="lt_single_support"></div>
      <div id="rt_single_support"></div>
      <div id="minimap"></div>
    </div>
  )
}

export default DrawChart;
