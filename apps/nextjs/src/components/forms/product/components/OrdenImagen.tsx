import {
  Fragment,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { Image as Imagen, ImagesExtra } from "@prisma/client";

import { Toast } from "~/utils/alerts";
import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import { trpc } from "~/utils/trpc";
import { env } from "~/env.mjs";

type Props = {
  arr:
    | (ImagesExtra & {
        image: Imagen;
      })[]
    | undefined;
  setArr: Dispatch<
    SetStateAction<
      | (ImagesExtra & {
          image: Imagen;
        })[]
      | undefined
    >
  >;
};

const OrdenImagen = ({ arr, setArr }: Props) => {
  const utils = trpc.useContext();
  const { mutate: deleteImagen } = trpc.image.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La image ha sido borrada!",
        icon: "success",
      });
      await utils.image.all.invalidate();
    },
  });
  function deleteImagenHandler(image: Imagen) {
    deleteImagen({
      id: image.id,
      path: image.path,
      original: image.original,
      webp: image.webp,
    });
  }

  const [dragging, setDragging] = useState<number>();
  const [drag, setDrag] = useState<boolean>(false);
  const dragItem = useRef() as MutableRefObject<number | null>;
  const dragOverItem = useRef() as MutableRefObject<number | null>;

  const dragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // DEJAR EN  CASO DE NECESITARLO
    // const target = e.target as HTMLElement;

    setDrag(true);
  };

  const dragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    // DEJAR EN  CASO DE NECESITARLO
    // const target = e.target as HTMLElement;

    setDragging(dragOverItem.current);
  };

  const drop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const copyListItems = [...(arr || [])];
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      if (dragItemContent) {
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      }
      dragItem.current = null;
      dragOverItem.current = null;
      setArr(copyListItems);
    }

    setDrag(false);
  };

  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium capitalize text-gray-900 dark:text-gray-300">
        Acomodo Imágenes
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        className="flex w-full flex-wrap gap-4 rounded-lg border bg-gray-50 p-2.5  text-sm text-gray-900 dark:bg-gray-700  dark:text-white dark:placeholder-gray-400"
      >
        {arr?.map(
          (
            product:
              | ImagesExtra & {
                  image: Imagen;
                },
            index: number,
          ) => (
            <Fragment key={index}>
              {drag && index === dragging && (
                <div className="h-50 ml-5 border-l-4 border-solid"></div>
              )}
              <div
                onDragStart={(e) => dragStart(e, index)}
                onDragEnter={(e) => dragEnter(e, index)}
                onDragEnd={drop}
                draggable
                className="cursor-move"
              >
                <div
                  className={classNames(
                    index === dragItem.current
                      ? "mr-[-160px] opacity-0 transition-all duration-200 ease-out"
                      : index === dragOverItem.current
                      ? "ml-24 transition-all"
                      : "",
                    "relative h-40 w-40 ",
                  )}
                >
                  <Image
                    height={160}
                    width={calculateWidth(
                      product.image.width,
                      product.image.height,
                      160,
                    )}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product.image.path}/${product.image.original}`}
                    className="absolute inset-0 z-0 rounded bg-cover bg-center"
                    alt="image extra"
                  />

                  {!drag && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded font-semibold opacity-0 duration-100 hover:opacity-100 hover:backdrop-blur-sm">
                      <button
                        onClick={() => deleteImagenHandler(product.image)}
                        className="w-12 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-600 py-1 text-white hover:from-sky-600 hover:to-emerald-700"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Fragment>
          ),
        )}
      </div>
    </div>
  );
};

OrdenImagen.displayName = "OrdenImagen";

export default OrdenImagen;
