import { IData } from "../components/chart/Dataset";
import { IBoxResult } from "../components/chart/BoxChart.d";
import { selectRange } from "../components/chart/Draw.var";
import { GaitCycle } from "../components/chart/Dataset.var";
import * as d3 from "d3";

export const IQR = (data: IData[]): IBoxResult => {
  var dataSorted = data.sort((a, b) => d3.ascending(a.y, b.y));
  var ySorted = dataSorted.map((d) => d.y);

  const q1 = d3.quantile(ySorted, 0.25) ?? 0;
  const median = d3.quantile(ySorted, 0.5) ?? 0;
  const q3 = d3.quantile(ySorted, 0.75) ?? 0;

  const IQR = q3 - q1;

  const lowerIQR = q1 - 1.5 * IQR;
  const upperIQR = q3 + 1.5 * IQR;

  return {
    min: Math.min(...ySorted),
    max: Math.max(...ySorted),

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  };
};

export const cycleMaxIQR = (data: IData[]): IBoxResult => {
  let s = selectRange.index.s;
  let e = selectRange.index.e;
  if (s == 0 && e == 0) {
    e = GaitCycle.length
  }
  const dataFiltered: number[] = [];
  for (let i = s; i < (e-1); i++) {
    let cycleDataY = data
      .filter((d) => d.x >= GaitCycle[i] && d.x <= GaitCycle[i + 1])
      .map((d) => d.y);
    dataFiltered.push(Math.max(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  const q1 = d3.quantile(ySorted, 0.25) ?? 0;
  const median = d3.quantile(ySorted, 0.5) ?? 0;
  const q3 = d3.quantile(ySorted, 0.75) ?? 0;

  const IQR = q3 - q1;

  const lowerIQR = q1 - 1.5 * IQR;
  const upperIQR = q3 + 1.5 * IQR;

  return {
    min: Math.min(...ySorted),
    max: Math.max(...ySorted),

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  };
};

export const cycleMinIQR = (data: IData[]): IBoxResult => {
  let s = selectRange.index.s;
  let e = selectRange.index.e;
  if (s == 0 && e == 0) {
    e = GaitCycle.length
  }
  const dataFiltered: number[] = [];
  for (let i = s; i < (e-1); i++) {
    let cycleDataY = data
      .filter((d) => d.x >= GaitCycle[i] && d.x <= GaitCycle[i + 1])
      .map((d) => d.y);
    dataFiltered.push(Math.min(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  const q1 = d3.quantile(ySorted, 0.25) ?? 0;
  const median = d3.quantile(ySorted, 0.5) ?? 0;
  const q3 = d3.quantile(ySorted, 0.75) ?? 0;

  const IQR = q3 - q1;

  const lowerIQR = q1 - 1.5 * IQR;
  const upperIQR = q3 + 1.5 * IQR;

  return {
    min: Math.min(...ySorted),
    max: Math.max(...ySorted),

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  };
};
