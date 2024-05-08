import { useEffect, useState } from "react";
import { MinusIcon } from "@heroicons/react/24/outline";
import type { Prisma } from "@prisma/client";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  error?: string;
  dangerous?: boolean;
  optional?: boolean;
  defaultAttributes?: Prisma.JsonValue | undefined;
  characteristics?: Prisma.JsonValue | undefined;
}

interface Range {
  low: number;
  high: number;
}

type Attributes = {
  name?: string;
  value?: string | number | Range;
  type?: string;
  unit?: string;
};
type AttributesRange = {
  name?: string;
  value?: Range;
  type?: string;
  unit?: string;
};

export default function InputLoopElement({
  label,
  characteristics,
  defaultAttributes,
  className = "",
  optional,
  error,
  dangerous = false,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, onChange },
  } = useController(props);
  const nombre = (characteristics as Attributes[]).map((c) => c.name);
  const filtered = (defaultAttributes as Attributes[])?.filter((item) => {
    return nombre.includes(item.name);
  });
  const [inputValues, setInputsValues] = useState<Attributes[]>(
    filtered || defaultAttributes || [],
  );
  const [lowValue, setLowValue] = useState<number>(0);
  const [highValue, setHighValue] = useState<number>(0);

  /**
   * Removes nullish values from characteristics array.
   *
   * @returns
   */
  function removeNullish() {
    return (characteristics as Attributes[])?.filter(
      (char: Attributes) => char,
    );
  }

  /**
   * Adds object or replace existing object from attributes array.
   *
   * @param unidad
   * @param e
   */
  function handleAddValue(
    unidad: string | undefined,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const obj: Attributes = {
      name: e.target.id,
      value: e.target.value,
      unit: unidad,
    };
    const filteredArray = inputValues.filter((x) => {
      if (x.name === obj.name) {
        return true;
      } else {
        return false;
      }
    });

    if (filteredArray.length > 0) {
      const myArray = inputValues.filter(function (obj) {
        return obj.name !== e.target.id;
      });
      setInputsValues([...myArray, obj]);
    } else {
      setInputsValues([...inputValues, obj]);
    }
  }
  /**
   * Adds object or replace existing object from attributes array.
   *
   * @param unidad
   * @param e
   */
  function handleRangeValue(
    unidad: string | undefined,
    e: React.ChangeEvent<HTMLInputElement>,
    param: string,
  ) {
    const obj: Attributes = {
      name: e.target.id,
      value: { low: lowValue, high: highValue },
      unit: unidad,
    };
    const filteredArray = inputValues.filter((x) => {
      if (x.name === obj.name) {
        return true;
      } else {
        return false;
      }
    });
    if (param === "low") {
      if (filteredArray.length > 0) {
        const myArray = inputValues.filter(function (obj) {
          return obj.name !== e.target.id;
        });
        setInputsValues([...myArray, obj]);
      } else {
        setInputsValues([...inputValues, obj]);
      }
    } else {
      if (filteredArray.length > 0) {
        const myArray = inputValues.filter(function (obj) {
          return obj.name !== e.target.id;
        });
        setInputsValues([...myArray, obj]);
      } else {
        setInputsValues([...inputValues, obj]);
      }
    }
  }

  useEffect(() => {
    onChange(inputValues);
  }, [inputValues, onChange]);

  /**
   * Filters default values by passed attribute name.
   *
   * @param name
   * @returns
   */
  function myDefault(
    name: string | undefined,
    tipo: string | undefined,
    key: keyof Range | null,
  ) {
    if (tipo !== "range") {
      const val = (defaultAttributes as Attributes[])?.filter(
        (d) => d.name === name,
      )?.[0];

      return val?.value;
    } else if (key) {
      const val = (defaultAttributes as AttributesRange[])?.filter(
        (d) => d.name === name,
      )?.[0];

      return val?.value?.[key];
    }
  }

  function translate(val?: string) {
    switch (val) {
      case "text":
        return "texto";
      case "range":
        return "rango";
      case "number":
        return "número";
      default:
        return val;
    }
  }

  return (
    <>
      {removeNullish()?.map(
        ({ name: nombre, type: tipo, unit: unidad }: Attributes) => (
          <div key={nombre} className={classNames(className, "mb-5")}>
            <label
              htmlFor={name}
              className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
            >
              {nombre ? nombre : name?.replace(/([A-Z][a-z])/g, " $1").trim()}{" "}
              {optional && "(opcional)"}
            </label>
            <p className="text-sm">El valor debe ser: {translate(tipo)}</p>
            {tipo !== "range" ? (
              <div
                className={classNames(
                  error ? "" : "mb-12",
                  "relative flex flex-grow items-stretch  focus-within:z-10",
                )}
              >
                <input
                  type={tipo}
                  id={nombre}
                  defaultValue={myDefault(nombre, tipo, null)}
                  onChange={(e) => handleAddValue(unidad, e)}
                  className={classNames(
                    error
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600",
                    "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
                  )}
                  {...props}
                />
                {unidad && (
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center pr-3">
                    <span className="uppercase text-gray-500 dark:text-slate-300 sm:text-sm">
                      {unidad}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                <div
                  className={classNames(
                    error ? "" : "mb-12",
                    "relative  flex flex-grow items-stretch  focus-within:z-10",
                  )}
                >
                  <input
                    type="number"
                    id={nombre}
                    // max={highValue}
                    defaultValue={myDefault(nombre, tipo, "low")}
                    onChange={(e) => {
                      handleRangeValue(unidad, e, "low"),
                        setLowValue(Number(e.target.value));
                    }}
                    className={classNames(
                      error
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600",
                      "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
                    )}
                    {...props}
                  />
                  {unidad && (
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center pr-3">
                      <span className="uppercase text-gray-500 dark:text-slate-300 sm:text-sm">
                        {unidad}
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className={classNames(
                    error ? "" : "mb-12",
                    "relative flex flex-grow items-stretch  focus-within:z-10",
                  )}
                >
                  <MinusIcon className="-ml-1 mr-5 w-5" />
                  <input
                    type="number"
                    id={nombre}
                    // min={lowValue}
                    defaultValue={myDefault(nombre, tipo, "high")}
                    onChange={(e) => {
                      handleRangeValue(unidad, e, "high"),
                        setHighValue(Number(e.target.value));
                    }}
                    className={classNames(
                      error
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600",
                      "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
                    )}
                    {...props}
                  />
                  {unidad && (
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center pr-3">
                      <span className="uppercase text-gray-500 dark:text-slate-300 sm:text-sm">
                        {unidad}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        ),
      )}
    </>
  );
}
