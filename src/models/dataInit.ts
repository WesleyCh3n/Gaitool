import { IData } from "../components/chart";

export const dataInit: IData = {
  "L": {
    "Accel X": { data: [], csvX: "time", csvY: "L Accel Sensor X (mG)" },
    "Accel Y": { data: [], csvX: "time", csvY: "L Accel Sensor Y (mG)" },
    "Accel Z": { data: [], csvX: "time", csvY: "L Accel Sensor Z (mG)" },
    "Gyro X": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-L-Gyroscope-x (deg/s)" },
    "Gyro Y": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-L-Gyroscope-y (deg/s)" },
    "Gyro Z": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-L-Gyroscope-z (deg/s)" },
  },
  "T": {
    "Accel X": { data: [], csvX: "time", csvY: "T Accel Sensor X (mG)" },
    "Accel Y": { data: [], csvX: "time", csvY: "T Accel Sensor Y (mG)" },
    "Accel Z": { data: [], csvX: "time", csvY: "T Accel Sensor Z (mG)" },
    "Gyro X": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-T-Gyroscope-x (deg/s)" },
    "Gyro Y": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-T-Gyroscope-y (deg/s)" },
    "Gyro Z": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-T-Gyroscope-z (deg/s)" },
  },
  "Scapular LT": {
    "Accel X": { data: [], csvX: "time", csvY: "Scapular Accel Sensor X LT (mG)" },
    "Accel Y": { data: [], csvX: "time", csvY: "Scapular Accel Sensor Y LT (mG)" },
    "Accel Z": { data: [], csvX: "time", csvY: "Scapular Accel Sensor Z LT (mG)" },
    "Gyro X": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular LT-Gyroscope-x (deg/s)" },
    "Gyro Y": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular LT-Gyroscope-y (deg/s)" },
    "Gyro Z": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular LT-Gyroscope-z (deg/s)" },
  },
  "Scapular RT": {
    "Accel X": { data: [], csvX: "time", csvY: "Scapular Accel Sensor X RT (mG)" },
    "Accel Y": { data: [], csvX: "time", csvY: "Scapular Accel Sensor Y RT (mG)" },
    "Accel Z": { data: [], csvX: "time", csvY: "Scapular Accel Sensor Z RT (mG)" },
    "Gyro X": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular RT-Gyroscope-x (deg/s)" },
    "Gyro Y": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular RT-Gyroscope-y (deg/s)" },
    "Gyro Z": { data: [], csvX: "time", csvY: "Noraxon MyoMotion-Segments-Scapular RT-Gyroscope-z (deg/s)" },
  }
}

export const location = Object.keys(dataInit);
export const sensor = Object.keys(dataInit[location[0]]);

export default dataInit;
