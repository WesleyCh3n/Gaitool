export interface IData {
  x: number;
  y: number;
}

export interface IDatasetInfo{
  name: string;
  data: IData[];
  csvX: string;
  csvY: string;
}

export interface IDataSchema{
  aX: IDatasetInfo;
  aY: IDatasetInfo;
  aZ: IDatasetInfo;
  [key: string]: IDatasetInfo;
}

export type IUpdateFunc = (data: IData[], first: boolean) => void;

export interface IUpdateList{
  data: any;
  func: any;
}
