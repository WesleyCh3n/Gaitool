export interface IData {
  x: number;
  y: number;
}

export interface IDatasetInfo {
  name: string;
  data: IData[];
  csvX: string;
  csvY: string;
}

export interface IDataSchema {
  aX: IDatasetInfo;
  aY: IDatasetInfo;
  aZ: IDatasetInfo;
  [key: string]: IDatasetInfo;
}

interface ICycle {
  step: number[][]
  sel: [number, number]
}

export type IUpdator = (
data: IData[],
cycle: ICycle // TODO: fix this any
) => void

export type INavUpdator = (
  updateLists: IUpdateList[],
  data: IData[],
  cycle: ICycle
) => void;

export interface IUpdateList {
  data: any;
  func: IUpdator;
  cycle: ICycle;
}
