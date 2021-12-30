import * as d3 from "d3";
import { IData } from "./Dataset";
import { layout, selectRange } from "./Draw.var";

export function createBoxChart(divSelector: string) {
  var svg = d3
    .select("#" + divSelector)
    .append("svg") // global chart svg w/h
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.boxWidth} ${layout.lineHeight}`)
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

  function update(data: IData[], first: boolean) {
    var dataCopy = [...data]; // HACK: copy before sort
    if (!first) {
      dataCopy = dataCopy.filter(
        (d) => d.x >= selectRange.cord.s && d.x <= selectRange.cord.e
      );
    }

    // process data
    var dataSorted = dataCopy.sort((a, b) => d3.ascending(a.y, b.y));
    var ySorted = dataSorted.map((d) => d.y);

    var q1 = d3.quantile(ySorted, 0.25) ?? 0;
    var median = d3.quantile(ySorted, 0.5) ?? 0;
    var q3 = d3.quantile(ySorted, 0.75) ?? 0;
    var interQuantileRange = q3 - q1;
    var lowerFence = q1 - 1.5 * interQuantileRange;
    var upperFence = q1 + 1.5 * interQuantileRange;

    var min = Math.min(...ySorted)
    var max = Math.max(...ySorted)

    var minScale = min - interQuantileRange/4;
    var maxScale = max + interQuantileRange/4;

    var yScale = d3
      .scaleLinear()
      .domain([minScale, maxScale])
      .range([layout.getLineHeight() - 20, 0]);

    svg.transition().call(d3.axisLeft(yScale));

    // a few features for the box
    var boxCenter = 60;
    var boxWidth = 25;

    // Show the main vertical line
    svg
      .select(".line__vert")
      .attr("x1", boxCenter)
      .attr("x2", boxCenter)
      .attr("y1", yScale(lowerFence))
      .attr("y2", yScale(upperFence))
      .attr("stroke", "black")
      .transition();

    // Show the box
    svg
      .select(".rect")
      .transition()
      .attr("x", boxCenter - boxWidth / 2)
      .attr("y", yScale(q3))
      .attr("height", yScale(q1) - yScale(q3))
      .attr("width", boxWidth);

    // Outlier
    gOutlier.select('.circle__min')
      .attr("r", 2)
      .attr("cx", boxCenter)
      .attr("cy", yScale(min))
      .attr("fill", "none")
      .attr("stroke", "black")

    gOutlier.select('.circle__max')
      .attr("r", 2)
      .attr("cx", boxCenter)
      .attr("cy", yScale(max))
      .attr("fill", "none")
      .attr("stroke", "black")

    gOutlier
      .select('.text__min')
      .attr("x", boxCenter + boxWidth * 2)
      .attr("y", yScale(min))
      .attr("font-size", "12px")
      .attr("transform", 'translate(0,5)')
      .attr("fill", "#000")
      .text(`${min.toFixed(2)}`)

    gOutlier
      .select('.text__max')
      .attr("x", boxCenter + boxWidth * 2)
      .attr("y", yScale(max))
      .attr("font-size", "12px")
      .attr("transform", 'translate(0,5)')
      .attr("fill", "#000")
      .text(`${max.toFixed(2)}`)

    // show median, min and max horizontal lines
    svg
      .select(".line__median")
      .datum(median)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black");

    svg
      .select('.text__median')
      .attr("x", boxCenter + boxWidth * 2)
      .attr("y", yScale(median))
      .attr("font-size", "12px")
      .attr("transform", 'translate(0,5)')
      .attr("fill", "#000")
      .text(`${median.toFixed(2)}`)

    svg
      .select(".line_lower")
      .datum(lowerFence)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black");

    svg
      .select('.text_lower')
      .attr("x", boxCenter - boxWidth*0.7)
      .attr("y", yScale(lowerFence))
      .attr("font-size", "12px")
      .attr("transform", 'translate(0,5)')
      .attr("fill", "#000")
      .text(`${lowerFence.toFixed(2)}`)

    svg
      .select(".line__upper")
      .datum(upperFence)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black");

    svg
      .select('.text__upper')
      .attr("x", boxCenter - boxWidth*0.7)
      .attr("y", yScale(upperFence))
      .attr("font-size", "12px")
      .attr("transform", 'translate(0,5)')
      .attr("fill", "#000")
      .text(`${upperFence.toFixed(2)}`)

  }
  return update;
}
