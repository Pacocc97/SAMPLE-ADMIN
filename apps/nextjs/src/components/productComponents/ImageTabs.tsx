import Image from "next/image";
import { Tab } from "@headlessui/react";
import type {
  Category,
  Gif,
  Image as Imagen,
  ImagesExtra,
  Pdf,
  Product,
} from "@prisma/client";

import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import { env } from "~/env.mjs";

interface Props {
  product: Product & {
    Category: Category[] | null;
    ImagesExtra: (ImagesExtra & { image: Imagen })[];
    Gif: Gif | null;
    brochure: Pdf | null;
    manual: Pdf | null;
    image: Imagen;
    openGraphBasicImage: Imagen | null;
  };

  sortedProducts:
    | (ImagesExtra & {
        image: Imagen;
      })[]
    | undefined;
}

export const ImageTabs = ({ product, sortedProducts }: Props) => {
  return (
    <Tab.Group
      as="div"
      className="flex flex-col-reverse p-4 xs:rounded-xl sm:rounded-lg "
    >
      <div className="mx-auto mt-2 hidden w-full max-w-2xl xs:block sm:block lg:max-w-none">
        <Tab.List className="flex flex-wrap">
          <Tab className="aspect-square relative mx-2 mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-sm font-medium uppercase text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-500">
            {({ selected }) => (
              <>
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <Image
                    height={80}
                    width={calculateWidth(
                      product.image.width,
                      product.image.height,
                      80,
                    )}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product.image.path}/${product.image.original}`}
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                </span>
                <span
                  className={classNames(
                    selected ? "ring-blue-500" : "ring-transparent",
                    "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-1",
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </Tab>
          {sortedProducts?.map(
            (
              image: ImagesExtra & {
                image: Imagen;
              },
            ) => (
              <Tab
                key={image.imageId}
                className="aspect-square relative mx-2 mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-sm font-medium uppercase text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-500"
              >
                {({ selected }) => (
                  <>
                    <span className="sr-only"> {image.imageId} </span>
                    <span className="absolute inset-0 overflow-hidden rounded-md">
                      <Image
                        height={80}
                        width={calculateWidth(
                          product.image.width,
                          product.image.height,
                          80,
                        )}
                        src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${image.image.path}/${image.image.original}`}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    </span>
                    <span
                      className={classNames(
                        selected ? "ring-blue-500" : "ring-transparent",
                        "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-1",
                      )}
                      aria-hidden="true"
                    />
                  </>
                )}
              </Tab>
            ),
          )}
          {product.Gif ? (
            <Tab className="aspect-square relative mx-2 mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-md bg-gray-100 text-sm font-medium uppercase text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-500">
              {({ selected }) => (
                <>
                  <span className="absolute inset-0 overflow-hidden rounded-md">
                    <div className="relative">
                      <Image
                        height={80}
                        width={calculateWidth(
                          product.image.width,
                          product.image.height,
                          80,
                        )}
                        src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                          product.Gif ? product.Gif.path : ""
                        }/${product.Gif ? product.Gif.original : ""}`}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-black opacity-50 ">
                        Gif
                      </p>
                    </div>
                  </span>
                  <span
                    className={classNames(
                      selected ? "ring-indigo-500" : "ring-transparent",
                      "pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </Tab>
          ) : (
            ""
          )}
        </Tab.List>
      </div>
      <Tab.Panels className="w-full">
        <Tab.Panel>
          <div className="relative mb-5">
            <div className="relative h-96 overflow-hidden rounded-lg">
              <div
                className="z-100 absolute inset-0 bg-gray-100 dark:bg-gray-700"
                data-carousel-item=""
              >
                <Image
                  height={320}
                  width={calculateWidth(
                    product.image.width,
                    product.image.height,
                    320,
                  )}
                  src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product.image.path}/${product.image.original}`}
                  alt=""
                  className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Tab.Panel>
        {sortedProducts?.map(
          (
            image: ImagesExtra & {
              image: Imagen;
            },
          ) => (
            <Tab.Panel key={image.imageId}>
              <div className="relative mb-5">
                <div className="relative h-96 overflow-hidden rounded-lg">
                  <div
                    className="z-100 absolute inset-0 bg-gray-100 dark:bg-gray-700"
                    data-carousel-item=""
                  >
                    <Image
                      height={320}
                      width={calculateWidth(
                        product.image.width,
                        product.image.height,
                        320,
                      )}
                      src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${image.image.path}/${image.image.original}`}
                      alt=""
                      className="absolute left-1/2 top-1/2 block  -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </Tab.Panel>
          ),
        )}
        {product?.Gif ? (
          <Tab.Panel>
            <div className="relative mb-5">
              <div className="relative h-96 overflow-hidden rounded-lg">
                <div
                  className="z-100 absolute inset-0 bg-gray-100 dark:bg-gray-700"
                  data-carousel-item=""
                >
                  <Image
                    height={320}
                    width={calculateWidth(
                      product.image.width,
                      product.image.height,
                      320,
                    )}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${product?.Gif.path}/${product?.Gif.original}`}
                    alt=""
                    className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2"
                  />
                </div>
              </div>
            </div>
          </Tab.Panel>
        ) : (
          ""
        )}
      </Tab.Panels>
    </Tab.Group>
  );
};
