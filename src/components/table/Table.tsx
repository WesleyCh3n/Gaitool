import type { ReactElement } from "react";
import { ICyData } from "../chart";
import { IoIosCloseCircleOutline } from "react-icons/io";

export interface IRow {
  [k: string]: number | string | any;
  range: [number, number];
  gt: number | string;
  lt: number | string;
  rt: number | string;
  db: number | string;
  cycle: ICyData;
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
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">
            Range (s)
          </th>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">
            GAIT
          </th>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">LT</th>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">RT</th>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">DB</th>
          <th className="sticky top-0 px-4 bg-gray-50 dark:bg-gray-700">
            <button
              onClick={() => props.removeAll()}
              className="text-red-600 bg-transparent border-none hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <IoIosCloseCircleOutline size={24} />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {props.content.map((row) => {
          return (
            <tr
              onClick={() => props.updateView(row.range)}
              className="relative bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:cursor-pointer"
              key={row.id}
            >
              <td className="px-4">
                {row.range
                  .map((i) => row.cycle.gait.step[i][0].toFixed(2))
                  .join("-")}
              </td>
              <td className="px-4">{row.gt}</td>
              <td className="px-4">{row.lt}</td>
              <td className="px-4">{row.rt}</td>
              <td className="px-4">{row.db}</td>
              <td className="px-4">
                <button
                  onClick={() => props.removeNode(row.id)}
                  className="text-red-600 bg-transparent border-none hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <IoIosCloseCircleOutline size={24} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
