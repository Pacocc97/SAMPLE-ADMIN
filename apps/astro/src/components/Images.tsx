/* eslint-disable react/jsx-key */
import { createSignal } from "solid-js";

import type { Gif, Image, ImagesExtra, Product } from "@acme/db";

import { classNames } from "~/utils/classNames";

// import type { Product } from "../types";

type SelectedImage = {
  id: string;
  path: string;
  original: string;
};

type MyProduct = {
  data: Product & {
    image: Image;
    Gif: Gif;
    ImagesExtra: (ImagesExtra & {
      image: Image;
    })[];
  };
};

export const Images = ({ data }: MyProduct) => {
  const [count, setCount] = createSignal<SelectedImage | null>(data.image);

  return (
    data.image && (
      <div class="lg:flex lg:items-start">
        <div class="lg:order-2 lg:ml-5">
          <div class="max-w-xl overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img
              class="h-[512px] w-full max-w-full object-contain"
              src={`https://d26xfdx1w8q2y3.cloudfront.net/${count()?.path}/${
                count()?.original
              }`}
              alt=""
            />
          </div>
        </div>
        <div class="mt-2 w-full lg:order-1 lg:w-32 lg:shrink-0">
          <div class="flex flex-row items-start lg:flex-col">
            <button
              type="button"
              onclick={() => setCount(data.image)}
              class={classNames(
                count().id === data.image.id
                  ? "border-gray-900"
                  : "border-transparent",
                "mb-3 flex aspect-square h-20 overflow-hidden rounded-lg border-2 text-center",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img
                class="h-full w-full object-contain"
                src={`https://d26xfdx1w8q2y3.cloudfront.net/${data.image.path}/${data.image.original}`}
                alt=""
              />
            </button>
            {data.ImagesExtra.map((img) => (
              <button
                type="button"
                onclick={() => setCount(img.image)}
                class={classNames(
                  count().id === img.image.id
                    ? "border-gray-900"
                    : "border-transparent",
                  "mb-3 flex aspect-square h-20 overflow-hidden rounded-lg border-2 text-center",
                )}
              >
                <img
                  class="h-full w-full object-contain"
                  src={`https://d26xfdx1w8q2y3.cloudfront.net/${img.image.path}/${img.image.original}`}
                  alt=""
                />
              </button>
            ))}
            {data.Gif && (
              <button
                type="button"
                onclick={() => setCount(data.Gif)}
                class={classNames(
                  count().id === data.Gif.id
                    ? "border-gray-900"
                    : "border-transparent",
                  "mb-3 flex aspect-square h-20 overflow-hidden rounded-lg border-2 text-center",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  class="h-full w-full object-contain"
                  src={`https://d26xfdx1w8q2y3.cloudfront.net/${data.Gif.path}/${data.Gif.original}`}
                  alt=""
                />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};
