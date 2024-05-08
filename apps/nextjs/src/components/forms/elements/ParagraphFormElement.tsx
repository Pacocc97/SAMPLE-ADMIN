import { forwardRef, useState } from "react";

import { ConfirmModal } from "~/utils/alerts";
import { classNames } from "~/utils/object";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: string;
  dangerous?: boolean;
  label?: string;
}

const ParagraphFormElement = forwardRef<HTMLTextAreaElement, Props>(
  (
    { name, label, className = "", error, dangerous = false, ...props }: Props,
    ref,
  ) => {
    const [safe, setSafe] = useState(false);
    async function setSafeHandler() {
      await ConfirmModal.fire({
        text: "Modificar este campo es peligroso", //'Modifying this field is dangerous!',
        confirmButtonText: "Si, remover protección!",
      }).then((result) => {
        if (result.isConfirmed) {
          setSafe(true);
        }
      });
    }

    return (
      <div className={classNames(className, "mb-5")}>
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {label || name}
        </label>
        <div
          className={classNames(
            error ? "" : "mb-12",
            "relative flex flex-grow items-stretch  focus-within:z-10",
          )}
        >
          <textarea
            id={name}
            name={name}
            ref={ref}
            rows={5}
            cols={33}
            disabled={dangerous && !safe}
            className={classNames(
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
              dangerous && !safe ? "rounded-r-none" : "",
              "block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed  disabled:bg-gray-200 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 dark:disabled:bg-gray-800",
            )}
            {...props}
          />
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
  },
);

ParagraphFormElement.displayName = "ParagraphFormElement";
export default ParagraphFormElement;
