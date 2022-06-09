export interface IPosition {
  x: number;
  y: number;
}

export interface ICsvData {
  data: IPosition[];
  csvX: string;
  csvY: string;
}

export interface ISensor {
  [key: string]: ICsvData;
  "Accel X": ICsvData;
  "Accel Y": ICsvData;
  "Accel Z": ICsvData;
  "Gyro X": ICsvData;
  "Gyro Y": ICsvData;
  "Gyro Z": ICsvData;
}

export interface IData {
  [key: string]: ISensor
  "L": ISensor;
  "T": ISensor;
  "Scapular LT": ISensor;
  "Scapular RT": ISensor;
}

export interface ICycle {
  step: number[][]
  sel: [number, number]
}

export interface ICyData {
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

