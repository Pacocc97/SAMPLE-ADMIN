import { Switch } from "@headlessui/react";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";

type Props = {
  error?: string;
  className?: string;
  label?: string;
};

export default function ToggleFormElement({
  error,
  className = "",
  label,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController(props);

  return (
    <div className={classNames(className, "mb-5")}>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
      >
        {label || name}
      </label>
      <Switch
        checked={value}
        onChange={onChange}
        className={classNames(
          value ? "bg-indigo-600" : "bg-gray-200",
          error ? "" : "mb-7",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={classNames(
            value ? "translate-x-5" : "translate-x-0",
            "pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          )}
        >
          <span
            className={classNames(
              value
                ? "opacity-0 duration-100 ease-out"
                : "opacity-100 duration-200 ease-in",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-gray-400"
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span
            className={classNames(
              value
                ? "opacity-100 duration-200 ease-in"
                : "opacity-0 duration-100 ease-out",
              "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
            )}
            aria-hidden="true"
          >
            <svg
              className="h-3 w-3 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
