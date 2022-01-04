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

export type IUpdator = (
data: IData[],
first: boolean,
cycle?: number[] | any // TODO: fix this any
) => void

export type INavUpdator = (
  updateLists: IUpdateList[],
  data: IData[],
  first: boolean,
  gaitCycle: number[]
) => void;

interface IUpdatorList {
  [key: string]: IUpdator | INavUpdator;
  lineChart:   IUpdator,
  boxMaxChart: IUpdator,
  boxMinChart: IUpdator,
  navFunc: INavUpdator,
}

export interface IUpdateList {
  data: any;
  func: any;
  cycle?: number[];
}
