import type { ReactElement } from "react";

export interface IRow {
  [k: string]: number | string;
  range: string;
  gait: number | string;
  lt: number | string;
  rt: number | string;
  db: number | string;
  id: string;
}

export interface TableProps {
  content: IRow[];
  removeNode: (id: string) => void;
  removeAll: () => void;
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
              <td>{row.gait}</td>
              <td>{row.lt}</td>
              <td>{row.rt}</td>
              <td>{row.db}</td>
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
