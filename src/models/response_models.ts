import { Fltr } from "./file_models";

export interface Res {
  [k: string]: string | any;
  msg: string;
  data: any;
};

export interface ResData {
  [k: string]: any;
  serverRoot: string;
  saveDir: string;
  python: any;
};

export interface ResUpload extends ResData {
  python: Fltr;
}
