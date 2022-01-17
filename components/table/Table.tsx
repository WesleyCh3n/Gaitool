import type { ReactElement } from "react";
import { ICycleList, IDatasetInfo } from "../chart";

export interface IRow {
  [k: string]: number | string | any;
  range: [number, number];
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
          <th> </th>
          <th>
            <button
              onClick={() => props.removeAll()}
              className="btn btn-circle btn-outline btn-xs text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-4 h-4 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.content.map((row) => {
          return (
            <tr key={row.id}>
              <td>
                {row.range
                  .map((i) => row.cycle.gait.step[i][0].toFixed(2))
                  .join("-")}
              </td>
              <td>{row.gt}</td>
              <td>{row.lt}</td>
              <td>{row.rt}</td>
              <td>{row.db}</td>
              <th>
                <button
                  onClick={() => {
                    // props.updateView.f(props.updateView.d, row.cycle)
                    console.log(row.range);
                  }}
                  className="btn btn-ghost btn-outline btn-xs"
                >
                  Show
                </button>
              </th>
              <th>
                <button
                  onClick={() => props.removeNode(row.id)}
                  // className="btn btn-ghost btn-xs text-red-600"
                  className="btn btn-circle btn-outline btn-xs text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-4 h-4 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </th>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
