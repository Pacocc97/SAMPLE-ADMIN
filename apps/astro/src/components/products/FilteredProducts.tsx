import { createSignal } from "solid-js";

import type { Image } from "@acme/db";

import type { Category, Product } from "../../types";
import ProductCard from "../ProductCard";

type Props = {
  categoryFilter: (Category & {
    image: Image | null;
    Product: (Product & {
      image: Image;
    })[];
    parent: Category | null;
    child: Category[];
  })[];
  products: Product[];
  discount?: number;
};

const FilteredProducts = ({ categoryFilter, products, discount }: Props) => {
  const [getFilters, setFilters] = createSignal<string[]>([]);
  const [getOpen, setOpen] = createSignal<boolean>(false);

  const filtersCheck = () => {
    if (getFilters().length === 0) {
      return products;
    } else {
      const myArr = products?.filter((r) =>
        r.Category?.some((i) => getFilters().includes(i.name)),
      );
      return myArr;
    }
  };

  function handleCategoryChange(e: any) {
    const isValue = e.target.value;
    const passedArr: string[] = getFilters();
    if (!getFilters().includes(isValue)) {
      return setFilters([...passedArr, isValue]);
    } else {
      return setFilters((passedArr) =>
        passedArr.filter((data) => data !== e.target.value),
      );
    }
  }

  return (
    <>
      {getOpen() && (
        <div class="relative z-40 lg:hidden" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-black bg-opacity-25"></div>

          <div class="fixed inset-0 z-40 flex">
            <div class="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
              <div class="flex items-center justify-between px-4">
                <h2 class="text-lg font-medium text-gray-900">Filtros</h2>
                <button
                  type="button"
                  class="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                  onclick={() => setOpen(false)}
                >
                  <span class="sr-only">Close menu</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <form class="mt-4">
                <div class="border-t border-gray-200 py-4">
                  <fieldset>
                    <legend class="w-full px-2">
                      <button
                        type="button"
                        class="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500"
                        aria-controls="filter-section-0"
                        aria-expanded="false"
                      >
                        <span class="text-sm font-medium text-gray-900">
                          Categorías
                        </span>
                        <span class="ml-6 flex h-7 items-center">
                          <svg
                            class="h-5 w-5 rotate-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                        </span>
                      </button>
                    </legend>
                    <div class="px-4 pb-2 pt-4" id="filter-section-0">
                      <div class="space-y-6">
                        {categoryFilter.map((cat) => (
                          <div class="flex items-center">
                            <input
                              id="color-0-mobile"
                              name="color[]"
                              value={cat.name}
                              type="checkbox"
                              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={getFilters().includes(cat.name)}
                              onchange={(e) => {
                                handleCategoryChange(e);
                              }}
                            />
                            <label
                              for="color-0-mobile"
                              class="ml-3 text-sm text-gray-500"
                            >
                              {cat.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <div class="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
        <div class="border-b border-gray-200 pb-10 pt-24">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">
          Equipo de laboratorio
          </h1>
          <p class="mt-4 text-base text-gray-500">
            Revise nuestro catálogo de productos
          </p>
        </div>

        <div class="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          <aside>
            <h2 class="sr-only">Filtros</h2>

            <button
              type="button"
              onclick={() => setOpen((prev) => !prev)}
              class="inline-flex items-center lg:hidden"
            >
              <span class="text-sm font-medium text-gray-700">Filtros</span>
              <svg
                class="ml-1 h-5 w-5 shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>

            <div class="hidden lg:block">
              <form class="space-y-10 divide-y divide-gray-200">
                <div>
                  <div>
                    <legend class="block text-sm font-medium text-gray-900">
                      Categorías
                    </legend>
                    <div class="space-y-3 pt-6">
                      {categoryFilter.map((cat: Category) => (
                        <div class="flex items-center">
                          <input
                            id="color-0"
                            name="color[]"
                            value={cat.name}
                            type="checkbox"
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={getFilters().includes(cat.name)}
                            onchange={(e) => {
                              handleCategoryChange(e);
                            }}
                          />
                          <label
                            for="color-0"
                            class="ml-3 text-sm text-gray-600"
                          >
                            {cat.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div class="pt-10"></div>
              </form>
            </div>
          </aside>

          <section
            aria-labelledby="product-heading"
            class="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
          >
            <h2 id="product-heading" class="sr-only">
              Products
            </h2>

            <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
              {filtersCheck().length !== 0
                ? filtersCheck()?.map((p: Product) => (
                    <div class="group relative flex overflow-hidden rounded-lg border border-gray-200 bg-white transition duration-75 hover:shadow-md">
                      <ProductCard
                        discount={discount}
                        product={p}
                      ></ProductCard>
                    </div>
                  ))
                : "Sin productos asiganos a esta categoría"}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default FilteredProducts;
