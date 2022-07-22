import { IPosition, ICycle } from "../components/chart";

export const cycleDuration = (cycle: ICycle): number[] => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let t = cycle.step[i][1] - cycle.step[i][0];
    dataFiltered.push(t);
  }
  return dataFiltered;
};

export const cycleMin = (d: IPosition[], cycle: ICycle): number[] => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let cycleDataY = d
      .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i + 1][0])
      .map((d) => d.y);
    dataFiltered.push(Math.min(...cycleDataY));
  }
  return dataFiltered;
};

export const cycleMax = (d: IPosition[], cycle: ICycle): number[] => {
  const dataFiltered: number[] = [];
  for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
    let cycleDataY = d
      .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i + 1][0])
      .map((d) => d.y);
    dataFiltered.push(Math.max(...cycleDataY));
  }

  return dataFiltered;
};

export const selLineRange = (d: IPosition[], cycle: ICycle): IPosition[] => {
  let boundary = cycle.sel.map((s) => cycle.step[s][0]);
  let dataFiltered = d.filter((d) => d.x >= boundary[0] && d.x <= boundary[1]);
  return dataFiltered;
};

/* export const totalIQR = (data: IData[]): IBoxResult => {
 *   var dataSorted = data.sort((a, b) => d3.ascending(a.y, b.y));
 *   var ySorted = dataSorted.map((d) => d.y);
 *
 *   return IQR(ySorted);
 * };
 *
 * export const cycleMaxIQR = (data: IData[], cycle: ICycle): IBoxResult => {
 *   const dataFiltered: number[] = [];
 *   for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
 *     let cycleDataY = data
 *       .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i+1][0] )
 *       .map((d) => d.y);
 *     dataFiltered.push(Math.max(...cycleDataY));
 *   }
 *
 *   var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));
 *
 *   return IQR(ySorted);
 * };
 *
 * export const cycleMinIQR = (data: IData[], cycle: ICycle): IBoxResult => {
 *   const dataFiltered: number[] = [];
 *   for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
 *     let cycleDataY = data
 *       .filter((d) => d.x >= cycle.step[i][0] && d.x <= cycle.step[i+1][0] )
 *       .map((d) => d.y);
 *     dataFiltered.push(Math.min(...cycleDataY));
 *   }
 *
 *   var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));
 *
 *   return IQR(ySorted);
 * };
 *
 * export const timeIQR = (data: IData[], cycle: ICycle): IBoxResult => {
 *   const dataFiltered: number[] = [];
 *   for (let i = cycle.sel[0]; i < cycle.sel[1]; i++) {
 *     let t = cycle.step[i][1] - cycle.step[i][0]
 *     dataFiltered.push(t);
 *   }
 *
 *   var ySorted = [...dataFiltered].sort((a, b) => d3.ascending(a, b));
 *
 *   return IQR(ySorted);
 * }; */
