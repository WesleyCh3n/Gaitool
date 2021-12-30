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
    .attr(
      "transform",
      `translate(${layout.margin.l} ,${layout.margin.t})`
    );

    svg
      .append("line")
      .attr('class', 'line__vert')
      .attr("stroke", "black")

    svg
      .append("rect")
      .attr('class', 'rect')
      .attr("stroke", "black")
      .style("fill", "#69b3a2")

    svg
      .append("line")
      .attr('class', 'line__median')

    svg
      .append("line")
      .attr('class', 'line__min')

    svg
      .append("line")
      .attr('class', 'line__max')

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
    var min = q1 - 1.5 * interQuantileRange;
    var max = q1 + 1.5 * interQuantileRange;

    var minScale = min - 1
    var maxScale = max + 1

    var yScale = d3
      .scaleLinear()
      .domain([minScale, maxScale])
      .range([layout.getLineHeight()-20, 0]);

    svg.transition().call(d3.axisLeft(yScale));

    // a few features for the box
    var boxCenter = 40;
    var boxWidth = 25;

    // Show the main vertical line
    svg
      .select('.line__vert')
      .attr("x1", boxCenter)
      .attr("x2", boxCenter)
      .attr("y1", yScale(min))
      .attr("y2", yScale(max))
      .attr("stroke", "black")
      .transition()

    // Show the box
    svg
      .select(".rect")
      .transition()
      .attr("x", boxCenter - boxWidth / 2)
      .attr("y", yScale(q3))
      .attr("height", yScale(q1) - yScale(q3))
      .attr("width", boxWidth)

    // show median, min and max horizontal lines
    svg.select('.line__median')
      .datum(median)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black")

  svg.select('.line__min')
      .datum(min)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black")

  svg.select('.line__max')
      .datum(max)
      .transition()
      .attr("x1", boxCenter - boxWidth / 2)
      .attr("x2", boxCenter + boxWidth / 2)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "black")
  }
  return update;
}
