import * as d3 from "d3";
import { RefObject } from "react";

import { IData, layout } from ".";

export function createLineChart(ref: RefObject<SVGSVGElement>) {
  const svg = d3
    .select(ref.current)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.width} ${layout.lineHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l} ,${layout.margin.t})`)
    .attr("class", "workspace");

  svg
    .append("g") // x axis group
    .attr("class", "axis axis__x")
    .attr("transform", `translate(0, ${layout.getLineHeight()})`);

  svg
    .append("g") // y axis group
    .attr("class", "axis axis__y");

  svg
    .append("path") // line path group
    .attr("class", "line") // Assign a class for styling
    .attr("fill", "none")
    .attr("stroke", "steelblue");

  svg
    .append("defs") // region clip path
    .append("clipPath")
    .attr("id", "chart-path")
    .attr("fill", "none")
    .append("rect") // region clip rect
    .attr("fill", "none")
    .attr("width", layout.getWidth())
    .attr("height", layout.getLineHeight());

  const tooltipGroup = svg
    .append("g")
    .attr("class", "tooltip__group")
    .style("display", "none");

  tooltipGroup.append("circle").attr("fill", "black").attr("r", 2);

  tooltipGroup
    .append("rect")
    .attr("class", "tooltip")
    .attr("fill", "rgba(0,0,0,0.7)")
    .attr("stroke", "none")
    .attr("width", 80)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", -22)
    .attr("rx", 5);

  tooltipGroup
    .append("text")
    .attr("class", "tooltip-x")
    .attr("fill", "#fff")
    .attr("x", 18)
    .attr("y", -2);

  tooltipGroup
    .append("text")
    .attr("class", "tooltip-y")
    .attr("fill", "#fff")
    .attr("x", 18)
    .attr("y", 18);

  tooltipGroup
    .append("path") // create vertical line to follow mouse
    .attr("class", "mouse-line")
    .attr("d", `M 0 0 V ${layout.getLineHeight()}`)
    .attr("stroke", "#303030")
    .attr("stroke-width", 2)
    .style("stroke-dasharray", "3, 3")
    .attr("opacity", "0");

  const bisectX = d3.bisector((d: IData) => d.x).center;
  const tooltipOverlay = svg
    .append("rect")
    .attr("class", "overlay")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("width", layout.getWidth())
    .attr("height", layout.getLineHeight());

  tooltipOverlay
    .on("mouseover", function () {
      tooltipGroup.style("display", null);
    })
    .on("mouseout", function () {
      tooltipGroup.style("display", "none");
    });

  // prepare scale
  const xScale = d3.scaleLinear().range([0, layout.getWidth()]);
  const yScale = d3.scaleLinear().range([layout.getLineHeight(), 0]);

  function update(data: IData[], range?: [number, number]) {
    if (range) {
      xScale.domain(range);
    } else {
      xScale.domain(d3.extent(data, (d) => d.x).map((x) => x ?? 0));
    }
    yScale.domain(d3.extent(data, (d) => d.y).map((y) => y ?? 0));

    // prepare axisGen
    var xAxisGen = d3.axisBottom(xScale);
    var yAxisGen = d3.axisLeft(yScale);

    // region x/y axis
    svg
      .select(".axis__x")
      .call(xAxisGen as any) // TODO: fix type
      .selectAll(".tick text")
      .attr("font-size", "15");
    svg
      .select(".axis__y")
      .call(yAxisGen as any) // TODO: fix type
      .selectAll(".tick text")
      .attr("font-size", "15");

    svg
      .select(".line") // region line/area
      .datum(data)
      .attr("clip-path", "url(#chart-path)")
      .transition()
      .attr(
        "d",
        d3
          .line<IData>()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y))
      );

    tooltipOverlay.on("mousemove", (event: any) => {
      // find closest data coordinate
      const x0 = xScale.invert(d3.pointer(event)[0]),
        i = bisectX(data, x0),
        d0 = data[i - 1],
        d1 = data[i];
      if (!d0 || !d1) return;
      const closestCord = x0 - d0.x > d1.x - x0 ? d1 : d0;
      tooltipGroup.attr(
        "transform",
        `translate(${xScale(closestCord.x)}, ${yScale(closestCord.y)})`
      );
      tooltipGroup.select(".tooltip-x").text(`x: ${closestCord.x}`);
      tooltipGroup.select(".tooltip-y").text(`y: ${closestCord.y.toFixed(3)}`);
      tooltipGroup
        .select(".mouse-line")
        .attr("opacity", "1")
        .attr("transform", `translate(0, ${-yScale(closestCord.y)})`);
    });
  }
  return update;
}
