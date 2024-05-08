/* eslint-disable tailwindcss/no-custom-classname */
/* eslint-disable react/jsx-key */
import { createSignal } from "solid-js";

import "../../styles/range.css";
import type { Category, Image, Product } from "@acme/db";

type Props = {
  categories: Category & { Product: (Product & { image: Image })[] };
  discount: number;
};
type FilterNumber = {
  value: number;
  name: string;
  type: string;
};
type Characteristics = {
  name: string;
  type: string;
  unit: string;
};

type Attributes = {
  name: string;
  unit: string;
  value?: {
    low?: number;
    high?: number;
  };
};

const FilteredCategory = ({ categories, discount }: Props) => {
  const [getFilters, setFilters] = createSignal<string[]>([]);
  const [getFiltersNo, setFiltersNo] = createSignal<FilterNumber[]>([]);
  const [getOpen, setOpen] = createSignal<boolean>(false);

  const products = categories?.Product;
  const characteristics = categories?.characteristics;

  function filter() {
    const td: (Product & { image: Image })[][] = [];
    if (characteristics)
      for (let i = 0; i < (characteristics as Characteristics[]).length; i++) {
        const no =
          getFiltersNo()
            .filter(
              (x) => x.name === (characteristics as Characteristics[])[i].name,
            )
            .find(function (e) {
              return e.type === "low";
            })?.value || 0;
        const na =
          getFiltersNo()
            .filter(
              (x) => x.name === (characteristics as Characteristics[])[i].name,
            )
            .find(function (e) {
              return e.type === "high";
            })?.value || Infinity;
        if ((characteristics as Characteristics[])[i].type === "range") {
          const maxVa = Math.max(
            ...filterCharacteristic(characteristics[i].name).map((c) => c.high),
          );
          if (getFiltersNo()?.length !== 0) {
            const data = products?.filter((x) =>
              (x.attributes as Attributes[])?.find(
                (y) =>
                  y.name == (characteristics as Characteristics[])[i].name &&
                  ((y.value?.low as number) || 0) >= no &&
                  (y.value?.high || maxVa) <= na,
              ),
            );
            td.push(data);
          } else {
            td.push(categories.Product);
          }
        } else if (
          (characteristics as Characteristics[])[i].type === "number"
        ) {
          const maxVa = Math.max(
            ...filterCharacteristic(characteristics[i].name),
          );
          if (getFiltersNo()?.length !== 0) {
            const data = products?.filter((x) =>
              (x.attributes as Attributes[])?.find(
                (y: Attributes) =>
                  y.name == (characteristics as Characteristics[])[i].name &&
                  ((y.value as number) || 0) >= no &&
                  ((y.value as number) || maxVa) <= na,
              ),
            );
            td.push(data);
          } else {
            td.push(categories.Product);
          }
        } else if ((characteristics as Characteristics[])[i].type === "text") {
          const condition1 = getFilters()?.length === 0;
          const products = categories?.Product;
          if (condition1) {
            td.push(products);
          } else {
            const myArr = products?.filter((r) =>
              (r.attributes as Attributes[])?.some((i) =>
                getFilters().includes(i.value as string),
              ),
            );
            td.push(myArr);
          }
        }
      }

    const filteredArr = td
      .flat()
      .filter(
        (x) =>
          getOccurrence(td.flat(), x.id) ===
          (categories.characteristics as Characteristics[])?.length,
      );

    if (filteredArr.length > 0) {
      return [...new Set(filteredArr)];
    } else {
      return categories.Product;
    }
  }
  function getOccurrence(array: Product[], value: string) {
    return array.filter((v) => v.id === value).length;
  }
  function handleRange(e: Event, name: string, type: string) {
    console.log(filter());

    const obj = {
      value: Number((e?.target as HTMLTextAreaElement).value) || 0,
      name,
      type,
    };
    const passedArr: FilterNumber[] = getFiltersNo();
    const filterData = passedArr.some((o: typeof obj) => o.name === obj.name);
    const filterData2 = passedArr.some((o: typeof obj) => o.type === obj.type);

    if (!filterData || !filterData2) {
      return setFiltersNo([...passedArr, obj]);
    } else {
      const filt = passedArr.filter(
        (data) => data.name !== obj.name || data.type !== obj.type,
      );
      return setFiltersNo([...filt, obj]);
    }
  }
  function handleCategoryChange(e: Event) {
    const isValue = (e?.target as HTMLTextAreaElement).value;
    const passedArr: string[] = getFilters();
    if (!getFilters().includes(isValue)) {
      return setFilters([...passedArr, isValue]);
    } else {
      return setFilters((passedArr) =>
        passedArr.filter((data) => data !== isValue),
      );
    }
  }
  function filterCharacteristic(value: string) {
    const productAttributes = categories.Product.map(
      (product) => product.attributes,
    );

    const filterAttributes = productAttributes
      ?.map((attr) =>
        (attr as Attributes[])
          ?.filter((att) => att.name === value)
          .map((x) => x.value),
      )
      .flat()
      .filter((n) => n);
    return filterAttributes;
  }

  function getValues(name, type) {
    const result = getFiltersNo().filter(
      (obj) => obj.name === name && obj.type === type,
    )?.[0]?.value;
    return result;
  }

  function limitValues(car, optionVal) {
    return (
      (getFiltersNo().filter(
        (obj) => obj.name === car.name && obj.type === "high",
      )?.[0]?.value <
      getFiltersNo().filter(
        (obj) => obj.name === car.name && obj.type === "low",
      )?.[0]?.value
        ? getFiltersNo().filter(
            (obj) => obj.name === car.name && obj.type === "high",
          )?.[0]?.value
        : getFiltersNo().filter(
            (obj) => obj.name === car.name && obj.type === "low",
          )?.[0]?.value) ?? 0
    );
  }
  const highVal = (car) =>
    car.type === "range"
      ? Math.max(...filterCharacteristic(car.name).map((char) => char?.high))
      : Math.max(...filterCharacteristic(car.name));
  const minVal = (car) =>
    car.type === "range"
      ? Math.min(...filterCharacteristic(car.name).map((char) => char?.low))
      : Math.min(...filterCharacteristic(car.name));

  return (
    <>
      <div class="relative z-40" role="dialog" aria-modal="true">
        <div
          class={getOpen() ? "fixed inset-0 bg-black bg-opacity-25" : ""}
        ></div>
        <div
          class={
            getOpen()
              ? "fixed inset-0 z-40 flex translate-x-0  transition-all duration-300 ease-out"
              : "fixed left-0 top-0 h-full w-full translate-x-full transition-all duration-300 ease-in"
          }
        >
          <div class="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
            <div class="flex items-center justify-between px-4">
              <h2 class="text-lg font-medium text-gray-900">Filters</h2>
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
                {(categories.characteristics as Characteristics[])?.map(
                  (car) => (
                    <div>
                      <fieldset>
                        <legend class="w-full px-2">
                          <button
                            type="button"
                            class="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500"
                            aria-controls="filter-section-1"
                            aria-expanded="false"
                          >
                            <span class="text-sm font-medium capitalize text-gray-900">
                              {car.name}
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
                        <div class="space-y-3 p-2">
                          {car.type === "text" ? (
                            filterCharacteristic(car.name).map((char) => (
                              <div class="flex items-center">
                                <input
                                  id="color-0"
                                  name="color[]"
                                  value={char as string}
                                  type="checkbox"
                                  class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={getFilters().includes(
                                    char as string,
                                  )}
                                  onchange={(e) => {
                                    handleCategoryChange(e);
                                  }}
                                />
                                <label
                                  for="color-0"
                                  class="ml-3 text-sm text-gray-500"
                                >
                                  {char as string}
                                </label>
                              </div>
                            ))
                          ) : (
                            <div class="mb-6 grid gap-6 md:grid-cols-2">
                              <div>
                                <label
                                  for="first_name"
                                  class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Min {car.unit}
                                </label>
                                <input
                                  type="number"
                                  id="first_name"
                                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                  placeholder="0"
                                  onchange={(e) =>
                                    handleRange(e, car.name, "low")
                                  }
                                />
                              </div>
                              <div>
                                <label
                                  for="last_name"
                                  class="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Max {car.unit}
                                </label>

                                <input
                                  type="number"
                                  id="last_name"
                                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                  placeholder="100"
                                  onchange={(e) =>
                                    handleRange(e, car.name, "high")
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </fieldset>
                    </div>
                  ),
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <main class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div class="border-b border-gray-200 pb-10">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900">
            {categories.name}
          </h1>
          <p class="mt-4 text-base text-gray-500">{categories.description}</p>
        </div>

        <div class="pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
          {categories.characteristics && (
            <aside>
              <h2 class="sr-only">Filtros</h2>

              <button
                onclick={() => setOpen(true)}
                type="button"
                class="inline-flex items-center lg:hidden"
              >
                <span class="text-sm font-medium text-gray-700">Filtros</span>
                <svg
                  class="ml-1 h-5 w-5 shrink-0 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path>
                </svg>
              </button>

              <div class="hidden lg:block">
                <form class="space-y-10 divide-y divide-gray-200">
                  {(categories.characteristics as Characteristics[])?.map(
                    (car) => (
                      <div>
                        <fieldset class="mt-4 rounded-xl">
                          <legend class="block text-sm font-medium capitalize text-gray-900">
                            {car.name}
                          </legend>
                          <div class="space-y-3 p-2">
                            {car.type === "text" ? (
                              filterCharacteristic(car.name).map((char) => (
                                <div class="flex items-center">
                                  <input
                                    id="color-0"
                                    name="color[]"
                                    value={char as string}
                                    type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={getFilters().includes(
                                      char as string,
                                    )}
                                    onchange={(e) => {
                                      handleCategoryChange(e);
                                    }}
                                  />
                                  <label
                                    for="color-0"
                                    class="ml-3 text-sm text-gray-600"
                                  >
                                    {char as string}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <div class="mx-4 my-8 flex w-4/5 flex-col">
                                <div class="relative min-h-[50px]">
                                  <input
                                    id="fromSlider"
                                    type="range"
                                    min={0}
                                    max={highVal(car)}
                                    value={limitValues(car, minVal(car))}
                                    oninput={(e) => {
                                      handleRange(e, car.name, "low");
                                    }}
                                  />
                                  <input
                                    type="range"
                                    min={1}
                                    max={highVal(car)}
                                    value={
                                      getValues(car.name, "high") ??
                                      highVal(car)
                                    }
                                    oninput={(e) => {
                                      handleRange(e, car.name, "high");
                                    }}
                                  />
                                </div>
                                <div class="relative flex justify-between text-base text-gray-700">
                                  <div class="form_control_container">
                                    <div class="form_control_container__time">
                                      Min {car.unit}
                                    </div>
                                    <input
                                      type="number"
                                      value={limitValues(car, minVal(car))}
                                      class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      placeholder={`${minVal(car)}`}
                                      onchange={(e) =>
                                        handleRange(e, car.name, "low")
                                      }
                                    />
                                  </div>
                                  <div class="form_control_container">
                                    <div class="form_control_container__time">
                                      Max {car.unit}
                                    </div>
                                    <input
                                      type="number"
                                      value={
                                        getFiltersNo().filter(
                                          (obj) =>
                                            obj.name === car.name &&
                                            obj.type === "high",
                                        )?.[0]?.value
                                      }
                                      class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                      placeholder={`${
                                        highVal(car) === (-Infinity || Infinity)
                                          ? 100
                                          : highVal(car)
                                      }`}
                                      onchange={(e) =>
                                        handleRange(e, car.name, "high")
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </fieldset>
                      </div>
                    ),
                  )}
                </form>
              </div>
            </aside>
          )}

          <div class="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
            <section
              aria-labelledby="categories-heading"
              class="mx-auto max-w-2xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:max-w-7xl lg:px-8"
            >
              <h2 id="categories-heading" class="sr-only">
              Equipo de laboratorio
              </h2>
              <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                {filter().length !== 0 &&
                  filter()?.map((product) => (
                    <div class="group relative flex overflow-hidden rounded-lg border border-gray-200 bg-white transition duration-75 hover:shadow-md">
                      <div class="group relative flex flex-col overflow-hidden rounded-lg">
                        <div class="aspect-h-4 aspect-w-3 sm:aspect-none group-hover:opacity-75 sm:h-72">
                          {product && (
                            <img
                              src={`https://d26xfdx1w8q2y3.cloudfront.net/${product.image.path}/${product.image.original}`}
                              alt="Eight shirts arranged on table in black, olive, grey, blue, white, red, mustard, and green."
                              class="h-full w-full object-contain object-center p-2 sm:h-full sm:w-full"
                            />
                          )}
                        </div>
                        <div class="flex flex-1 flex-col space-y-2 p-4">
                          <h3 class="text-sm font-medium text-gray-900">
                            <a href={`/${product?.slug}`}>
                              <span
                                aria-hidden="true"
                                class="absolute inset-0"
                              ></span>
                              {product?.name}
                            </a>
                          </h3>
                          <p class="text-sm text-gray-500">{product.model}</p>
                          <div class="flex flex-1 flex-col justify-end">
                            <p class="text-sm italic text-gray-500">
                              {product.shortDescription}
                            </p>
                            <p class="mt-1 text-sm font-medium text-gray-900">
                              {" "}
                              $
                              {(
                                (product.price -
                                  product.price * (discount || 0)) /
                                100
                              )
                                .toFixed(2)
                                .toString()
                                .replace(/,/g, "")
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                              + IVA
                            </p>
                          </div>
                          {/* <div>
                            {product?.attributes?.map((a) => (
                              <div class="mb-4">
                                <p>{a?.name}</p>
                                {typeof a.value === "string" ||
                                typeof a.value === "string" ? (
                                  <p>{a?.value}</p>
                                ) : (
                                  <span>
                                    <p>{a?.value?.low}</p>
                                    <p>{a?.value?.high}</p>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div> */}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default FilteredCategory;
