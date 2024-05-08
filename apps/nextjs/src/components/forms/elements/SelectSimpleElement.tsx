import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";

type Props = {
  nombre: string;
  className?: string;
  error?: string;
  data?: string[];
  dangerous?: boolean;
};
export default function SelectSimpleElement({
  nombre,
  className = "",
  error,
  dangerous = false,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController(props);

  const { data } = props;

  /**
   * Returns translated word based on passed value.
   *
   * @param {string | undefined} value
   * @returns
   */
  function translate(value: string | undefined) {
    switch (value) {
      case "admin":
        return "administrador";
      case "client":
        return "cliente";
      case "team":
        return "equipo";
      default:
        return value;
    }
  }
  return (
    <>
      <Listbox
        name={name}
        value={value || ""}
        onChange={onChange}
        className={classNames(className, "mb-5")}
        as="div"
      >
        {({ open }) => (
          <>
            <Listbox.Label className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
              {nombre ? nombre : name.replace("Id", "")}
            </Listbox.Label>
            <div className={classNames(error ? "" : "mb-12", "relative")}>
              <Listbox.Button
                className={classNames(
                  error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600",
                  "relative w-full cursor-default rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-left text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700  dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ",
                )}
              >
                <span className="ml-3 block truncate">
                  {translate(
                    data?.find((item) => item === value),
                  )?.toUpperCase() || "Elija un tipo"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="disabled:bg-gray-200' absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 sm:text-sm">
                  {data?.map((d, i) => (
                    <Listbox.Option
                      key={i}
                      className={({ active }) =>
                        classNames(
                          active
                            ? "bg-indigo-600 text-white"
                            : "text-gray-900 dark:text-white",
                          "relative cursor-default select-none py-2 pl-3 pr-9",
                        )
                      }
                      value={d}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span
                              className={classNames(
                                selected ? "font-semibold" : "font-normal",
                                "ml-3 block truncate",
                              )}
                            >
                              {translate(d)?.toUpperCase()}
                            </span>
                          </div>

                          {selected ? (
                            <span
                              className={classNames(
                                active
                                  ? "text-white"
                                  : "text-indigo-600 dark:text-indigo-300",
                                "absolute inset-y-0 right-0 flex items-center pr-4",
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </>
        )}
      </Listbox>
    </>
  );
}
