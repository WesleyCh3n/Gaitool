import * as d3 from 'd3';
import { Data }from './Dataset'
import { margin, width, areaHeight, lineHeight, brushXScale } from './Draw.var'

export const createChart = (data: Data[], name:string, mode:string) => {
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

export const updateChart = (data: Data[], name: string, mode: string) => {
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
