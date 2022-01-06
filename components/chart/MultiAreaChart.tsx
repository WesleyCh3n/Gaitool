import * as d3 from "d3";
import { IData, IDatasetInfo, layout } from "./";

{/* var multiFunc = createMultiAreaChart("double_support");
  * multiFunc(dataSchema.slice(-3), true);
  * updateLists.push({
  *   data: dataSchema.slice(-3),
  *   func: multiFunc,
  * }); */}

export function createMultiAreaChart(divSelector: string) {
  var svg = d3
    .select("#" + divSelector)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.width} ${layout.areaHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l} ,${layout.margin.t})`);

  svg
    .append("g") // x axis group
    .attr("class", "axis axis__x")
    .attr("transform", `translate(0, ${layout.getAreaHeight()})`);

  svg
    .append("g") // y axis group
    .attr("class", "axis axis__y");

  svg
    .append("g") // line path group
    .attr("class", "area") // Assign a class for styling

  function update(data: IDatasetInfo[], first: boolean) {
    var xScale = d3.scaleLinear().range([0, layout.getWidth()]);
    if (first) {
      xScale.domain(d3.extent(data[0].data, (d) => d.x).map((x) => x ?? 0));
    }
    // prepare scale
    var yScale = d3
      .scaleLinear()
      .range([layout.getAreaHeight(), 0])
      .domain([0, 1]);

    var colorScale = d3
      .scaleOrdinal()
      .domain(["double_support", "rt_single_support", "lt_single_support"])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // prepare axisGen
    var xAxisGen = d3.axisBottom(xScale);
    var yAxisGen = d3.axisLeft(yScale).ticks(2).tickValues([0, 1]);
    // region x/y axis
    svg.select(".axis__x").call(xAxisGen as any); // TODO: fix type
    svg.select(".axis__y").call(yAxisGen as any); // TODO: fix type

    svg
      .append("defs") // region clip path
      .append("clipPath")
      .attr("id", "chart-path")
      .append("rect") // region clip rect
      .attr("width", layout.getWidth())
      .attr("height", layout.getAreaHeight());

    data.forEach((el) => {
      svg
        .select(".area") // region line/area
        .append('path')
        // .attr("class", el.name)
        .datum(el.data)
        .transition()
        .attr("clip-path", "url(#chart-path)")
        // .attr("fill", colorScale(el.name) as string)
        .attr(
          "d",
          d3
            .area<IData>()
            .x((d) => xScale(d.x))
            .y0(yScale(0))
            .y1((d) => yScale(d.y))
        );
    });
  }
  return update;
}
