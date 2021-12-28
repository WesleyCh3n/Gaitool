import { FC, useEffect, useRef, RefObject } from 'react';
import * as d3 from 'd3';
import { Data }from './Dataset'
import { Dataset } from './Dataset.var';


var GaitCycle: number[] = []

var margin = { top: 10, right: 50, bottom: 20, left: 50 };
var width = 1000 - margin.left - margin.right;
var lineHeight = 150 - margin.top - margin.bottom;
var areaHeight = 80 - margin.top - margin.bottom;

var xScale = d3.scaleLinear().range([0, width]);
var brushXScale = d3.scaleLinear().range([0, width]);
var brushHeight = 50
var brush = d3
  .brushX()
  .extent([[0, 0], [width, brushHeight]])
  .on("brush", (event: any) => {
    if (!event.selection) return;
    var s = event.selection;
    brushXScale.domain(s.map(xScale.invert));
    d3.selectAll(".handle--custom")
      .attr("display", null)
      .attr("transform", (_, i) => `translate(${s[i]}, ${-brushHeight/4})`);
  })
  .on("end", (event: any) => {
    if (!event.selection) {
      d3.selectAll(".handle--custom").attr("display", "none")
      return
    }
    if (!event.sourceEvent) return
    var d0 = event.selection.map(xScale.invert);
    var l = GaitCycle.reduce((prev, curr) => Math.abs(curr - d0[0]) < Math.abs(prev - d0[0]) ? curr : prev);
    var r = GaitCycle.reduce((prev, curr) => Math.abs(curr - d0[1]) < Math.abs(prev - d0[1]) ? curr : prev);
    d3.select(".brush").transition().call(event.target.move, [l,r].map(xScale))
    Dataset.forEach(dataObj => {
      updateChart( dataObj.data, dataObj.name, dataObj.mode)
    })
  });

const brushHandlePath = (d: any) => {
  var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = brushHeight / 2;
  return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + ","
  + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + ","
  + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8)
  + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
}


function createChart(data: Data[], name:string, mode:string) {
  var h = (mode == "line") ? lineHeight: areaHeight
  var svg = d3
    .select("#" + name)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", h + margin.top+margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")

  svg.append("g").attr("class", "y axis");

  svg
    .append("path")
    .attr("class", mode) // Assign a class for styling
    .attr("fill", (mode == "line")?"none":"steelblue")
    .attr("stroke", "steelblue");

  brushXScale.domain(d3.extent(data, (d) => d.x).map(x => x ?? 0))

  updateChart(data, name, mode);
}

// This function needs to be called to update the already prepared chart
const updateChart = (data: Data[], name: string, mode: string) => {
  var h = (mode == "line") ? lineHeight: areaHeight

  // prepare scale and axis
  var yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.y).map(y => y ?? 0)) // input
    .range([h, 0]); // output
  var xAxisGen = d3.axisBottom(brushXScale)
  var yAxisGen = (mode == "line") ? (d3.axisLeft(yScale))
    :(d3.axisLeft(yScale).ticks(2).tickValues([0,1]))

  // select chart svg
  var chartSvg = d3.select(`#${name} svg`);
  // region x/y axis
  chartSvg.select(".x.axis").call(xAxisGen as any); // TODO: fix type
  chartSvg.select(".y.axis").call(yAxisGen as any);

  chartSvg.append("defs")
    // region clip path
    .append("clipPath")
    .attr("id", "chart-path")
    // region clip rect
    .append("rect")
    .attr("width", width)
    .attr("height", h);

  chartSvg
    // region line/area
    .select(`.${mode}`)
    .datum(data)
    .transition()
    .attr("clip-path", "url(#chart-path)")
    .attr("fill", (mode == 'line') ? "none": "steelblue")
    .attr("d", (mode == 'line')?(
      d3.line<Data>()
        .x((d) => brushXScale(d.x))
        .y((d) => yScale(d.y))
    ):(
      d3.area<Data>()
      .x((d) => brushXScale(d.x))
      .y0(yScale(0))
      .y1((d) => yScale(d.y))
    ))
}

const createNav = (data: Data[]) => {
  xScale.domain(d3.extent(data, (d) => d.x).map(x => x ?? 0))
  const xAxisGen = d3
    .axisBottom(xScale)
    .ticks(GaitCycle.length, ",.3f")
    .tickValues(GaitCycle)
    .tickSize(-brushHeight)

  var navSvg = d3.select('#minimap')
    // region total svg
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", brushHeight + margin.top + 40)
    // region g
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var gBrush = navSvg
    // region brush
    .append("g")
    .attr('class', 'brush')
    .call(brush)


  gBrush
    // brushHandle
    .selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("cursor", "ew-resize")
    .attr("d", brushHandlePath);

  gBrush.call(brush.move, GaitCycle.slice(0,2).map(xScale))

  navSvg
    // region x axis
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${brushHeight})`)
    .call(xAxisGen)
    // region tick style
    .selectAll(".tick text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)");
}

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
      GaitCycle = csvGaitCycle.map(row => +(row.time ?? 0))
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
