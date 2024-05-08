import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { classNames } from "~/utils/object";
import "cropperjs/dist/cropper.css";
import type {
  ChangeEvent,
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import type { Pdf } from "@prisma/client";

import { ConfirmModal } from "~/utils/alerts";
import { env } from "~/env.mjs";

type Props = {
  name: string;
  error?: string;
  pdf?: string;
  setPdf: Dispatch<SetStateAction<string | undefined>>;
  setFileName: Dispatch<SetStateAction<string | undefined>>;
  defaultPdf?: Pdf | null | undefined;
  deletePdf?: Function;
  className?: string;
};

type Handle = {
  reset: () => void;
};

const PdfFormElement = forwardRef<Handle, Props>(
  ({ name, error, pdf, setFileName, setPdf, defaultPdf, deletePdf, className = "" }: Props, ref) => {
    useImperativeHandle(ref, () => ({
      reset() {
        cleanInput();
        setPdf(undefined);
      },
    }));

    const [defaultValue, setDefaultValue] = useState(defaultPdf);
    const [dragging, setDragging] = useState(false);

    const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;

    /**
     * Converts uploaded pdf.
     *
     * @param event
     */
    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      if (event.target.files?.[0]) {
        const file = event.target.files[0];
        setFileName(file.name)
        const reader = new FileReader();
        reader.onload = function (event) {
          if (event.target && typeof event.target.result === "string") {
            setPdf(`${event.target.result}`);
          }
        };

        reader.readAsDataURL(file);
      }
    }

    /**
     * Converts dropped pdf.
     *
     * @param event
     */
    function handleDrop(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      setDragging(false);
      if (event.dataTransfer.files[0]?.type.split("/")[0] === "pdf") {
        if (fileInputRef.current) {
          fileInputRef.current.files = event.dataTransfer.files;
        }
        const file = event.dataTransfer.files[0];
        setFileName(file.name)
        const reader = new FileReader();
        reader.onload = function (event) {
          // The file's text will be printed here
          if (event.target && typeof event.target.result === "string") {
            setPdf(`${event.target?.result}`);
          }
        };

        reader.readAsDataURL(file);
      }
    }

    /**
     * Fires a modal for delete confirmation.
     * If confirmed delete, else, return
     *
     * @param {Pdf} pdf
     */
    function deletePdfHandler(pdf: Pdf) {
      ConfirmModal.fire({
        confirmButtonText: "Sí, seguir!",
      })
        .then((result) => {
          if (result.isConfirmed) {
            deletePdf &&
              deletePdf({
                id: pdf.id,
                path: pdf.path,
                original: pdf.original,
              });
          }
        })
        .finally(() => setDefaultValue(undefined));
    }

    /**
     * Cleans pdf input.
     */
    function cleanInput() {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPdf(undefined);
      setDefaultValue(undefined);
    }
    return (
      <div className={classNames(className, "mb-5")}>
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {name}
        </label>
        {defaultValue && !pdf ? (
          <>
            <div>
              <button
                onClick={() => cleanInput()}
                type="button"
                className="my-2 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 p-2 text-white hover:from-sky-600 hover:to-emerald-700"
              >
                Cambiar PDF
              </button>
              <button
                onClick={() => deletePdfHandler(defaultValue)}
                type="button"
                className="my-2 ml-2 cursor-pointer rounded-lg bg-red-600 bg-gradient-to-r p-2 text-white hover:bg-red-700"
              >
                Borrar
              </button>
              <embed
                width="191"
                height="207"
                src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${defaultValue.path}/${defaultValue.original}`}
                type="application/pdf"
              />
            </div>
          </>
        ) : !pdf ? (
          <label
            htmlFor={name}
            className={classNames(
              error ? "" : "mb-12",
              "mt-1  sm:col-span-2 sm:mt-0",
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onMouseEnter={() => setDragging(true)}
            onMouseLeave={() => setDragging(false)}
          >
            <div
              className={classNames(
                dragging ? "border-blue-500" : "border-gray-300",
                error && !dragging ? "border-red-500" : "border-gray-300",
                " pointer-events-none flex cursor-pointer justify-center rounded-lg border-2 border-dashed  px-6 pb-6 pt-5",
              )}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.25}
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>

                <div className="flex text-sm text-gray-800 dark:text-gray-200">
                  <div className="relative font-medium">
                    <input
                      id={name}
                      name={name}
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span>Subir</span>
                    <p className="pl-1">o arrastrar aquí</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    PDF
                  </p>
                </div>
              </div>
            </div>
          </label>
        ) : (
          <>
            <div>
              <button
                onClick={() => cleanInput()}
                type="button"
                className="m-2 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 p-2 text-white hover:from-sky-600 hover:to-emerald-700"
              >
                Cambiar PDF
              </button>
              <embed
                width="191"
                height="207"
                src={pdf}
                type="application/pdf"
              />
            </div>
          </>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error === "Expected string, received null"
              ? "You have to upload an pdf"
              : error}
          </p>
        )}
      </div>
    );
  },
);

PdfFormElement.displayName = "PdfFormElement";

export default PdfFormElement;
