import * as d3 from 'd3';
import { Data }from './Dataset'
import { margin, width, areaHeight, lineHeight, xScale } from './Draw.var'

export const createChart = (data: Data[], name:string, mode:string) => {
  var h = (mode == "line") ? lineHeight: areaHeight
  var svg = d3.select("#" + name)
    .append("svg") // global chart svg w/h
      .attr("width", width + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
    .append("g") // workground group
      .attr("transform", `translate(${margin.left} ,${margin.top})`);

  svg.append("g") // x axis group
      .attr("class", "axis axis__x")
      .attr("transform", `translate(0, ${h})`)

  svg.append("g") // y axis group
      .attr("class", "axis axis__y");

  svg.append("path") // line path group
      .attr("class", mode) // Assign a class for styling
      .attr("fill", (mode == "line") ? "none" : "steelblue")
      .attr("stroke", "steelblue");

  xScale.domain(d3.extent(data, (d) => d.x).map(x => x ?? 0))

  updateChart(data, name, mode);
}

export const updateChart = (data: Data[], name: string, mode: string) => {
  var h = (mode == "line") ? lineHeight: areaHeight

  // prepare scale
  var yScale = d3.scaleLinear().range([h, 0])
    .domain(d3.extent(data, (d) => d.y).map(y => y ?? 0))

  // prepare axisGen
  var xAxisGen = d3.axisBottom(xScale)
  var yAxisGen = (mode == "line") ? (d3.axisLeft(yScale))
    :(d3.axisLeft(yScale).ticks(2).tickValues([0,1]))

  // select chart svg
  var chartSvg = d3.select(`#${name} svg`);
  // region x/y axis
  chartSvg.select(".axis__x").call(xAxisGen as any); // TODO: fix type
  chartSvg.select(".axis__y").call(yAxisGen as any); // TODO: fix type

  chartSvg.append("defs") // region clip path
    .append("clipPath")
      .attr("id", "chart-path")
    .append("rect") // region clip rect
      .attr("width", width)
      .attr("height", h);

  chartSvg.select(`.${mode}`) // region line/area
    .datum(data)
    .transition()
    .attr("clip-path", "url(#chart-path)")
    .attr("fill", (mode == 'line') ? "none": "steelblue")
    .attr("d", (mode == 'line')?(
      d3.line<Data>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
    ):(
      d3.area<Data>()
      .x((d) => xScale(d.x))
      .y0(yScale(0))
      .y1((d) => yScale(d.y))
    ))

    var tooltipGroup = chartSvg.append("g")
      .attr("class", "tooltip__group")
      .style("display", "none");

    tooltipGroup.append("circle")
      .attr("fill", "steelblue")
      .attr("r", 5);

    tooltipGroup.append("rect")
      .attr("class", "tooltip")
      .attr("fill", "white")
      .attr("stroke", "#000")
      .attr("width", 100)
      .attr("height", 50)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4);

    tooltipGroup.append("text")
      .attr("class", "tooltip-x")
      .attr("x", 18)
      .attr("y", -2);

    tooltipGroup.append("text")
      .attr("class", "tooltip-y")
      .attr("x", 18)
      .attr("y", 18);

    const bisectX = d3.bisector((d: Data) => d.x).center
    chartSvg.append("rect")
      .attr("class", "overlay")
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("width", width)
      .attr("height", lineHeight)
      .attr("transform", `translate(${margin.left} ,${margin.top})`)
      .on("mouseover", function() { tooltipGroup.style("display", null); })
      .on("mouseout", function() { tooltipGroup.style("display", "none"); })
      .on("mousemove", (event: any) => {
        var x0 = xScale.invert(d3.pointer(event)[0]),
            i  = bisectX(data, x0),
            d0 = data[i - 1],
            d1 = data[i]
        if (!d0 || !d1) return
        var d  = ((x0 - d0.x) > (d1.x - x0)) ? d1 : d0;
        tooltipGroup.attr("transform", `translate(${xScale(d.x)+margin.left}, ${yScale(d.y)+margin.top})`);
        tooltipGroup.select(".tooltip-x").text(`x: ${d.x}`);
        tooltipGroup.select(".tooltip-y").text(`y: ${d.y.toFixed(4)}`);
      });
}
