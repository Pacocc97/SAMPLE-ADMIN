import { useEffect, useRef, useState } from "react";
import { useController, type UseControllerProps } from "react-hook-form";
import { z } from "zod";

import {
  handleBlurChange,
  handleButtonChange,
  handleKeyChange,
} from "~/utils/handleChange";
import { classNames } from "~/utils/object";

type Props = {
  className?: string;
  error?: string;
  optional?: boolean;
  label?: string;
  inputType?: string;
  setCurrentValue: any;
};

interface FieldValues {
  [x: string]: string[] | undefined;
}

export default function EmailLoopFormElement({
  inputType = "text",
  label,
  className = "",
  error,
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController<FieldValues, string>(props);
  const [currentVal, setCurrentVal] = useState<string | undefined>();
  const [customError, setCustomError] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const stringSchema = z.string().email().min(6).max(34);

  /**
   * Adds email to array.
   * In case of error, sets input custom error.
   *
   * @param {string} inputValue
   * @returns {void}
   */
  const generalChange = (inputValue: string) => {
    const zodResponse = stringSchema.safeParse(inputValue);
    if (!zodResponse.success) {
      return setCustomError(zodResponse.error.issues[0]?.message);
    }
    if (Array.isArray(value)) {
      if (
        value
          ?.map((tag: string) => tag.toLowerCase())
          ?.includes(inputValue.toLowerCase())
      ) {
        return setCustomError("Esa dirección de correo ya existe");
      }
      onChange([...value, inputValue]);
      setCustomError(undefined);
    } else {
      onChange([inputValue]);
      setCustomError(undefined);
    }
  };

  /**
   * Removes email from array.
   * Cancels input error.
   *
   * @param {number} index
   */
  function removeValue(index: number) {
    onChange(value?.filter((tag: string, i: number) => i !== index));
    setCustomError(undefined);
  }

  useEffect(() => {
    if (currentVal === "") {
      setCustomError(undefined);
    }
  }, [currentVal]);
  return (
    <>
      <div className={classNames(className, "mb-5")}>
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {label ? label : name?.replace(/([A-Z][a-z])/g, " $1").trim()}{" "}
        </label>
        <div
          className={classNames(
            error || customError ? "" : "mb-12",
            "relative flex flex-grow items-stretch  focus-within:z-10",
          )}
        >
          <input
            type={`${inputType}`}
            id={name}
            ref={inputRef}
            autoComplete="new-password"
            placeholder="usuario@email.com"
            onChange={(e) => setCurrentVal(e.target.value)}
            onBlur={(e) => handleBlurChange(e, generalChange)}
            onKeyDown={(e) => handleKeyChange(e, generalChange)}
            className={classNames(
              error || customError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600",
              "block w-full rounded-l-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
            )}
            {...props}
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              handleButtonChange(currentVal, inputRef, generalChange)
            }
            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <span>+</span>
          </button>
        </div>
        {value && (
          <div className={error || customError ? "mt-2" : "-mt-10"}>
            {value.map((tag: string, index: number) => (
              <div
                className="m-1 inline-block rounded-lg bg-blue-100 px-2 py-1  font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                key={index}
              >
                <span className="m-1">{tag}</span>
                <span
                  className="ml-1 inline-flex cursor-pointer items-center justify-center text-lg font-bold text-white "
                  onClick={() => removeValue(index)}
                >
                  &times;
                </span>
              </div>
            ))}
          </div>
        )}
        {(error || customError) && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error || customError}
          </p>
        )}
      </div>
    </>
  );
}
