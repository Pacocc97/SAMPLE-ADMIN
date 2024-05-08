import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Cropper from "react-cropper";

import "cropperjs/dist/cropper.css";
import type {
  ChangeEvent,
  Dispatch,
  DragEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

import type { UpdateProductFormValues } from "@acme/api/src/schemas/productSchema";

import { classNames } from "~/utils/object";
import ModalElement from "~/components/ModalElement";
import ButtonElement from "~/components/ui/ButtonElement";
import type { Size } from "~/types/types";

type Props = {
  name: string;
  error?: string;
  aspectRatio?: number;
  size?: Size;
  setImage: (image: string | undefined) => void;
  submitForm: (data: UpdateProductFormValues) => Promise<void>;
  imageArray: string[];
  setImageArray: Dispatch<SetStateAction<string[]>>;
  setImagesExtra1: Dispatch<SetStateAction<string | undefined>>;
};

type Handle = {
  reset: () => void;
};
/* eslint-disable @next/next/no-img-element */
const ImageExtraFormElement = forwardRef<Handle, Props>(
  (
    {
      name,
      error,
      imageArray,
      aspectRatio,
      size,
      setImage,
      setImageArray,
      setImagesExtra1,
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

    /**
     * Removes selected image from image extra array.
     *
     * @param {string} name
     */
    function deleteByImg(name: string) {
      const result = imageArray.filter((item: string) => item !== name);
      setImagesExtra1("");
      setImageArray(result);
    }

    return (
      <div className="mb-5">
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300"
        >
          {name}
        </label>
        {!base64Image ? (
          <label
            htmlFor={name}
            className={classNames(
              error ? "" : "mb-12",
              "mt-1 sm:col-span-2 sm:mt-0",
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
                " pointer-events-none mb-3 flex cursor-pointer justify-center rounded-lg border-2 border-dashed px-6 pb-6 pt-5",
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
            <label
              htmlFor={name}
              className={classNames(
                error ? "" : "",
                "mt-1 grow sm:col-span-2  sm:mt-0",
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
                  "pointer-events-none mb-3 flex h-full cursor-pointer justify-center rounded-lg border-2 border-dashed px-6 py-12 pb-6",
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
            <div className="mx-5 flex overflow-x-auto">
              {imageArray?.map((image: string, index) => (
                <>
                  <div
                    key={index}
                    className="relative mx-2 h-48 w-48 flex-shrink-0 "
                  >
                    <img
                      alt="default image"
                      src={image}
                      className="absolute inset-0 z-0 rounded bg-cover bg-center hover:blur-sm"
                    />
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                      <a
                        onClick={() => {
                          deleteByImg(image);
                          imageArray.length <= 1 ? setBase64Image("") : "";
                        }}
                        className="w-12 cursor-pointer rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 py-1 text-white hover:from-sky-600 hover:to-emerald-700"
                      >
                        <TrashIcon />
                      </a>
                    </div>
                  </div>
                </>
              ))}
            </div>
            <hr className="m-4" />

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

ImageExtraFormElement.displayName = "ImageFormElement";

export default ImageExtraFormElement;
