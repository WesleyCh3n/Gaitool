import { Data, IDatasetInfo } from './Dataset';

export var Dataset: IDatasetInfo[] = [
  {
    name: "accel_x",
    mode: "line",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "Pelvis_A_X",
  },
  {
    name: "accel_y", // html id
    mode: "line",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "Pelvis_A_Y",
  },
  {
    name: "accel_z", // html id
    mode: "line",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "Pelvis_A_Z",
  },
  {
    name: "double_support",
    mode: "area",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "double_support",
  },
  {
    name: "rt_single_support",
    mode: "area",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "RT_single_support",
  },
  {
    name: "lt_single_support",
    mode: "area",
    data: new Array<Data>(),
    csvX: "time",
    csvY: "LT_single_support",
  },
]

// export var GaitCycle = []
