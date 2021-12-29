import * as d3 from 'd3';
import { Data }from './Dataset'
import { Dataset, GaitCycle } from './Dataset.var';
import { margin, width, xScaleNav, xScale, brushHeight } from './Draw.var'
import { updateChart } from './DrawLine'
import { findClosestIndex } from '../../utils/utils'

export function createNav(data: Data[]) {
  xScaleNav.domain(d3.extent(data, (d) => d.x).map(x => x ?? 0))
  const xAxisGen = d3.axisBottom(xScaleNav)
    .ticks(GaitCycle.length, ",.3f")
    .tickValues(GaitCycle)
    .tickSize(-brushHeight)

  const navSvg = d3.select('#minimap')
    .append("svg") // global chart svg w/h
      .attr("width", width + margin.left + margin.right)
      .attr("height", brushHeight + margin.top + 40)
    .append("g") // workground group
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const gBrush = navSvg.append("g") // region brush
    .attr('class', 'brush')
    .call(brush)

  gBrush.selectAll(".handle__custom") // brushHandle
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
      .attr("class", "handle__custom")
      .attr("stroke", "#000")
      .attr("cursor", "ew-resize")
      .attr("d", brushHandlePath);

  gBrush.call(brush.move, GaitCycle.slice(0,2).map(xScaleNav))

  navSvg.append("g") // region x axis
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${brushHeight})`)
      .call(xAxisGen)
    .selectAll(".tick text") // region tick style
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-40)");
}

const brush = d3.brushX()
  .extent([[0, 0], [width, brushHeight]])
  .on("brush", (event: any) => {
    if (!event.selection) return;
    var s = event.selection;
    xScale.domain(s.map(xScaleNav.invert));
    d3.selectAll(".handle__custom")
      .attr("display", null)
      .attr("transform", (_, i) => `translate(${s[i]}, ${-brushHeight/4})`);
  })
  .on("end", (event: any) => {
    if (!event.selection) {
      d3.selectAll(".handle__custom").attr("display", "none")
    } else if (!event.sourceEvent) {
      return
    }
    var d0 = event.selection.map(xScaleNav.invert);
    var d1 = d0.map((x: any) => GaitCycle[findClosestIndex(GaitCycle, x)])
    d3.select(".brush").transition().call(event.target.move, d1.map(xScaleNav))
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
