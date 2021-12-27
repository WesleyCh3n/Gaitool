export interface data {
  x: number;
  y: number;
}

export interface IDatasetInfo{
  name: string;
  mode: string;
  data: data[];
  csvX: string;
  csvY: string;
}

