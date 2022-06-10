import { ReactElement, MouseEventHandler } from "react";
import { AiOutlineLoading } from "react-icons/ai";

export interface ButtonProps {
  content: any;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button(props: ButtonProps): ReactElement | null {
  return (
    <button
      className={`
        py-1 px-2 flex justify-center items-center
        text-gray-800 dark:text-gray-400 font-bold normal-case
        bg-gray-200 dark:bg-gray-900 shadow-md border-none
        rounded-lg transition-all ease-in-out
        hover:bg-gray-400 dark:hover:bg-gray-600
        disabled:transform-none disabled:transition-none disabled:bg-gray-400
        disabled:dark:bg-gray-900
        active:translate-y-[2px]
        ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled ? true : false}
    >
      {props.isLoading ? (
        <AiOutlineLoading className="animate-spin" size={25} />
      ) : (
        props.content
      )}
    </button>
  );
}

export function ButtonOutline(props: ButtonProps): ReactElement | null {
  return (
    <button
      className={`
        py-1 px-2 text-gray-800 dark:text-gray-400 font-bold normal-case
        dark:bg-gray-700 shadow-sm
        border border-gray-400 dark:border-gray-600
        rounded-lg transition-all ease-in-out
        hover:bg-gray-400 dark:hover:bg-gray-600
        disabled:transform-none disabled:transition-none disabled:bg-gray-400
        disabled:dark:bg-gray-700 disabled:border-none
        active:translate-y-[2px]
        ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled ? true : false}
    >
      {props.isLoading ? (
        <AiOutlineLoading className="animate-spin" size={25} />
      ) : (
        props.content
      )}
    </button>
  );
}
