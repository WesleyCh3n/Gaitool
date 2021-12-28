import { FC, useRef, useEffect, RefObject } from 'react';
import * as d3 from 'd3';
import { Data }from './Dataset'
import { Dataset } from './Dataset.var';


var GaitCycle: number[] = []
var csvFiles = [
  "./2021-09-26-18-36_result_Dr Tsai_1.csv",
  "./2021-09-26-18-36_cycle_Dr Tsai_1.csv"
]

var margin = { top: 10, right: 50, bottom: 20, left: 50 };
var width = 800 - margin.left - margin.right;
var lineHeight = 150 - margin.top - margin.bottom;
var areaHeight = 80 - margin.top - margin.bottom;

var xScale = d3.scaleLinear().range([0, width]);
var brushXScale = d3.scaleLinear().range([0, width]);
var brushHeight = 50
var brush = d3
  .brushX()
  .extent([[0, 0], [width, brushHeight]])
  .on("brush", brushed)
  .on("end", brushend);

function brushed({selection}: {selection: any}) {
  var s = selection || xScale.range();
  var realMainDomain = s.map(xScale.invert, xScale);
  brushXScale.domain(realMainDomain);
  d3.selectAll(".handle--custom")
  .attr("display", null).attr("transform", function(_, i) { return "translate(" + [ s[i], - brushHeight / 4] + ")"; });
}

function brushend(event: any) {
  if (!event.sourceEvent || !event.selection) return;

  var d0 = event.selection.map(xScale.invert);
  var l = GaitCycle.reduce((prev, curr) =>
    Math.abs(curr - d0[0]) < Math.abs(prev - d0[0]) ? curr : prev);
  var r = GaitCycle.reduce((prev, curr) =>
    Math.abs(curr - d0[1]) < Math.abs(prev - d0[1]) ? curr : prev);
  d3.select(".brush").transition().call(event.target.move, [l,r].map(xScale))
  Dataset.forEach(_data => {
    updateChart(
      _data.data,
      _data.name,
      _data.mode
    )
  })
}

// This function is for the one time preparations
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

  var xlimit = d3.extent(data, (d) => d.x)
  brushXScale.domain([xlimit[0] ?? 0, xlimit[1] ?? 0])

  updateChart(data, name, mode);
}

// This function needs to be called to update the already prepared chart
function updateChart(data: Data[], name: string, mode: string) {
  var svg = d3.select("#" + name + " svg");
  var h = (mode == "line") ? lineHeight: areaHeight
  var ylimit = d3.extent(data, (d) => d.y)
  var yScale = d3
    .scaleLinear()
    .domain([ylimit[0]??0, ylimit[1]??0]) // input
    .range([h, 0]); // output

  var yAxisGen = (mode == "line") ? (
    d3.axisLeft(yScale)
  ):(
    d3.axisLeft(yScale).ticks(2).tickValues([0,1])
  )

  svg.append("defs")
    .append("clipPath")
    .attr("id", "chart-path")
    .append("rect")
    .attr("width", width)
    .attr("height", h);

  var xAxisGen = d3.axisBottom(brushXScale)
  svg.select(".x.axis")
    .call(xAxisGen as any); // TODO: fix type

  svg.select(".y.axis")
    .call(yAxisGen as any);

  svg
    .select(`.${mode}`)
    .datum(data)
    .transition()
    .attr("clip-path", "url(#chart-path)")
    .attr("fill", (mode == 'line') ? "none": "steelblue")
    .attr("d", (mode == 'line')?(
      d3.line<Data>().x((d) => xScale(d.x)).y((d) => yScale(d.y))
    ):(
      d3.area<Data>().x((d) => xScale(d.x)).y0(yScale(0)).y1((d) => yScale(d.y))
    ))
}

function createNav(data: Data[]) {
  var xlimit = d3.extent(data, (d) => d.x)
  xScale.domain([xlimit[0] ?? 0, xlimit[1] ?? 0])

  var svg = d3
    .select('#minimap')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", brushHeight + margin.top + 40)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var gBrush = svg
    .append("g")
    .attr('class', 'brush')
    .call(brush)
    // .call(brush.move, xScale.range());

    var brushResizePath = function(d: any) {
    var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = brushHeight / 2;
    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + ","
      + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + ","
      + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8)
      + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
  }

  gBrush.selectAll(".handle--custom")
  .data([{type: "w"}, {type: "e"}])
  .enter().append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("cursor", "ew-resize")
    .attr("d", brushResizePath);

  var xAxisGen = d3
    .axisBottom(xScale)
    .ticks(GaitCycle.length, ",.3f")
    .tickValues(GaitCycle)
    .tickSize(-brushHeight)

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + brushHeight + ")")
    .call(xAxisGen)
    .selectAll(".tick text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)");
}
const DrawChart: FC = () => {
  // https://mattclaffey.medium.com/adding-react-refs-to-an-array-of-items-96e9a12ab40c
  const xRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all(
      csvFiles.map(file => d3.csv(file))
    ).then(([result, cycle]) => {
      Dataset.forEach(_data => {
        result.forEach(row => {
          _data.data.push({
            x: +(row[_data.csvX] ?? 0),
            y: +(row[_data.csvY] ?? 0)
          })
        })
      })

      GaitCycle = cycle.map(row => +(row.time ?? 0))

      createNav(Dataset[0].data);
      Dataset.forEach(_data => {
        createChart(
          _data.data,
          _data.name,
          _data.mode
        )
      })
    })
  }, [])

  return(
    <div>
      <div id="accel_x"></div>
      {/* <div id="accel_y"></div>
        * <div id="accel_z"></div>
        * <div id="double_support"></div>
        * <div id="lt_single_support"></div>
        * <div id="rt_single_support"></div> */}
      <div id="minimap"></div>
    </div>
  )
}

export default DrawChart;
