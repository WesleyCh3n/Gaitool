import type { ReactElement, ChangeEvent } from "react";

export interface SelectorProps {
  options: string[];
  selectedOption: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  disable: boolean
}

export function Selector(props: SelectorProps): ReactElement | null {
  return (
    <select
      className="form-select py-1 w-full
        text-gray-800 dark:text-gray-400 font-bold normal-case
        dark:bg-gray-700 shadow-sm
        hover:bg-gray-400 dark:hover:bg-gray-600
        rounded-lg border-gray-400 dark:border-gray-600
        disabled:transform-none disabled:transition-none disabled:bg-gray-400
        disabled:dark:bg-gray-700 disabled:border-none"
      defaultValue={props.selectedOption}
      onChange={props.onChange}
      disabled={props.disable}
    >
      {props.options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
