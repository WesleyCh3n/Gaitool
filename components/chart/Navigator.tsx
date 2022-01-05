import * as d3 from "d3";
import { RefObject } from "react";
import { IData, IUpdateList, ICycle, layout } from "./";
import { findClosestIndex } from "../../utils/utils";

export function createGaitNav(ref: RefObject<HTMLDivElement>) {
  const navSvg = d3
    .select(ref.current)
    .append("svg") // global chart svg w/h
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${layout.width} ${layout.navHeight}`)
    .append("g") // workground group
    .attr("transform", `translate(${layout.margin.l}, ${layout.margin.t})`);

  var xScaleNav = d3.scaleLinear().range([0, layout.getWidth()]);
  var yScale = d3.scaleLinear().range([layout.getNavTickHeight(), 0]);

  const xAxisG = navSvg
    .append("g") // region x axis
    .attr("class", "axis__x")
    .attr("transform", `translate(0, ${layout.getNavTickHeight()})`);

  navSvg
    .selectAll(".axis line")
    .attr("stroke", "#566573")
    .attr("stroke-width", "3px");

  const lineG = navSvg
    .append("path") // line path group
    .attr("class", "line__indicate") // Assign a class for styling
    .attr("fill", "none")
    .attr("stroke", "rgba(70, 130, 180, 0.5)");

  const gBrush = navSvg
    .append("g") // region brush
    .attr("class", "brush");

  function update(updateLists: IUpdateList[], data: IData[], cycle: ICycle) {
    const brush = d3.brushX().extent([
      [0, 0],
      [layout.getWidth(), layout.getNavTickHeight()],
    ]);

    brush
      .on("brush", (event: any) => {
        if (!event.selection) return;
        var s = event.selection;
        gBrush
          .selectAll(".handle__custom")
          .attr("display", null)
          .attr(
            "transform",
            (_, i) => `translate(${s[i]}, ${-layout.getNavTickHeight() / 4})`
          );
      })
      .on("end", (event: any) => {
        if (!event.sourceEvent || !event.mode) {
          return;
        } else if (!event.selection) {
          gBrush.selectAll(".handle__custom").attr("display", "none");
          return;
        } else {
          let d0 = event.selection.map(xScaleNav.invert);
          let selIndex = (d0 as [number, number]).map((x: any) =>
            findClosestIndex(
              cycle.step.map((s) => s[0]), // cycle start
              x
            )
          );
          let selValue = selIndex.map((s) => cycle.step[s][0]);
          gBrush.transition().call(event.target.move, selValue.map(xScaleNav));

          updateLists.forEach((updt) => {
            updt.func(updt.data, {
              ...updt.cycle,
              sel: [selIndex[0], selIndex[1]],
            });
          });

          cycle.sel = [selIndex[0], selIndex[1]]; // HACK: modify parent cycle
        }
      });

    xScaleNav.domain(d3.extent(data, (d) => d.x).map((x) => x ?? 0));

    const xAxisGen = d3
      .axisBottom(xScaleNav)
      .tickSize(-layout.getNavTickHeight());

    xAxisG
      .call(
        xAxisGen
          .ticks(cycle.step.length, ",.3f")
          .tickValues(cycle.step.map((s) => s[0]))
      )
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
        .y((d) => yScale(d.y));
      lineG.datum(data).transition().attr("d", lineGen);
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
  }

  // gBrush.call(brush.move, gaitCycle.slice(0, 2).map(xScaleNav));
  return update;
}

const brushHandlePath = (d: any) => {
  var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = layout.getNavTickHeight() / 2;
  return (
    "M" +
    0.5 * x +
    "," +
    y +
    "A6,6 0 0 " +
    e +
    " " +
    6.5 * x +
    "," +
    (y + 6) +
    "V" +
    (2 * y - 6) +
    "A6,6 0 0 " +
    e +
    " " +
    0.5 * x +
    "," +
    2 * y +
    "Z" +
    "M" +
    2.5 * x +
    "," +
    (y + 8) +
    "V" +
    (2 * y - 8) +
    "M" +
    4.5 * x +
    "," +
    (y + 8) +
    "V" +
    (2 * y - 8)
  );
};
