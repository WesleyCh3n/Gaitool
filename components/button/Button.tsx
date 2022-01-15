import { ReactElement, MouseEventHandler } from "react";

export interface ButtonProps {
  title: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button(props: ButtonProps): ReactElement | null {
  return (
    <button
      className={`btn btn-xs btn-primary shadow-lg whitespace-nowrap ${
        props.isLoading ? "loading" : ""
      }`}
      onClick={props.onClick}
      disabled={props.disabled ? true: false}
    >
      {props.title}
    </button>
  );
}

// <button
// className="px-6 py-2.5 bg-blue-600
// text-white font-xl leading-tight uppercase rounded shadow-md
// hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg
// focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg
// transition duration-300 ease-in-out"
// onClick={props.onClick}
// >
// {props.title}
// </button>
