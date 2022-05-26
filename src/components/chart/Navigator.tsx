import * as d3 from "d3";
import { RefObject } from "react";
import { IData, layout } from "./";
import { ICycleList } from "./Chart";

export function createGaitNav(ref: RefObject<SVGSVGElement>) {
  const navSvg = d3
    .select(ref.current)
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

  function update(
    updateLogic: (d: IData[], c: ICycleList) => void,
    data: IData[],
    cycle: ICycleList,
    move?: [number, number]
  ) {
    const updateView = (range: [number, number]) => {
      let selValue = range.map((s) => cycle["gait"].step[s][0]);
      gBrush.transition().call(brush.move, selValue.map(xScaleNav));

      // HACK: modify parent cycle
      cycle["gait"].sel = range as [number, number];
      ["lt", "rt", "db"].forEach((k) => {
        cycle[k].sel = selValue.map((x) =>
          d3.bisectLeft(
            cycle[k].step.map((s) => s[0]),
            x
          )
        ) as [number, number];
      });
      // update chart
      updateLogic(data, cycle);
    };

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
            (_, i) => `translate(${s[i]}, ${-layout.getNavTickHeight()})`
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
            d3.bisectCenter(
              cycle["gait"].step.map((s) => s[0]),
              x
            )
          );
          updateView(selIndex as [number, number]);
        }
      });

    xScaleNav.domain(d3.extent(data, (d) => d.x).map((x) => x ?? 0));

    const xAxisGen = d3
      .axisBottom(xScaleNav)
      .tickSize(-layout.getNavTickHeight());

    xAxisG
      .call(
        xAxisGen
          .ticks(cycle["gait"].step.length, ",.2f")
          .tickValues(cycle["gait"].step.map((s) => s[0]))
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
      .attr("d", brushHandlePath)
      .attr("transform", `translate(0, ${-layout.getNavTickHeight()})`);

    if (move) { // feat: active move brush
      updateView(move as [number, number]);
    }
  }
  return update;
}

const brushHandlePath = (d: any) => {
  var e = +(d.type == "e"),
    x = e ? 1 : -1,
    y = layout.getNavTickHeight();
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
