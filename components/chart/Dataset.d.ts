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

interface IUpdatorList {
  [key: string]: IUpdator;
}

export interface IUpdateList {
  data: any;
  func: any;
  cycle?: number[];
}
