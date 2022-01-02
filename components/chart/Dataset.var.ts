import { IData, IDatasetInfo } from './Dataset';

export var dataSchema: {[name: string]: IDatasetInfo} = {
  aX: {
    name: "Accel_x",
    data: new Array<IData>(),
    csvX: "time",
    csvY: "Pelvis_A_X",
  },
  aY: {
    name: "Accel_y",
    data: new Array<IData>(),
    csvX: "time",
    csvY: "Pelvis_A_Y",
  },
  aZ: {
    name: "Accel_z",
    data: new Array<IData>(),
    csvX: "time",
    csvY: "Pelvis_A_Z",
  }
}
  /* {
   *   name: "double_support",
   *   mode: "area",
   *   data: new Array<IData>(),
   *   csvX: "time",
   *   csvY: "double_support",
   * },
   * {
   *   name: "rt_single_support",
   *   mode: "area",
   *   data: new Array<IData>(),
   *   csvX: "time",
   *   csvY: "RT_single_support",
   * },
   * {
   *   name: "lt_single_support",
   *   mode: "area",
   *   data: new Array<IData>(),
   *   csvX: "time",
   *   csvY: "LT_single_support",
   * }, */

// export var GaitCycle = []
export var GaitCycle: number[] = []
