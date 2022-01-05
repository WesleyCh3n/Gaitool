import * as d3 from "d3";
import { RefObject } from "react";
import { IData, ICycle, IBoxResult, layout } from "./";

export function createBoxChart(
  ref: RefObject<HTMLDivElement>,
  dataPreprocess: (data: IData[], cycle: ICycle) => IBoxResult
) {
  var svg = d3
    .select(ref.current)
    .append("svg") // global chart svg w/h
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.boxWidth} ${layout.boxHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l} ,${layout.margin.t})`);

  svg.append("line").attr("class", "line__vert").attr("stroke", "black");

  svg
    .append("rect")
    .attr("class", "rect")
    .attr("stroke", "black")
    .style("fill", "#69b3a2");

  var gMedian = svg.append("g").attr("class", "g__median");
  gMedian.append("line").attr("class", "line__median");
  gMedian.append("text").attr("class", "text__median");

  var gFence = svg.append("g").attr("class", "g__lower");
  gFence.append("line").attr("class", "line_lower");
  gFence.append("text").attr("class", "text_lower");
  gFence.append("line").attr("class", "line__upper");
  gFence.append("text").attr("class", "text__upper");

  var gOutlier = svg.append("g").attr("class", "g__outlier");
  gOutlier.append("circle").attr("class", "circle__min");
  gOutlier.append("circle").attr("class", "circle__max");
  gOutlier.append("text").attr("class", "text__min");
  gOutlier.append("text").attr("class", "text__max");

  svg.append("g").attr("class", "line_horz")

  svg.append("g").attr("class", "text__left");
  svg.append("g").attr("class", "text__right");

  function update(data: IData[], cycle: ICycle) {
    var dataCopy = [...data]; // HACK: copy before sort

    // process data
    const result = dataPreprocess(dataCopy, cycle);

    var minScale = result.min - result.IQR / 4;
    var maxScale = result.max + result.IQR / 4;

    var yScale = d3
      .scaleLinear()
      .domain([minScale, maxScale])
      .range([layout.getBoxHeight(), 0]);

    svg
      .transition()
      .call(d3.axisLeft(yScale))
      .selectAll(".tick text")
      .attr("font-size", "15px");

    // a few features for the box
    var boxCenter = 60;
    var boxWidth = 25;

    // Show the main vertical line
    svg
      .select(".line__vert")
      .attr("x1", boxCenter)
      .attr("x2", boxCenter)
      .attr("y1", yScale(result.min))
      .attr("y2", yScale(result.max))
      .attr("stroke", "black")
      .transition();

    // Show the box
    svg
      .select(".rect")
      .transition()
      .attr("x", boxCenter - boxWidth / 2)
      .attr("y", yScale(result.q3))
      .attr("height", yScale(result.q1) - yScale(result.q3))
      .attr("width", boxWidth);

    svg
      .select(".line_horz")
      .selectAll("line")
      .data([result.min, result.max, result.median])
      .join(
        (enter) => enter.append("line").attr("stroke", "black"),
        (update) => update.transition()
      )
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d));

    svg
      .select(".text__right")
      .selectAll("text")
      .data([result.min, result.max, result.median])
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("fill", "#000")
            .attr("y", (d) => yScale(d)+3)
            .text((d) => `${d.toFixed(2)}`),
        (update) =>
          update.attr("y", (d) => yScale(d)).text((d) => `${d.toFixed(2)}`)
      )
      .attr("x", boxCenter + boxWidth * 0.7)
      .attr("text-anchor", "start")
      .attr("font-size", "16px");

    svg
      .select(".text__left")
      .selectAll("text")
      .data([result.q1, result.q3])
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("fill", "#000")
            .attr("y", (d) => yScale(d))
            .text((d) => `${d.toFixed(2)}`),
        (update) =>
          update.attr("y", (d) => yScale(d)).text((d) => `${d.toFixed(2)}`)
      )
      .attr("x", boxCenter - boxWidth * 0.7)
      .attr("font-size", "16px");
  }
  return update;
}
