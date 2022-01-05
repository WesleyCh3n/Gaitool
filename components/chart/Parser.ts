import * as d3 from "d3";
import { ICycle, IData } from ".";

import { IDataSchema } from "./Dataset.d";

export function parseResult(
  files: d3.DSVRowArray<string>,
  dataSchema: IDataSchema
): IDataSchema {
  // load data into corresponding index/axis
  for (let key in dataSchema) {
    let data: IData[] =[]
    files.forEach((row) => {
      data.push({
        x: +(row[dataSchema[key].csvX] ?? 0),
        y: +(row[dataSchema[key].csvY] ?? 0),
      })
      // dataSchema[key].data.push({
        // x: +(row[dataSchema[key].csvX] ?? 0),
        // y: +(row[dataSchema[key].csvY] ?? 0),
      // });
    });
    dataSchema[key].data = data
  }

  return dataSchema;
}

export function parseCycle( files: d3.DSVRowArray<string>): ICycle {
  return {
    step: files.map((row) => [+(row.start ?? 0), +(row.end ?? 0)]),
    sel: [0, files.map(row => row).length - 1]
  };
}
