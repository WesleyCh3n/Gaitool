import * as d3 from "d3";
import { IData, IBoxResult, selectRange, } from "../components/chart";

export const totalIQR = (data: IData[]): IBoxResult => {
  var dataSorted = data.sort((a, b) => d3.ascending(a.y, b.y));
  var ySorted = dataSorted.map((d) => d.y);

  return IQR(ySorted);
};

export const cycleMaxIQR = (data: IData[], cycle: number[]): IBoxResult => {
  const dataFiltered: number[] = [];
  for (let i = selectRange.index.s; i < selectRange.index.e - 1; i++) {
    let cycleDataY = data
      .filter((d) => d.x >= cycle[i] && d.x <= cycle[i + 1])
      .map((d) => d.y);
    dataFiltered.push(Math.max(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  return IQR(ySorted);
};

export const cycleMinIQR = (data: IData[], cycle: number[]): IBoxResult => {
  const dataFiltered: number[] = [];
  for (let i = selectRange.index.s; i < selectRange.index.e - 1; i++) {
    let cycleDataY = data
      .filter((d) => d.x >= cycle[i] && d.x <= cycle[i + 1])
      .map((d) => d.y);
    dataFiltered.push(Math.max(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  return IQR(ySorted);
};

const IQR = (sortedArray: number[]): IBoxResult => {

  const q1 = d3.quantile(sortedArray, 0.25) ?? 0;
  const median = d3.quantile(sortedArray, 0.5) ?? 0;
  const q3 = d3.quantile(sortedArray, 0.75) ?? 0;

  const IQR = q3 - q1;

  const lowerIQR = q1 - 1.5 * IQR;
  const upperIQR = q3 + 1.5 * IQR;

  return {
    min: Math.min(...sortedArray),
    max: Math.max(...sortedArray),

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  }
}
