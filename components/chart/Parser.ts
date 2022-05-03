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
  return {
    step: files.map((row) => [+(row.start ?? 0), +(row.end ?? 0)]),
    sel: [0, files.map((row) => row).length - 1],
  };
}
