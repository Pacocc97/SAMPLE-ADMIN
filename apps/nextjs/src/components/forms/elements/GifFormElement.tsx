import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";

import { ConfirmModal } from "~/utils/alerts";
import { classNames } from "~/utils/object";
import { env } from "~/env.mjs";
import "cropperjs/dist/cropper.css";
import type {
  ChangeEvent,
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Gif } from "@prisma/client";

import type { Size } from "~/types/types";

type Props = {
  name: string;
  error?: string;
  aspectRatio?: number;
  size?: Size;
  image?: string;
  setFileName:Dispatch<SetStateAction<string | undefined>>;
  setImage: Dispatch<SetStateAction<string | undefined>>;
  defaultGif?: Gif | null;
  deleteGif?: Function;
  altGif?: string | null;
  setAltGif?: Dispatch<SetStateAction<string | null | undefined>>;
};

type Handle = {
  reset: () => void;
};

const GifFormElement = forwardRef<Handle, Props>(
  (
    { name, error, image, setImage, 
      setFileName
      ,defaultGif, deleteGif, setAltGif }: Props,
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      reset() {
        cleanInput();
        setImage(undefined);
      },
    }));

    const [defaultValue, setDefaultValue] = useState(defaultGif);
    const [dragging, setDragging] = useState(false);
    const [base64Image, setBase64Image] = useState<string>();

    const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;

    /**
     * Converts uploaded gif to url object format.
     *
     * @param event
     */
    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      if (event.target.files?.[0]) {
        setBase64Image(URL.createObjectURL(event.target.files[0]));
        setFileName(event.target.files[0].name)
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
          // The file's text will be printed here
          if (event.target && typeof event.target.result === "string") {
            setImage(`${event.target.result}`);
          }
        };

        reader.readAsDataURL(file);
      }
    }

    /**
     * Converts dropped gif to url object format.
     *
     * @param event
     */
    function handleDrop(event: DragEvent<HTMLLabelElement>) {
      event.preventDefault();
      setDragging(false);
      if (event.dataTransfer.files[0]?.type.split("/")[0] === "image") {
        if (fileInputRef.current) {
          fileInputRef.current.files = event.dataTransfer.files;
        }
        setBase64Image(URL.createObjectURL(event.dataTransfer.files[0]));
        setFileName(event.dataTransfer.files[0].name)
        const file = event.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
          // The file's text will be printed here
          if (event.target && typeof event.target.result === "string") {
            setImage(`${event.target.result}`);
          }
        };

        reader.readAsDataURL(file);
      }
    }

    /**
     * Fires a modal for delete confirmation.
     * If confirmed delete, else, return
     *
     * @param {Gif} gif
     */
    function deleteGifHandler(gif: Gif) {
      ConfirmModal.fire({
        confirmButtonText: "Sí, seguir!",
      })
        .then((result) => {
          if (result.isConfirmed) {
            if (deleteGif) {
              deleteGif({
                id: gif.id,
                path: gif.path,
                original: gif.original,
              });
            }
          }
        })
        .finally(() => setDefaultValue(undefined));
    }

    /**
     * Cleans gif input.
     */
    function cleanInput() {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setBase64Image(undefined);
    }

    /* eslint-disable @next/next/no-img-element */
    return (
      <div className="mb-5">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {name}
        </label>

        {defaultValue && !base64Image ? (
          <>
            <div key={image} className="relative max-w-fit">
              <Image
                width={500}
                height={500}
                src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${defaultValue.path}/${defaultValue.original}`}
                alt="cropped"
                className="max-w-96"
              />
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                <label htmlFor={name}>
                  <a className="h-12 w-24 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 p-2 text-xl text-white hover:from-sky-600 hover:to-emerald-700">
                    Editar
                  </a>
                </label>
                <button
                  onClick={() => deleteGifHandler(defaultValue)}
                  type="button"
                  className="my-2 ml-2 cursor-pointer rounded-lg bg-red-600 bg-gradient-to-r p-2 text-white hover:bg-red-700"
                >
                  Borrar
                </button>
              </div>
              <input
                id={name}
                name={name}
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {setAltGif && (
              <div className="my-6">
                <label
                  htmlFor="default-input"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Descripción de la imágen
                </label>
                <input
                  type="text"
                  id="default-input"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  onChange={(e) => setAltGif(e.target.value)}
                />
              </div>
            )}
          </>
        ) : !base64Image ? (
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
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span>Subir una image</span>
                    <p className="pl-1">o arrastrar hasta aquí</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    PNG / JPG
                  </p>
                </div>
              </div>
            </div>
          </label>
        ) : (
          <>
            <div className="relative max-w-fit">
              {image && <img src={image} alt="cropped" className="max-h-96" />}
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                <button
                  onClick={() => cleanInput()}
                  className="w-12 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 py-1 text-white hover:from-sky-600 hover:to-emerald-700"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            {setAltGif && (
              <div className="my-6">
                <label
                  htmlFor="default-input"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Descripción de la imágen
                </label>
                <input
                  type="text"
                  id="default-input"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  onChange={(e) => setAltGif(e.target.value)}
                />
              </div>
            )}
          </>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error === "Expected string, received null"
              ? "You have to upload an image"
              : error}
          </p>
        )}
      </div>
    );
  },
);

GifFormElement.displayName = "GifFormElement";

export default GifFormElement;
