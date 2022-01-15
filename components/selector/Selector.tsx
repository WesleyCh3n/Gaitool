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
      className="select select-bordered select-xs w-full max-w-xs"
      // size={props.options.length}
      defaultValue={props.selectedOption}
      onChange={props.onChange}
      disabled={props.disable}
    >
      {props.options.map((opt) => (
        <option key={opt} value={opt} className="text-xs">
          {opt}
        </option>
      ))}
    </select>
  );
}
