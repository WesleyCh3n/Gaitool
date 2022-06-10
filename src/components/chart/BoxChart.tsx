import * as d3 from "d3";
import { RefObject } from "react";
import { IBoxResult, layout } from "./";

export function createBoxChart(ref: RefObject<SVGSVGElement>) {
  var svg = d3
    .select(ref.current)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.boxWidth} ${layout.boxHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l} ,${layout.margin.t})`);

  svg.append("rect").attr("class", "boxplot-rect");
  svg.append("g").attr("class", "boxplot-line-vert");
  svg.append("g").attr("class", "boxplot-line-horz");
  svg.append("g").attr("class", "boxplot-text-left");
  svg.append("g").attr("class", "boxplot-text-right");

  function update(data: number[]) {
    const result = IQR(data);

    var minScale = result.min - result.IQR / 4;
    var maxScale = result.max + result.IQR / 4;

    var yScale = d3
      .scaleLinear()
      .domain([minScale, maxScale])
      .range([layout.getBoxHeight(), 0]);

    // axis text
    svg
      .transition()
      .attr("class", "boxplot-axis")
      .call(d3.axisLeft(yScale).ticks(5));

    // a few features for the box
    var boxCenter = 85;
    var boxWidth = 25;

    // Show the main vertical line
    svg
      .select(".boxplot-line-vert")
      .selectAll("line")
      .attr("class", "boxplot-line")
      .data([result])
      .join(
        (enter) => enter.append("line"),
        (update) =>
          update
            .attr("y1", (d) => yScale(d.min))
            .attr("y2", (d) => yScale(d.max))
            .transition(),
        (exit) => exit.remove()
      )
      .attr("x1", boxCenter)
      .attr("x2", boxCenter);

    // Show the box
    svg
      .select(".boxplot-rect")
      .transition()
      .attr("x", boxCenter - boxWidth / 2)
      .attr("y", yScale(result.q3))
      .attr("height", yScale(result.q1) - yScale(result.q3))
      .attr("width", boxWidth);

    svg
      .select(".boxplot-line-horz")
      .selectAll("line")
      .attr("class", "boxplot-line")
      .data([result.min, result.max, result.median])
      .join(
        (enter) => enter.append("line"),
        (update) =>
          update
            .attr("y1", (d) => yScale(d))
            .attr("y2", (d) => yScale(d))
            .transition(),
        (exit) => exit.remove()
      )
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2);

    svg
      .select(".boxplot-text-right")
      .selectAll("text")
      .attr("class", "boxplot-text")
      .data([result.min, result.max, result.median])
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("y", (d) => yScale(d) + 3)
            .text((d) => `${d.toFixed(2)}`),
        (update) =>
          update
            .attr("y", (d) => yScale(d) + 3)
            .text((d) => `${d.toFixed(2)}`)
            .transition(),
        (exit) => exit.remove()
      )
      .attr("x", boxCenter + boxWidth * 0.7)
      .attr("text-anchor", "start");

    // the left texts
    svg
      .select(".boxplot-text-left")
      .selectAll("text")
      .attr("class", "boxplot-text")
      .data([result.q1, result.q3])
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("y", (d) => yScale(d))
            .text((d) => `${d.toFixed(2)}`),
        (update) =>
          update
            .attr("y", (d) => yScale(d))
            .text((d) => `${d.toFixed(2)}`)
            .transition(),
        (exit) => exit.remove()
      )
      .attr("x", boxCenter - boxWidth * 0.7);
  }
  return update;
}

const IQR = (array: number[]): IBoxResult => {
  const sortedArray = [...array].sort((a, b) => d3.ascending(a, b));

  const q1 = d3.quantile(sortedArray, 0.25) ?? 0;
  const median = d3.quantile(sortedArray, 0.5) ?? 0;
  const q3 = d3.quantile(sortedArray, 0.75) ?? 0;

  const IQR = q3 - q1;

  const lowerIQR = q1 - 1.5 * IQR;
  const upperIQR = q3 + 1.5 * IQR;

  return {
    min: isFinite(Math.min(...sortedArray)) ? Math.min(...sortedArray) : 0,
    max: isFinite(Math.max(...sortedArray)) ? Math.max(...sortedArray) : 0,

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  };
};
