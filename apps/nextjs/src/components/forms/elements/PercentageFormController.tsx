import { useState } from "react";
import { useController, type UseControllerProps } from "react-hook-form";

import { ConfirmModal } from "~/utils/alerts";
import { classNames } from "~/utils/object";

type Props = {
  className?: string;
  error?: string;
  dangerous?: boolean;
  nombre?: string;
};

export default function PercentageFormController({
  className = "",
  error,
  nombre,
  dangerous = false,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController(props);

  const [safe, setSafe] = useState(false);
  async function setSafeHandler() {
    await ConfirmModal.fire({
      text: "Modificar este campo es peligroso!",
      confirmButtonText: "Si, remover protección!",
    }).then((result) => {
      if (result.isConfirmed) {
        setSafe(true);
      }
    });
  }

  /**
   * Tranforms percentage format.
   *
   * @param {string} myValue
   * @returns
   */
  function transform(myValue: string) {
    const [formattedWholeValue = "", decimalValue = "0"] = myValue.split(".");

    const significantValue = () => {
      if (formattedWholeValue !== "NaN") {
        if (Number(formattedWholeValue) < 100) {
          return formattedWholeValue.replace(/,/g, "");
        } else {
          return "100";
        }
      } else {
        return "0";
      }
    };
    const floatValue = parseFloat(
      `${significantValue()}` + "." + `${decimalValue.slice(0, 2)}`,
    );
    if (isNaN(floatValue) === false) {
      if (myValue.includes(".") && !floatValue.toString().includes(".")) {
        return String(floatValue) + ".";
      }
      return String(floatValue);
    }
    return "0";
  }

  const goodNumber = value / 100;
  const goodValue = goodNumber.toString();

  const [myValue, setMyValue] = useState<string>(transform(goodValue));

  /**
   * Converts percentage format to number.
   *
   * @param {string} valor
   * @returns  {number | undefined} percentage
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
   * Changes input current percentage value with format
   * and sets newValue sended value.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function eventHandler(e: React.ChangeEvent<HTMLInputElement>) {
    setMyValue(transform(e.target.value));
    onChange(newValue(transform(e.target.value)));
  }

  return (
    <div className={classNames(className, "mb-5")}>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
      >
        {nombre ? nombre : name?.replace(/([A-Z][a-z])/g, " %1").trim()}{" "}
      </label>
      <div
        className={classNames(
          error ? "" : "mb-12",
          "relative flex flex-grow items-stretch  focus-within:z-10",
        )}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 dark:text-slate-300 sm:text-sm">
            %
          </span>
        </div>
        <input
          type="text"
          id={name}
          inputMode="numeric"
          value={myValue}
          onChange={(e) => eventHandler(e)}
          disabled={dangerous && !safe}
          className={classNames(
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
            dangerous && !safe ? "rounded-r-none" : "",
            "block w-full rounded-lg border bg-gray-50  p-2.5 pl-7 pr-12 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
          )}
          {...props}
        />
        <br />
        {dangerous && !safe && (
          <button
            type="button"
            onClick={() => setSafeHandler()}
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <span>Habilitar</span>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
