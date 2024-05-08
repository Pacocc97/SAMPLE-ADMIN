/* eslint-disable react/jsx-key */

import { useStore } from "@nanostores/solid";
import { createEffect, createSignal } from "solid-js";

import type { Image } from "@acme/db";

import { increaseCounter, updatePrice } from "~/store/counter";
import { addCartItem } from "~/store/product";

export type CartProduct = {
  id: string;
  slug: string;
  name: string;
  image: Image;
  price: number;
  quantity: number;
  parts?: CartProduct[];
};

type Props = {
  discount: number;
};

export const CartProducts = ({ discount }: Props) => {
  const [tasks, setTasks] = createSignal<Array<CartProduct>>([]);

  createEffect(() => {
    const storedTasks = localStorage.getItem("carrito");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  });
  createEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(tasks()));
  });

  function formatAsPrice(value: CartProduct | undefined) {
    if (value) {
      let valorNuevo = value.price - value.price * (discount || 0);
      return (valorNuevo /= 100).toLocaleString("es-MX", {
        style: "currency",
        currency: `mxn`,
      });
    }
  }
  const numberArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const quantityArr = (numberSelected: number) =>
    numberArr.map((n) => {
      const obj = {
        value: n,
        text: n,
        selected: n === numberSelected,
      };
      return obj;
    });

  function removeItem(product) {
    setTasks((prevState) => prevState.filter((t) => t.id !== product.id));
    increaseCounter();
    updatePrice();
  }

  function updateItem(newQty: number, task: CartProduct) {
    setTasks((prevState) =>
      prevState.map((t) =>
        t.id === task.id
          ? {
              ...t,
              quantity: newQty,
              parts: t.parts?.map((p) => ({ ...p, quantity: newQty })),
            }
          : t,
      ),
    );

    increaseCounter();
    updatePrice();
  }

  return (
    <>
      {tasks().map((t) => (
        <li class="flex  py-6 sm:py-10">
          <div class="shrink-0">
            <img
              src={`https://d26xfdx1w8q2y3.cloudfront.net/${t.image.path}/${t.image.original}`}
              alt="Front of men's Basic Tee in sienna."
              class="h-24 w-24 rounded-md object-contain object-center sm:h-48 sm:w-48"
            />
          </div>

          <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
            <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
              <div>
                <div class="flex justify-between">
                  <h3 class="text-sm">
                    <a
                      href={`/${t.slug}`}
                      class="font-medium text-gray-700 hover:text-gray-800"
                    >
                      {t.name}
                    </a>
                  </h3>
                </div>
                <div class="mt-1 flex text-sm">
                  {/* <p class="text-gray-500">Sienna</p> */}
                  {/* <p class="ml-4 border-l border-gray-200 pl-4 text-gray-500">
                    Large
                  </p> */}
                </div>
                <p class="mt-1 text-sm font-medium text-gray-900">
                  {formatAsPrice(t)}
                </p>
              </div>

              <div class="mt-4 sm:mt-0 sm:pr-9">
                <label for="quantity-0" class="sr-only">
                  Quantity, Basic Tee
                </label>
                <select
                  id="quantity-0"
                  name="quantity-0"
                  class="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  onchange={(e) => updateItem(Number(e.target.value), t)}
                >
                  {quantityArr(t.quantity).map((qty) => (
                    <option selected={qty.selected} value={qty.value}>
                      {qty.text}
                    </option>
                  ))}
                </select>
                <div class="absolute right-0 top-0">
                  <button
                    type="button"
                    class="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                    onclick={() => removeItem(t)}
                  >
                    <span class="sr-only">Remover</span>
                    <svg
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {t.parts && (
              <ul
                role="list"
                class="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200"
              >
                {t.parts?.map((p) => (
                  <li class="flex py-6">
                    <div class="flex-shrink-0">
                      <img
                        src={`https://d26xfdx1w8q2y3.cloudfront.net/${p.image.path}/${p.image.original}`}
                        alt="Front side of mint cotton t-shirt with wavey lines pattern."
                        class="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                      />
                    </div>
                    <div class="ml-4 flex flex-1 flex-col sm:ml-6">
                      <div>
                        <div class="flex justify-between">
                          <h4 class="text-sm">
                            <a
                              href="#"
                              class="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {p.name}
                            </a>
                          </h4>
                          <p class="ml-4 text-sm font-medium text-gray-900">
                            {" "}
                            {formatAsPrice(p)}
                          </p>
                        </div>
                        {/* <p class="mt-1 text-sm text-gray-500">Mint</p>
                <p class="mt-1 text-sm text-gray-500">Medium</p> */}
                      </div>

                      <div class="mt-4 flex flex-1 items-end justify-between">
                        <p class="flex items-center space-x-2 text-sm text-gray-700">
                          <svg
                            class="h-5 w-5 flex-shrink-0 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <span>Disponible en almacén</span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p class="mt-4 flex space-x-2 text-sm text-gray-700">
              <svg
                class="h-5 w-5 shrink-0 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Disponible en almacén</span>
            </p>
          </div>
        </li>
      ))}
    </>
  );
};
