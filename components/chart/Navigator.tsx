import * as d3 from "d3";
import { RefObject } from "react";
import { IData, IUpdateList, layout, xScale, selectRange } from "./";
import { findClosestIndex } from "../../utils/utils";

export function createGaitNav(
  ref: RefObject<HTMLDivElement>,
  xDomain: number[],
) {
  const navSvg = d3
    .select(ref.current)
    .append("svg") // global chart svg w/h
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.width} ${layout.lineHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l}, ${layout.margin.t})`);

  var xScaleNav = d3.scaleLinear().range([0, layout.getWidth()]);
  var yScale = d3.scaleLinear().range([layout.getNavTickHeight(), 0]);
  xScaleNav.domain(xDomain);

  const xAxisGen = d3
    .axisBottom(xScaleNav)
    .tickSize(-layout.getNavTickHeight())

  const xAxisG = navSvg
    .append("g") // region x axis
    .attr("class", "axis__x")
    .attr("transform", `translate(0, ${layout.getNavTickHeight()})`)

  navSvg
    .selectAll(".axis line")
    .attr("stroke", "#566573")
    .attr("stroke-width", "3px");

  navSvg
    .append("path") // line path group
    .attr("class", "line__indicate") // Assign a class for styling
    .attr("fill", "none")
    .attr("stroke", "rgba(70, 130, 180, 0.5)")

  const gBrush = navSvg
    .append("g") // region brush
    .attr("class", "brush")


  function update(updateLists: IUpdateList[], data: IData[], first: boolean, gaitCycle: number[]) {
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
        if (!event.sourceEvent) {
          return;
        } else if (!event.selection) {
          d3.selectAll(".handle__custom").attr("display", "none");
        } else {
          var d0 = event.selection.map(xScaleNav.invert);
          let rangeIndex = d0.map((x: any) => findClosestIndex(gaitCycle, x));
          let rangeValue = d0.map(
            (x: any) => gaitCycle[findClosestIndex(gaitCycle, x)]
          );
          d3.select(".brush")
            .transition()
            .call(event.target.move, rangeValue.map(xScaleNav));
          xScale.domain(rangeValue);

          // store current scale
          selectRange.index = { s: rangeIndex[0], e: rangeIndex[1] };
          selectRange.value = { s: rangeValue[0], e: rangeValue[1] };
        }
        updateLists.forEach((el) => {
          if (el.cycle) {
            el.func(el.data, false, el.cycle);
          } else {
            el.func(el.data, false);
          }
        });
      });

      xAxisG
        .call(xAxisGen.ticks(gaitCycle.length, ",.3f").tickValues(gaitCycle))
        .selectAll(".tick text") // region tick style
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-40)");

    if (data) {
      yScale.domain(d3.extent(data, (d) => d.y).map((y) => y ?? 0));
      let lineGen = d3
            .line<IData>()
            .x((d) => xScaleNav(d.x))
            .y((d) => yScale(d.y))
      d3.select(".line__indicate")
        .datum(data)
        .transition()
        .attr( "d", lineGen);
    }

    // brush and handle
    gBrush.call(brush);

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

      if (first) {
        gBrush.call(brush.move, xScaleNav.range());
      }
  }

  // gBrush.call(brush.move, gaitCycle.slice(0, 2).map(xScaleNav));
  return update;
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
