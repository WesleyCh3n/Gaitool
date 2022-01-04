import * as d3 from "d3";

import { IDataSchema } from "./Dataset.d";
import { IData } from ".";

export function parseResult(
  files: d3.DSVRowArray<string>[],
  dataSchema: IDataSchema
): IDataSchema {
  // load data into corresponding index/axis
  for (let key in dataSchema) {
    files[0].forEach((row) => {
      dataSchema[key].data.push({
        x: +(row[dataSchema[key].csvX] ?? 0),
        y: +(row[dataSchema[key].csvY] ?? 0),
      });
    });
  }

  return dataSchema;
}

export function parseCycle(
  files: d3.DSVRowArray<string>,
  data: IData[]
): number[] {
  // load Gait cycle
  let cycle = files.map((row) => +(row.time ?? 0));
  var startEnd = d3.extent(data, (d) => d.x).map((x) => x ?? 0);
  cycle.unshift(startEnd[0]);
  cycle.push(startEnd[1]);

  return cycle;
}
