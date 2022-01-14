import type { ReactElement } from "react";

export interface IExportTable {
  [k: string]: number | string;
  Start: number;
  End: number;
  Max: number;
  Min: number;
  id: string;
}

export interface TableProps {
  content: IExportTable[];
  removeNode: (id: string) => void;
}

export function Table(props: TableProps): ReactElement | null {
  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Max</th>
          <th>Min</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.content.map((row) => {
          console.log(row.id);
          return (
            <tr key={row.id}>
              <td>{row.Start} s</td>
              <td>{row.End} s</td>
              <td>{row.Max}</td>
              <td>{row.Min}</td>
              <th>
                <button
                  onClick={() => props.removeNode(row.id)}
                  className="btn btn-ghost btn-xs text-red-600"
                >
                  delete
                </button>
              </th>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
