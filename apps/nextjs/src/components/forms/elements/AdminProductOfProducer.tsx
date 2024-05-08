/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import type {
  Category,
  Image,
  Producer,
  ProducerOfProduct,
  Product,
} from "@prisma/client";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";

type ProducerExtended = Producer & {
  logo: Image | undefined | null;
  product: (ProducerOfProduct & {
    product: Product & {
      image: Image;
      Category: (Category & {
        parent: Category | null;
        child: Category[];
      })[];
    };
  })[];
};

type Data = {
  id: string;
  name: string;
};

type Props = {
  error?: string;
  className?: string;
  data?: Data[];
  setMiCategory: Function;
  label?: string;
};

interface FieldValues {
  [x: string]: Data;
}

export default function AdminProductOfProducer({
  label,
  error,
  className = "",
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController<FieldValues, string>(props);
  const { data } = props;
  const [selected, setSelected] = useState<ProducerExtended[]>([]);
  const [inputs, setInputs] = useState<any>({});
  /**
   * Sets the category, to check if it has children categories.
   *
   * @param {Category} e
   */
  function handleChange(e: any) {
    setSelected(e);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    setInputs((values: any) => ({ ...values, producer: e }));
    // props.setMiCategory(e);
    // onChange(e);
    onChange([inputs]);
  }

  /**
   * Tranforms price format.
   *
   * @param {string} myValue
   * @returns
   */
  function transform(myValue: string) {
    const [formattedWholeValue = "", decimalValue = "0"] = myValue.split(".");
    const significantValue = formattedWholeValue.replace(/,/g, "");
    const floatValue = parseFloat(
      `${significantValue}` + "." + `${decimalValue.slice(0, 2)}`,
    );

    if (isNaN(floatValue) === false) {
      const n = new Intl.NumberFormat("en-EN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(floatValue);

      if (myValue.includes(".") && !n.includes(".")) {
        return n + ".";
      }
      return n;
    }
    return "0";
  }

  const goodNumber = (value as any) / 100;
  const goodValue = goodNumber.toString();
  const [myValue, setMyValue] = useState<string>(transform(goodValue));

  /**
   * Converts price format to number.
   *
   * @param {string} valor
   * @returns  {number | undefined} price
   */
  function newValue(valor: string) {
    if (valor) {
      if (typeof valor === "number") {
        Number(valor);
      }
      const valore = (valor: string) => {
        if (valor !== "0" && valor.length !== 0) {
          if (valor.includes(".")) {
            const nuevoValor = valor?.replace(/,/g, "").split(".")[1];
            if (nuevoValor) {
              if (nuevoValor.length <= 2) {
                if (nuevoValor.length === 0) {
                  return valor.replace(/,/g, "") + "00";
                } else if (nuevoValor?.length === 1) {
                  return valor.replace(/,/g, "") + "0";
                } else {
                  return valor.replace(/,/g, "");
                }
              }
            }
          } else {
            return valor.replace(/,/g, "") + ".00";
          }
        } else {
          return valor.replace(/,/g, "");
        }
      };
      const precioArreglo = valore(valor);
      if (precioArreglo) {
        return parseInt(precioArreglo.split(".").join(""));
      }
    }
  }

  /**
   * Changes input current price value with format
   * and sets newValue sended value.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function eventHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setMyValue(transform(e.target.value));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    setInputs((values: any) => ({
      ...values,
      price: newValue(transform(e.target.value)),
    }));
    onChange([inputs]);

    // onChange(newValue(transform(e.target.value)));
  }
  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <Listbox
          name={name}
          value={value}
          onChange={(e: Category) => handleChange(e)}
          className={classNames(className, "mb-5")}
          as="div"
        >
          {({ open }) => (
            <>
              <Listbox.Label className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
                {label ? label : name.replace("Id", "")}
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
                  <span className="flex items-center">
                    <span className="ml-3 block truncate">
                      {(selected as any)?.name || "Elegir fabricante"}
                    </span>
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
                    {data?.length === 0 ? (
                      <Listbox.Option
                        className="relative w-full cursor-default select-none py-2 pl-3 pr-9 text-gray-600 dark:text-slate-300"
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
                        <Listbox.Option
                          key={d.id}
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
                                  {d.name}
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
        <div className="mb-5">
          <label
            htmlFor={name}
            className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
          >
            {/* {label ? label : name?.replace(/([A-Z][a-z])/g, " $1").trim()}{" "} */}
            Precio del distribuidor (Opcional)
          </label>
          <div
            className={classNames(
              error ? "" : "mb-12",
              "relative flex flex-grow items-stretch  focus-within:z-10",
            )}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 dark:text-slate-300 sm:text-sm">
                $
              </span>
            </div>
            <input
              type="text"
              id={name}
              inputMode="numeric"
              value={myValue}
              onChange={(e) => eventHandler(e)}
              className={classNames(
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600",
                "block w-full rounded-lg border bg-gray-50  p-2.5 pl-7 pr-12 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
              )}
              {...props}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className="text-gray-500 dark:text-slate-300 sm:text-sm"
                id="price-currency"
              >
                MXN
              </span>
            </div>
            <br />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <div className="mb-5">
          <label
            htmlFor="delivery"
            className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
          >
            Tiempo de entrega (Opcional)
          </label>
          <div
            className={classNames(
              error ? "" : "mb-12",
              "relative flex flex-grow items-stretch  focus-within:z-10",
            )}
          >
            <input
              type="number"
              id={name}
              // name={name}
              // ref={ref}
              inputMode="numeric"
              className={classNames(
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600",
                "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
              )}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              onChange={(e) => {
                setInputs((values: any) => ({
                  ...values,
                  delivery: Number(e.target.value),
                }));
                onChange([inputs]);
              }}
              {...props}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className="text-gray-500 dark:text-slate-300 sm:text-sm"
                id="price-currency"
              >
                Días
              </span>
            </div>
            <br />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
