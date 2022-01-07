import * as d3 from "d3";
import { IData, IBoxResult, ICycle, } from "../components/chart";

export const totalIQR = (data: IData[]): IBoxResult => {
  var dataSorted = data.sort((a, b) => d3.ascending(a.y, b.y));
  var ySorted = dataSorted.map((d) => d.y);

  return IQR(ySorted);
};

export const cycleMaxIQR = (data: IData[], cycle: ICycle): IBoxResult => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let cycleDataY = data
      .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i+1][0] )
      .map((d) => d.y);
    dataFiltered.push(Math.max(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  return IQR(ySorted);
};

export const cycleMinIQR = (data: IData[], cycle: ICycle): IBoxResult => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let cycleDataY = data
      .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i+1][0] )
      .map((d) => d.y);
    dataFiltered.push(Math.min(...cycleDataY));
  }

  var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));

  return IQR(ySorted);
};

export const timeIQR = (data: IData[], cycle: ICycle): IBoxResult => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let t = cycle.step[i][1] - cycle.step[i][0]
    dataFiltered.push(t);
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
    min: isFinite(Math.min(...sortedArray)) ? Math.min(...sortedArray) : 0,
    max: isFinite(Math.max(...sortedArray)) ? Math.max(...sortedArray) : 0,

    q1: q1,
    median: median,
    q3: q3,

    IQR: IQR,
    lowerIQR: lowerIQR,
    upperIQR: upperIQR,
  }
}
