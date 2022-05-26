export interface IData {
  x: number;
  y: number;
}

export interface IDatasetInfo {
  // name: string;
  data: IData[];
  csvX: string;
  csvY: string;
}

export interface IDataSchema {
  [key: string]: IDatasetInfo;
}

export interface IDataSPos {
  [key: string]: IDataSchema
}

export interface ICycle {
  step: number[][]
  sel: [number, number]
}

export interface ICycleList {
  [k: string]: ICycle
  gait: ICycle
  lt: ICycle
  rt: ICycle
  db: ICycle
}

export interface IBoxResult  {
  [key: string]: number;
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
  IQR: number;
  lowerIQR: number;
  upperIQR: number,
}

