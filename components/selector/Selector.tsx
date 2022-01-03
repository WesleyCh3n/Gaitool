import type { ReactElement, ChangeEvent } from "react";

export interface SelectorProps {
  options: string[];
  selectedOption: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export function Selector(props: SelectorProps): ReactElement | null {
  return (
    <select
      className="w-full selectBox"
      size={props.options.length}
      defaultValue={props.selectedOption}
      onChange={props.onChange}
    >
      {props.options.map((opt) => (
        <option key={opt} value={opt} className="text-[24px]">
          {opt}
        </option>
      ))}
    </select>
  );
}
