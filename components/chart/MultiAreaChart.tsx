import * as d3 from "d3";
import { IData, IDatasetInfo } from "./Dataset";
import { layout, xScale } from "./Draw.var";

export function createMultiAreaChart(divSelector: string) {
  var svg = d3
    .select("#" + divSelector)
    .append("svg") // global chart svg w/h
    .attr("width", layout.width)
    .attr("height", layout.areaHeight)
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
        .attr("class", el.name)
        .datum(el.data)
        .transition()
        .attr("clip-path", "url(#chart-path)")
        .attr("fill", colorScale(el.name) as string)
        .attr(
          "d",
          d3
            .area<IData>()
            .x((d) => xScale(d.x))
            .y0(yScale(0))
            .y1((d) => yScale(d.y))
        );
    });

{/*     var source = svg
  *       .selectAll(".area") // region line/area
  *       .data(data)
  *       .enter()
  *       .append("g")
  *       .attr("class", (d) => `area ${d.name}`)
  *
  *     source
  *       .append("path")
  *       .transition()
  *       .attr("clip-path", "url(#chart-path)")
  *       .attr("d", (d) =>
  *         d3
  *           .area<IData>()
  *           .x((_d) => xScale(_d.x))
  *           .y0(yScale(0))
  *           .y1((_d) => yScale(_d.y))(d.data)
  *       )
  *       .attr("fill", (d) => colorScale(d.name) as string); */}

    {
      /*
       *   var tooltipGroup = chartSvg
       *     .append("g")
       *     .attr("class", "tooltip__group")
       *     .style("display", "none");
       *
       *   tooltipGroup.append("circle").attr("fill", "steelblue").attr("r", 5);
       *
       *   tooltipGroup
       *     .append("rect")
       *     .attr("class", "tooltip")
       *     .attr("fill", "white")
       *     .attr("stroke", "#000")
       *     .attr("width", 100)
       *     .attr("height", 50)
       *     .attr("x", 10)
       *     .attr("y", -22)
       *     .attr("rx", 5)
       *     .attr("ry", 10);
       *
       *   tooltipGroup
       *     .append("text")
       *     .attr("class", "tooltip-x")
       *     .attr("x", 18)
       *     .attr("y", -2);
       *
       *   tooltipGroup
       *     .append("text")
       *     .attr("class", "tooltip-y")
       *     .attr("x", 18)
       *     .attr("y", 18);
       *
       *   const bisectX = d3.bisector((d: IData) => d.x).center;
       *   chartSvg
       *     .append("rect")
       *     .attr("class", "overlay")
       *     .attr("fill", "none")
       *     .attr("pointer-events", "all")
       *     .attr("width", layout.getWidth())
       *     .attr("height", layout.getAreaHeight())
       *     .attr("transform", `translate(${layout.margin.l} ,${layout.margin.t})`)
       *     .on("mouseover", function () {
       *       tooltipGroup.style("display", null);
       *     })
       *     .on("mouseout", function () {
       *       tooltipGroup.style("display", "none");
       *     })
       *     .on("mousemove", (event: any) => {
       *       var x0 = xScale.invert(d3.pointer(event)[0]),
       *         i = bisectX(data, x0),
       *         d0 = data[i - 1],
       *         d1 = data[i];
       *       if (!d0 || !d1) return;
       *       var d = x0 - d0.x > d1.x - x0 ? d1 : d0;
       *       tooltipGroup.attr(
       *         "transform",
       *         `translate(
       *           ${xScale(d.x) + layout.margin.l}, ${yScale(d.y) + layout.margin.t})`
       *       );
       *       tooltipGroup.select(".tooltip-x").text(`x: ${d.x}`);
       *       tooltipGroup.select(".tooltip-y").text(`y: ${d.y.toFixed(4)}`);
       *     }); */
    }
  }
  return update;
}
