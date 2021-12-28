import * as d3 from 'd3';
import { Data }from './Dataset'
import { Dataset, GaitCycle } from './Dataset.var';
import { margin, width, xScale, brushXScale, brushHeight } from './Draw.var'
import { updateChart } from './DrawLine'

export const createNav = (data: Data[]) => {
  xScale.domain(d3.extent(data, (d) => d.x).map(x => x ?? 0))
  const xAxisGen = d3
    .axisBottom(xScale)
    .ticks(GaitCycle.length, ",.3f")
    .tickValues(GaitCycle)
    .tickSize(-brushHeight)

  var navSvg = d3.select('#minimap')
    // region total svg
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", brushHeight + margin.top + 40)
    // region g
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var gBrush = navSvg
    // region brush
    .append("g")
    .attr('class', 'brush')
    .call(brush)


  gBrush
    // brushHandle
    .selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("cursor", "ew-resize")
    .attr("d", brushHandlePath);

  gBrush.call(brush.move, GaitCycle.slice(0,2).map(xScale))

  navSvg
    // region x axis
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${brushHeight})`)
    .call(xAxisGen)
    // region tick style
    .selectAll(".tick text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)");
}

var brush = d3
  .brushX()
  .extent([[0, 0], [width, brushHeight]])
  .on("brush", (event: any) => {
    if (!event.selection) return;
    var s = event.selection;
    brushXScale.domain(s.map(xScale.invert));
    d3.selectAll(".handle--custom")
      .attr("display", null)
      .attr("transform", (_, i) => `translate(${s[i]}, ${-brushHeight/4})`);
  })
  .on("end", (event: any) => {
    if (!event.selection) {
      d3.selectAll(".handle--custom").attr("display", "none")
      return
    }
    if (!event.sourceEvent) return
    var d0 = event.selection.map(xScale.invert);
    var l = GaitCycle.reduce((prev, curr) => Math.abs(curr - d0[0]) < Math.abs(prev - d0[0]) ? curr : prev);
    var r = GaitCycle.reduce((prev, curr) => Math.abs(curr - d0[1]) < Math.abs(prev - d0[1]) ? curr : prev);
    d3.select(".brush").transition().call(event.target.move, [l,r].map(xScale))
    Dataset.forEach(dataObj => {
      updateChart( dataObj.data, dataObj.name, dataObj.mode)
    })
  });

const brushHandlePath = (d: any) => {
  var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = brushHeight / 2;
  return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + ","
  + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + ","
  + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8)
  + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
}
