import * as d3 from "d3";
import {
  GaitCycle,
} from "./Dataset.var";

import { IDataSchema } from "./Dataset.d";

export function parseCSV(
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

  // load Gait cycle
  files[1].forEach((row) => {
    GaitCycle.push(+(row.time ?? 0));
  });
  var startEnd = d3.extent(dataSchema.aX.data, (d) => d.x).map((x) => x ?? 0);
  GaitCycle.unshift(startEnd[0]);
  GaitCycle.push(startEnd[1]);

  return dataSchema;
}
