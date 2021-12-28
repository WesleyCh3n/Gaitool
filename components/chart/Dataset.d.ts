export interface Data {
  x: number;
  y: number;
}

export interface IDatasetInfo{
  name: string;
  mode: string;
  data: Data[];
  csvX: string;
  csvY: string;
}

