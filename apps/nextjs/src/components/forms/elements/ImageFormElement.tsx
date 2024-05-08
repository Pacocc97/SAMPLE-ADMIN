import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Cropper from "react-cropper";

import { env } from "~/env.mjs";
import "cropperjs/dist/cropper.css";
import type {
  ChangeEvent,
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import type { Image as Imagen } from "@prisma/client";

import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import ModalElement from "~/components/ModalElement";
import ButtonElement from "~/components/ui/ButtonElement";
import type { Size } from "~/types/types";

type Props = {
  name: string;
  error?: string;
  aspectRatio?: number;
  size?: Size;
  image?: string;
  setFileName?:Dispatch<SetStateAction<string | undefined>>;
  setImage: Dispatch<SetStateAction<string | undefined>>;
  altImage?: string | null;
  setAltImage?: Dispatch<SetStateAction<string | null | undefined>>;
  defaultImage?: Imagen;
  multipleImages?: boolean;
};

type Handle = {
  reset: () => void;
};

const ImageFormElement = forwardRef<Handle, Props>(
  (
    {
      name,
      error,
      aspectRatio,
      size,
      setFileName,
      image,
      setImage,
      defaultImage,
      setAltImage,
      multipleImages,
    }: Props,
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      reset() {
        cleanInput();
        setImage(undefined);
      },
    }));

    const [dragging, setDragging] = useState(false);
    const [base64Image, setBase64Image] = useState<string>();
    const [cropper, setCropper] = useState<Cropper>();
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef() as MutableRefObject<HTMLInputElement>;
    const ratio =
      aspectRatio ||
      (size?.width !== undefined && size?.height !== undefined
        ? size.width / size.height
        : undefined);

    useEffect(() => {
      if (base64Image) {
        setOpen(true);
      }
    }, [base64Image]);

    /**
     * Converts uploaded image to base64 format.
     *
     * @param event
     */
    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
      if (event.target.files?.[0]) {
        setBase64Image(URL.createObjectURL(event.target.files[0]));
        if(setFileName)
        setFileName(event.target.files[0].name)
      }
    }
    
    /**
     * Converts dropped image to base64 format.
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
        if(setFileName)
        setFileName(event.dataTransfer.files[0].name)
      }
    }

    /**
     * Gets information about the resulted cropped image
     */
    function getCropData() {
      if (typeof cropper !== "undefined") {
        setImage(cropper.getCroppedCanvas().toDataURL());
        setOpen(false);
      }
    }

    /**
     * Closes image modal.
     */
    function closeModal() {
      getCropData();
    }

    /**
     * Cleans image input.
     */
    function cleanInput() {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setBase64Image(undefined);
    }

    /**
     * Allows to zoom image in modal.
     *
     * @param e
     */
    function zoom(e: Cropper.ZoomEvent<HTMLImageElement>) {
      if (e.detail.ratio > 1) {
        e.preventDefault();
      }
    }

    return (
      <div className="mb-5">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {name}
        </label>
        {defaultImage && !base64Image ? (
          <>
            <div key={image} className="relative max-w-fit">
              <label
                htmlFor={name}
                className={classNames(
                  error ? "" : "mb-12",
                  "mt-1  sm:col-span-2 sm:mt-0",
                )}
              >
                {
                  /* eslint-disable @next/next/no-img-element */
                  <Image
                    height={384}
                    width={calculateWidth(
                      defaultImage.width,
                      defaultImage.height,
                      384,
                    )}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${defaultImage.path}/${defaultImage.original}`}
                    alt="cropped"
                    className="max-h-96"
                  />
                }
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                  <a className="h-12 w-24 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 pl-5 pt-2 text-xl text-white hover:from-sky-600 hover:to-emerald-700">
                    Editar
                  </a>
                </div>
                <input
                  id={name}
                  name={name}
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple={multipleImages}
                />
              </label>
            </div>
            {setAltImage && (
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
                  defaultValue={defaultImage.alt ? defaultImage.alt : ""}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  onChange={(e) => setAltImage(e.target.value)}
                />
              </div>
            )}
          </>
        ) : !base64Image ? (
          <div>
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
                        multiple={multipleImages}
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
          </div>
        ) : (
          <>
            <div key={image} className="relative max-w-fit">
              {
                /* eslint-disable @next/next/no-img-element */
                image && <img src={image} alt="cropped" className="max-h-96" />
              }
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                <a
                  onClick={() => setOpen(true)}
                  className="h-12 w-24 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 pl-5 pt-2 text-xl text-white hover:from-sky-600 hover:to-emerald-700"
                >
                  Editar
                </a>
              </div>
            </div>
            {setAltImage && (
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
                  onChange={(e) => setAltImage(e.target.value)}
                />
              </div>
            )}
            <ModalElement open={open} setOpen={closeModal}>
              <Cropper
                style={{ maxHeight: "70vh", width: "100%" }}
                zoom={zoom}
                zoomTo={0.1}
                aspectRatio={ratio}
                src={base64Image}
                viewMode={1}
                minCropBoxHeight={size?.height}
                minCropBoxWidth={size?.width}
                minContainerHeight={size?.height}
                minContainerWidth={size?.width}
                background={true}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
                guides={false}
              />
              <div className="mt-6 flex justify-between">
                <ButtonElement
                  intent="danger"
                  size="sm"
                  onClick={() => cleanInput()}
                >
                  Cancelar
                </ButtonElement>
                <ButtonElement
                  intent="primary"
                  size="sm"
                  onClick={() => getCropData()}
                >
                  Cortar
                </ButtonElement>
              </div>
            </ModalElement>
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

ImageFormElement.displayName = "ImageFormElement";

export default ImageFormElement;
