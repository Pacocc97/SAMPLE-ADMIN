import { type ChangeEvent, useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import {
  Bars4Icon,
  ExclamationTriangleIcon,
  PencilIcon,
  PhotoIcon,
  Squares2X2Icon as Squares2X2IconMini,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Gif, Image as Imagen } from "@prisma/client";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { calculateHeight, calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import SearchElement from "~/components/forms/elements/SearchElement";
import { AdminLayout } from "~/components/layouts/AdminLayout";
import ButtonElement from "~/components/ui/ButtonElement";
import { env } from "~/env.mjs";

type ImageObj = {
  id: string | undefined;
  carpeta: string | undefined;
  medidas: string;
  subida: string | undefined;
  actualizada: string | undefined;
};

export default function Page() {
  const utils = trpc.useContext();
  const images = trpc.image.all.useQuery();
  const gif = trpc.gif.all.useQuery();
  const [currentImage, setCurrentImage] = useState<Imagen | Gif>();
  const [editable, setEditable] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("Imágenes");
  const [altValue, setAltValue] = useState<string>();
  const [search, setSearch] = useState("");
  const [filterImages, setFilterImages] = useState(images.data);

  const tabs = [
    { name: "Imágenes", href: "#", current: true },
    { name: "Gifs", href: "#", current: false },
    // { name: 'Favorited', href: '#', current: false },
  ];

  const { mutateAsync: imageUpdater } = trpc.image.update.useMutation({
    async onSuccess() {
      await utils.image.all.invalidate();
      await Toast.fire({
        title: "La imágen ha sido actualizada!",
        icon: "success",
      });
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });

  const { mutateAsync: gifUpdater } = trpc.gif.update.useMutation({
    async onSuccess() {
      await utils.gif.all.invalidate();
      await Toast.fire({
        title: "La imágen ha sido actualizada!",
        icon: "success",
      });
    },
    async onError(e) {
      await Toast.fire({
        title: e.message,
        icon: "error",
      });
    },
  });

  const { mutate: deleteImage } = trpc.image.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El product ha sido borrado!",
        icon: "success",
      });
      await utils.image.all.invalidate();
      setCurrentImage(undefined);
    },
  });
  const { mutate: deleteGif } = trpc.gif.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El product ha sido borrado!",
        icon: "success",
      });
      await utils.image.all.invalidate();
      setCurrentImage(undefined);
    },
  });

  /**
   * Send request to delete gif from data base.
   *
   * @param {Gif} image
   */
  async function deleteGifHandler(image: Gif) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteGif({
          id: image.id,
          path: image.path,
          original: image.original,
        });
      }
    });
  }

  /**
   * Send request to delete image from data base.
   *
   * @param {Imagen} image
   */
  async function deleteImageHandler(image: Imagen) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteImage({
          id: image.id,
          path: image.path,
          original: image.original,
          webp: image.webp,
        });
      }
    });
  }

  const detailImage = {
    id: currentImage?.id,
    carpeta: currentImage?.path,
    medidas: `${currentImage?.width || 0} x ${currentImage?.height || 0}`,
    subida: currentImage?.createdAt.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    actualizada: currentImage?.updatedAt.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  async function handleSubmit(image: Imagen) {
    const { id, alt, ...imageData } = image;
    if (image && image.id) {
      await imageUpdater({
        id: image.id,
        alt: altValue,
        ...imageData,
      });
    }
  }

  async function handleGif(image: Gif) {
    const { id, alt, ...imageData } = image;
    if (image && image.id) {
      await gifUpdater({
        id: image.id,
        alt: altValue,
        ...imageData,
      });
    }
  }

  useEffect(() => {
    if (search === "") {
      setFilterImages(images.data);
    } else {
      setFilterImages(
        images.data?.filter(
          (image) =>
            image.original.toLowerCase().includes(search.toLowerCase()) ||
            image.alt?.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, images.data]);

  return (
    <PageComponent
      name="image"
      translate="imagen"
      page="list"
      hasData={images.data && images.data.length > 0}
      icon={<PhotoIcon className="h-full w-full" />}
    >
      <div className="flex flex-1 items-stretch overflow-hidden">
        <main className=" -mt-14 flex-1">
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            {/* <div className="flex"> */}
            {/* <h1 className="flex-1 text-2xl font-bold text-gray-900 dark:text-white">
                Photos
              </h1> */}
            {/* <div className="ml-6 flex items-center rounded-lg bg-gray-100 p-0.5 sm:hidden">
                <button
                  type="button"
                  className="rounded-md p-1.5 text-gray-400 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <Bars4Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Use list view</span>
                </button>
                <button
                  type="button"
                  className="ml-0.5 rounded-md bg-white p-1.5 text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <Squares2X2IconMini className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Use grid view</span>
                </button>
              </div> */}
            {/* </div> */}

            {/* Tabs */}
            <div className="mt-3 sm:mt-2">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Seleccione una pestaña
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:text-white"
                  defaultValue="Imágenes"
                >
                  <option>Imágenes</option>
                  <option>Gifs</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center border-b border-gray-200">
                  <nav
                    className="-mb-px flex flex-1 space-x-6 xl:space-x-8"
                    aria-label="Tabs"
                  >
                    {tabs.map((tab) => (
                      <button
                        key={tab.name}
                        onClick={() => {
                          setCurrentTab(tab.name);
                          setEditable(false);
                          setAltValue(undefined);
                          setCurrentImage(undefined);
                        }}
                        aria-current={tab.current ? "page" : undefined}
                        className={classNames(
                          tab.name === currentTab
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400",
                          "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                        )}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <section
              className="mt-8 h-[75vh] overflow-y-auto pb-16"
              aria-labelledby="gallery-heading"
            >
              <SearchElement
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                value={search}
              />
              <h2 id="gallery-heading" className="sr-only">
                Imágenes
              </h2>
              <ul
                role="list"
                className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
              >
                {(currentTab === "Imágenes" ? filterImages : gif.data)?.map(
                  (image) => (
                    <li key={image.id} className="relative">
                      <div
                        className={classNames(
                          currentImage?.id === image.id
                            ? "ring-2 ring-indigo-500 ring-offset-2"
                            : "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100",
                          "aspect-w-10 aspect-h-7 group block w-full overflow-hidden rounded-lg bg-gray-100",
                        )}
                        onClick={() => {
                          setCurrentImage(image);
                          setEditable(false);
                          setAltValue(undefined);
                        }}
                      >
                        <Image
                          width={calculateWidth(image.width, image.height, 350)}
                          height={350}
                          src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${image.path}/${image.original}`}
                          alt=""
                          className={classNames(
                            currentImage?.id === image.id
                              ? ""
                              : "group-hover:opacity-75",
                            "pointer-events-none h-56 object-contain",
                          )}
                        />
                        <button
                          type="button"
                          className="absolute inset-0 focus:outline-none"
                        >
                          <span className="sr-only">
                            Ver detalles de {image.original}
                          </span>
                        </button>
                      </div>
                      <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900 dark:text-white">
                        {image.original}
                      </p>
                      <p className="pointer-events-none block text-sm font-medium text-gray-500 dark:text-gray-400">
                        <span className="mt-2 inline-flex">
                          {!image.alt && (
                            <ExclamationTriangleIcon className="mr-2 h-5 text-yellow-600 dark:text-yellow-400" />
                          )}
                          {image.alt ? image.alt : "Sin descripción(alt)"}
                        </span>
                      </p>
                    </li>
                  ),
                )}
              </ul>
            </section>
          </div>
        </main>

        {/* Details sidebar */}
        {currentImage && (
          <aside className="hidden w-96 overflow-y-auto border-l p-8 lg:block">
            <div className="space-y-6 pb-16">
              <span className="flex justify-end">
                <button
                  onClick={() => {
                    setEditable(false);
                    setAltValue(undefined);
                    setCurrentImage(undefined);
                  }}
                >
                  <XMarkIcon className="h-8 text-end" />
                </button>
              </span>
              <div>
                <div className="aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg">
                  <Image
                    height={calculateHeight(
                      currentImage.width,
                      currentImage.height,
                      350,
                    )}
                    width={350}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${currentImage.path}/${currentImage.original}`}
                    alt={currentImage.alt || ""}
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h2 className="break-all text-lg font-medium text-gray-900 dark:text-white">
                      <span className="sr-only">Detalles de </span>
                      {currentImage.original}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {/* {currentFile.size} */}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Información
                </h3>
                <dl className="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
                  {Object.keys(detailImage).map((key) => (
                    <div
                      key={key}
                      className="flex justify-between py-3 text-sm font-medium"
                    >
                      <dt className="text-gray-500 dark:text-gray-400">
                        {key?.toString()}
                      </dt>
                      <dd className="whitespace-nowrap text-gray-900 dark:text-white">
                        {detailImage[key as keyof ImageObj]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Descripción (alt)
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  {editable ? (
                    <textarea
                      // type="text"
                      id="last_name"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      defaultValue={currentImage.alt || ""}
                      onChange={(e) => setAltValue(e.target.value)}
                    />
                  ) : (
                    <>
                      <p className="text-gray-500 dark:text-gray-300">
                        {currentImage?.alt === "" || !currentImage?.alt
                          ? "Añada una descripción breve a la imagen"
                          : currentImage?.alt}
                      </p>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={() => setEditable(true)}
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Añada descripción</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-x-3">
                {editable &&
                  (currentTab === "Imágenes" ? (
                    <ButtonElement
                      intent="blue"
                      type="button"
                      className={classNames(
                        editable
                          ? "hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "",
                        "flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm ",
                      )}
                      onClick={async () => {
                        await handleSubmit(currentImage as Imagen);
                        setEditable(false);
                      }}
                    >
                      Editar
                    </ButtonElement>
                  ) : (
                    <ButtonElement
                      intent="blue"
                      type="button"
                      className={classNames(
                        editable
                          ? "hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "",
                        "flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm ",
                      )}
                      onClick={async () => {
                        await handleGif(currentImage as Gif);
                        setEditable(false);
                      }}
                    >
                      Editar
                    </ButtonElement>
                  ))}
                {currentTab === "Imágenes" ? (
                  <ButtonElement
                    onClick={() => deleteImageHandler(currentImage as Imagen)}
                    intent="danger"
                    size="sm"
                  >
                    Borrar
                  </ButtonElement>
                ) : (
                  <ButtonElement
                    onClick={() => deleteGifHandler(currentImage)}
                    intent="danger"
                    size="sm"
                  >
                    Borrar
                  </ButtonElement>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
