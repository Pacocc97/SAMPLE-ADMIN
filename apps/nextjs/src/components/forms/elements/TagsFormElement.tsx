import { useEffect, useRef, useState } from "react";
import { useController, type UseControllerProps } from "react-hook-form";

import { classNames } from "~/utils/object";

type Props = {
  error?: string;
  className?: string;
};
interface FieldValues {
  [x: string]: string[] | undefined;
}
export default function TagsElement({
  error,
  className = "",
  ...props
}: Props & UseControllerProps) {
  const {
    field: { name, value, onChange },
  } = useController<FieldValues, string>(props);

  const [focusDiv, setFocusDiv] = useState(false);

  const parent = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [parent]);

  /**
   * Adds a tag to the tag array after enter is clicked.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} event
   */
  function addTag(event: React.KeyboardEvent<HTMLInputElement>) {
    if (
      event.key === "Enter" &&
      (event.target as HTMLInputElement).value !== ""
    ) {
      event.preventDefault();
      const inputValue = (event.target as HTMLInputElement).value;
      if (Array.isArray(value)) {
        if (
          value
            ?.map((tag: string) => tag.toLowerCase())
            ?.includes(inputValue.toLowerCase())
        ) {
          return;
        }
        onChange([...value, inputValue]);
      } else {
        onChange([inputValue]);
      }
      (event.target as HTMLInputElement).value = "";
    }
  }

  /**
   * Removes specific tag based on index value.
   *
   * @param {number} index
   */
  function removeTag(index: number) {
    onChange(value?.filter((tag: string, i: number) => i !== index));
  }

  /**
   * Sets focus true, when hadle this function.
   */
  function focus() {
    setFocusDiv(true);
    const input = document.getElementById(name ?? "tags");
    input?.focus();
  }

  /**
   * Sets focus false, when hadle this function.
   */
  function handleClickOutside(event: MouseEvent) {
    if (
      parent.current &&
      !parent.current.contains(event.target as HTMLElement)
    ) {
      setFocusDiv(false);
    }
  }

  return (
    <div className={classNames(className, "mb-5")}>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
      >
        Etiquetas
        {/* {name} */}
      </label>
      <div
        className={classNames(
          error ? "" : "mb-12",
          "relative flex flex-grow items-stretch  focus-within:z-10",
        )}
      >
        <div
          ref={parent}
          onClick={focus}
          className={classNames(
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
            focusDiv
              ? "border-2 border-blue-500 p-[3px] ring-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:border-blue-500 dark:ring-blue-500"
              : "p-1",
            "mb-2 block w-full cursor-text rounded-lg border bg-gray-50 text-sm  text-gray-900  disabled:cursor-not-allowed disabled:bg-gray-200  dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800",
          )}
        >
          {value?.map((tag: string, index: number) => (
            <div
              className="m-1 inline-block rounded-lg bg-blue-100 px-2 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              key={index}
            >
              <span className="text-sm">{tag}</span>
              <span
                className="ml-1 inline-flex cursor-pointer items-center justify-center text-lg font-bold text-white "
                onClick={() => removeTag(index)}
              >
                &times;
              </span>
            </div>
          ))}
          <input
            className={classNames(
              "border-none border-transparent bg-gray-50 text-sm text-gray-900 focus:border-x-transparent focus:ring-0 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400",
              value?.length === 0 ? "" : "mb-1 pb-1",
            )}
            id={name ?? "tags"}
            onKeyDown={(e) => addTag(e)}
            type="text"
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
