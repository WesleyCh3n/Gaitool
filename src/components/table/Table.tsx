import type { ReactElement } from "react";
import { ICycleList } from "../chart";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { BsSearch } from "react-icons/bs";

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
  updateView: (r: [number, number]) => void;
}

export function Table(props: TableProps): ReactElement | null {
  return (
    <table className="table table-compact w-full">
      <thead>
        <tr>
          <th>Range (s)</th>
          <th>GAIT</th>
          <th>LT</th>
          <th>RT</th>
          <th>DB</th>
          <th>SHOW</th>
          <th>
            <button
              onClick={() => props.removeAll()}
              className="text-red-600 bg-transparent border-none
                  hover:bg-gray-300
                  dark:hover:bg-gray-600"
            >
              <IoIosCloseCircleOutline size={24} />
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
                  onClick={() => props.updateView(row.range)}
                  className="bg-transparent border-none
                  text-gray-700 dark:text-gray-400
                  hover:bg-gray-300
                  dark:hover:bg-gray-600"
                >
                  <BsSearch size={15} />
                </button>
              </th>
              <th>
                <button
                  onClick={() => props.removeNode(row.id)}
                  className="text-red-600 bg-transparent border-none
                  hover:bg-gray-300
                  dark:hover:bg-gray-600"
                >
                  <IoIosCloseCircleOutline size={24} />
                </button>
              </th>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
