import * as d3 from "d3";
import { IUpdateFunc } from "./Dataset";
import { layout, xScaleNav, xScale } from "./Draw.var";
import { findClosestIndex } from "../../utils/utils";

export function createGaitNav(
  gaitCycle: number[],
  xDomain: number[],
  updateLists: IUpdateFunc[]
) {
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [layout.getWidth(), layout.getNavTickHeight()],
    ])
    .on("brush", (event: any) => {
      if (!event.selection) return;
      var s = event.selection;
      xScale.domain(s.map(xScaleNav.invert));
      d3.selectAll(".handle__custom")
        .attr("display", null)
        .attr(
          "transform",
          (_, i) => `translate(${s[i]}, ${-layout.getNavTickHeight() / 4})`
        );
    })
    .on("end", (event: any) => {
      if (!event.sourceEvent){
        return;
      } else if (!event.selection) {
        d3.selectAll(".handle__custom").attr("display", "none");
      } else {
        var d0 = event.selection.map(xScaleNav.invert);
        var d1 = d0.map((x: any) => gaitCycle[findClosestIndex(gaitCycle, x)]);
        d3.select(".brush")
          .transition()
          .call(event.target.move, d1.map(xScaleNav));
        xScale.domain(d1);
      }
      updateLists.forEach((el) => {
        el.func(el.data, false)
      });
    });

  xScaleNav.domain(xDomain);
  const xAxisGen = d3
    .axisBottom(xScaleNav)
    .ticks(gaitCycle.length, ",.3f")
    .tickValues(gaitCycle)
    .tickSize(-layout.getNavTickHeight());

  const navSvg = d3
    .select("#minimap")
    .append("svg") // global chart svg w/h
    // .attr("width", layout.width)
    // .attr("height", layout.navHeight)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.width} ${layout.lineHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l}, ${layout.margin.t})`);

  const gBrush = navSvg
    .append("g") // region brush
    .attr("class", "brush")
    .call(brush);

  gBrush
    .selectAll(".handle__custom") // brushHandle
    .data([{ type: "w" }, { type: "e" }])
    .enter()
    .append("path")
    .attr("class", "handle__custom")
    .attr("stroke", "#000")
    .attr("stroke-width", "1.5")
    .attr("cursor", "ew-resize")
    .attr("d", brushHandlePath);

  // gBrush.call(brush.move, gaitCycle.slice(0, 2).map(xScaleNav));
  // gBrush.call(brush.move, xScaleNav.range());

  navSvg
    .append("g") // region x axis
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${layout.getNavTickHeight()})`)
    .call(xAxisGen)
    .selectAll(".tick text") // region tick style
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-40)");
}

const brushHandlePath = (d: any) => {
  var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = layout.getNavTickHeight() / 2;
  return ( "M" + 0.5 * x + "," + y + "A6,6 0 0 " + e + " " + 6.5 * x + "," +
    (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + 0.5 * x + "," +
    2 * y + "Z" + "M" + 2.5 * x + "," + (y + 8) + "V" + (2 * y - 8) + "M" +
    4.5 * x + "," + (y + 8) + "V" + (2 * y - 8));
};
