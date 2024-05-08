import { Fragment, type Dispatch, type SetStateAction } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Image } from "@prisma/client";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";
import FixedImage from "~/components/images/FixedImage";

type Props = {
  error?: string;
  className?: string;
  data?: {
    id: string;
    name: string;
    image?: Image;
  }[];
  deleteFunction: (name: string, value: string) => void;
  openCreate: Dispatch<SetStateAction<boolean>>;
  canDelete: boolean;
  canCreate?: boolean;
  label?: string;
};

export default function SelectFormElement({
  error,
  label,
  className = "",
  canCreate = true,
  openCreate,
  deleteFunction,
  canDelete,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController(props);

  const { data } = props;
  const selected = data?.find((item) => item.id === value);
  return (
    <>
      <Listbox
        name={name}
        value={value}
        onChange={onChange}
        className={classNames(className, "mb-5")}
        as="div"
      >
        {({ open }) => (
          <>
            <Listbox.Label className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
              {label ? label : name.replace("Id", "")}
            </Listbox.Label>
            <div
              className={classNames(
                error ? "" : "mb-12",
                "relative flex flex-grow items-stretch",
              )}
            >
              <Listbox.Button
                className={classNames(
                  canDelete ? "rounded-l-lg" : "rounded-lg",
                  error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600",
                  "relative w-full cursor-default border border-gray-300 bg-gray-50 p-2.5 pr-10 text-left text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700  dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ",
                )}
              >
                <span className="flex items-center">
                  {!!selected && !!selected.image && selected.image && (
                    <FixedImage
                      image={selected.image}
                      className="h-5 w-5 flex-shrink-0 rounded-full"
                    />
                  )}
                  <span className="ml-3 block truncate capitalize">
                    {data?.find((item) => item.id === value)?.name ||
                      "Seleccione una opción"}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => openCreate(true)}
                  className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <span>+</span>
                </button>
              )}

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="disabled:bg-gray-200' absolute z-10 mt-11 max-h-56 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base text-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800 sm:text-sm">
                  {data?.length === 0 ? (
                    <Listbox.Option
                      className="relative w-full cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-slate-300"
                      value={null}
                      disabled
                    >
                      <>
                        <div className="flex items-center">
                          <span className="ml-3 block truncate">
                            Sin opciones
                          </span>
                        </div>
                      </>
                    </Listbox.Option>
                  ) : (
                    data?.map((d) => (
                      <div key={d.id} className="flex w-full flex-wrap">
                        <Listbox.Option
                          className={({ active }) =>
                            classNames(
                              active
                                ? "bg-indigo-600 text-white"
                                : "text-gray-900 dark:text-white",
                              "relative w-full cursor-default select-none py-2 pl-3 pr-9",
                            )
                          }
                          value={d.id}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate capitalize",
                                  )}
                                >
                                  {d.name}
                                </span>
                              </div>
                              {selected ? (
                                <span
                                  className={classNames(
                                    active
                                      ? "text-white"
                                      : "text-indigo-600 dark:text-indigo-300",
                                    "absolute inset-y-0 left-0 flex items-center pl-1",
                                  )}
                                >
                                  <CheckIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteFunction(d.name, name)}
                            className="absolute right-0 flex items-center pr-3 pt-2"
                          >
                            <TrashIcon className="w-5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
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
