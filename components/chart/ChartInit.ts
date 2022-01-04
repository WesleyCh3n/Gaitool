import { IDataSchema } from "./Dataset.d";

export function initChart(
  updaters: IDataSchema,
  dataSchema: IDataSchema
): IDataSchema {
  for (let key in dataSchema) {
    dataSchema[key].updater = updaters[key].updater;
  }
  return dataSchema;
}
