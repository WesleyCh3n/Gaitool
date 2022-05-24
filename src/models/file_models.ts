export type FltrFile = {
  [k: string]: string;
  rslt: string;
  cyGt: string;
  cyLt: string;
  cyRt: string;
  cyDb: string;
};

export type Range = {
  [k: string]: number;
  Start: number;
  End: number;
};

export type Fltr = {
  [k: string]: any;
  FltrFile: FltrFile;
  Range: Range[];
};

export type ExportFile = {
  Path: string;
}

export type ConcatFile = {
  Path: string;
}
