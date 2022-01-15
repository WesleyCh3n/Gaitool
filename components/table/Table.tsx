import type { ReactElement } from "react";
import { ICycleList, IDatasetInfo } from "../chart";

export interface IRow {
  [k: string]: number | string | any;
  range: string;
  gt: number | string;
  lt: number | string;
  rt: number | string;
  db: number | string;
  cycle: ICycleList;
  id: string;
}

export interface TableProps {
  content: IRow[];
  removeNode: (id: string) => void;
  removeAll: () => void;
  updateView: {
    f: Function;
    d: IDatasetInfo;
  };
}

export function Table(props: TableProps): ReactElement | null {
  return (
    <table className="table w-full table-compact table-auto">
      <thead>
        <tr>
          <th>Range (s)</th>
          <th>GAIT</th>
          <th>LT</th>
          <th>RT</th>
          <th>DB</th>
          <th>Show</th>
          <th>
            <button
              onClick={() => props.removeAll()}
              className="btn btn-ghost btn-xs text-red-600"
            >
              X
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.content.map((row) => {
          return (
            <tr key={row.id}>
              <td>{row.range}</td>
              <td>{row.gt}</td>
              <td>{row.lt}</td>
              <td>{row.rt}</td>
              <td>{row.db}</td>
              <th>
                <button
                  onClick={() => props.updateView.f(props.updateView.d, row.cycle)}
                  className="btn btn-ghost btn-outline btn-xs"
                >
                  Show
                </button>
              </th>
              <th>
                <button
                  onClick={() => props.removeNode(row.id)}
                  className="btn btn-ghost btn-xs text-red-600"
                >
                  X
                </button>
              </th>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
