import * as d3 from "d3";
import { ICycle, IData, IDataSPos } from "./";

export function parseResult(
  files: d3.DSVRowArray<string>,
  dataSchema: IDataSPos
): IDataSPos {
  // load data into corresponding index/axis
  for (let pos in dataSchema) {
    for (let key in dataSchema[pos]) {
      let data: IData[] = [];
      files.forEach((row) => {
        data.push({
          x: +(row[dataSchema[pos][key].csvX] ?? 0),
          // y: +(row[`${pos}_${dataSchema[pos][key].csvY}`] ?? 0),
          y: +(row[dataSchema[pos][key].csvY] ?? 0),
        });
      });
      dataSchema[pos][key].data = data; // HACK: modify parent
    }
  }

  return dataSchema;
}

export function parseCycle(files: d3.DSVRowArray<string>): ICycle {
  let step = files.map((row) => [+(row.start ?? 0), +(row.end ?? 0)]);
  let last_step = [+(files[files.length - 1].end ?? 0), 0];
  step.push(last_step);

  return {
    step: step,
    sel: [0, files.map((row) => row).length],
  };
}
