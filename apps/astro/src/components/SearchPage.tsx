import { createSignal } from "solid-js";

import { apiPublic } from "~/utils/api";
import "../styles/range.css";

type FilterNumber = {
  value: number;
  name: string;
  type: string;
};

const SearchPage = ({
  text,
  discount,
}: {
  text?: string;
  discount?: number;
}) => {
  const [getSearch, setSearch] = createSignal([]);
  const [getSearchValue, setSearchValue] = createSignal(text || "");
  const [getFiltersNo, setFiltersNo] = createSignal<FilterNumber[]>([]);

  async function handleInput(e?: Event) {
    e?.preventDefault();

    const value = e ? e?.target?.value : text;
    setSearchValue(value);
    const data = await apiPublic.search.all.query({ value: value });
    if (data) {
      setSearch(data);
    } else {
      setSearch([]);
    }
  }

  handleInput();

  function filter() {
    const no =
      getFiltersNo().find(function (e) {
        return e.type === "low";
      })?.value || 0;
    const na =
      getFiltersNo().find(function (e) {
        return e.type === "high";
      })?.value || Infinity;

    if (getFiltersNo().length > 0) {
      return getSearch().filter(
        (x) =>
          ((x.item.price - x.item.price * (discount || 0)) / 100).toFixed(2) >=
            no &&
          ((x.item.price - x.item.price * (discount || 0)) / 100).toFixed(2) <=
            na,
      );
    } else {
      return getSearch();
    }
  }

  function handleRange(e: Event, name: string, type: string) {
    e?.preventDefault();

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

  function getValues(type) {
    const result = getFiltersNo().filter((obj) => obj.type === type)?.[0]
      ?.value;
    return result;
  }

  function limitValues() {
    return (
      (getFiltersNo().filter((obj) => obj.type === "high")?.[0]?.value <
      getFiltersNo().filter((obj) => obj.type === "low")?.[0]?.value
        ? getFiltersNo().filter((obj) => obj.type === "high")?.[0]?.value
        : getFiltersNo().filter((obj) => obj.type === "low")?.[0]?.value) ?? 0
    );
  }

  return (
    <div>
      <div class="border-b px-24 py-10">
        <form>
          <div class="flex">
            <label
              for="search-dropdown"
              class="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your Email
            </label>
            <button
              id="dropdown-button"
              data-dropdown-toggle="dropdown"
              class="z-10 inline-flex flex-shrink-0 items-center rounded-l-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700"
              type="button"
            >
              Todo
              {/* <svg
                aria-hidden="true"
                class="ml-1 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg> */}
            </button>
            {/* <div
              id="dropdown"
              class="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow dark:bg-gray-700"
            >
              <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdown-button"
              >
                <li>
                  <button
                    type="button"
                    class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Mockups
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Templates
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Design
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Logos
                  </button>
                </li>
              </ul>
            </div> */}
            <div class="relative w-full">
              <input
                type="search"
                id="search-dropdown"
                class="z-20 block w-full rounded-r-lg border border-l-2 border-gray-300 border-l-gray-50 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:border-l-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
                placeholder="Busque en nuestro catálogo de productos . . . "
                required
                value={getSearchValue()}
                onInput={handleInput}
              />
              <button
                type="submit"
                class="absolute right-0 top-0 rounded-r-lg border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  aria-hidden="true"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span class="sr-only">Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="bg-white">
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4">
            <h2 class="mb-5 text-xl">Búsqueda: "{getSearchValue()}"</h2>
            <h3 class="text-md mb-5 font-semibold">
              Resultados: {filter().length}
            </h3>
            <div>
              <fieldset class="mt-4 max-w-xs rounded-xl">
                <legend class="block text-sm font-medium capitalize text-gray-900">
                  Precio
                </legend>
                <div class="mx-1 my-16 flex flex-col">
                  <div class="relative min-h-[50px]">
                    <input
                      disabled={getSearch().length <= 0}
                      id="fromSlider"
                      type="range"
                      min={0}
                      max={Math.max(
                        ...getSearch().map((r) =>
                          (
                            (r.item.price - r.item.price * (discount || 0)) /
                              100 +
                            1
                          ).toFixed(2),
                        ),
                      )}
                      value={limitValues()}
                      oninput={(e) => {
                        handleRange(e, "price", "low");
                      }}
                    />
                    <input
                      disabled={getSearch().length <= 0}
                      type="range"
                      min={1}
                      max={Math.max(
                        ...getSearch().map((r) =>
                          (
                            (r.item.price - r.item.price * (discount || 0)) /
                              100 +
                            1
                          ).toFixed(2),
                        ),
                      )}
                      value={
                        getValues("high") ??
                        Math.max(
                          ...getSearch().map((r) =>
                            (
                              (r.item.price - r.item.price * (discount || 0)) /
                                100 +
                              1
                            ).toFixed(2),
                          ),
                        )
                      }
                      oninput={(e) => {
                        handleRange(e, "price", "high");
                      }}
                    />
                  </div>
                  <div class="relative flex justify-between text-base text-gray-700">
                    <div class="form_control_container">
                      <div class="form_control_container__time">Min</div>
                      <input
                        disabled={getSearch().length <= 0}
                        type="number"
                        value={limitValues()}
                        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        placeholder={`${
                          Math.min(
                            ...getSearch().map((r) =>
                              (
                                (r.item.price -
                                  r.item.price * (discount || 0)) /
                                100
                              ).toFixed(2),
                            ),
                          ) === Infinity
                            ? 0
                            : Math.min(
                                ...getSearch().map((r) =>
                                  (
                                    (r.item.price -
                                      r.item.price * (discount || 0)) /
                                    100
                                  ).toFixed(2),
                                ),
                              )
                        }`}
                        onchange={(e) => handleRange(e, "price / 100", "low")}
                      />
                    </div>
                    <div class="form_control_container">
                      <div class="form_control_container__time">Max</div>
                      <input
                        disabled={getSearch().length <= 0}
                        type="number"
                        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        value={
                          getFiltersNo().filter(
                            (obj) => obj.type === "high",
                          )?.[0]?.value
                        }
                        placeholder={`${
                          Math.max(
                            ...getSearch().map((r) =>
                              (
                                (r.item.price -
                                  r.item.price * (discount || 0)) /
                                  100 +
                                1
                              ).toFixed(2),
                            ),
                          ) === (-Infinity || Infinity)
                            ? 100
                            : Math.max(
                                ...getSearch().map((r) =>
                                  (
                                    (r.item.price -
                                      r.item.price * (discount || 0)) /
                                      100 +
                                    1
                                  ).toFixed(2),
                                ),
                              )
                        }`}
                        onchange={(e) => handleRange(e, "price", "high")}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          {getSearch().length > 0 ? (
            <div class="col-span-3 ml-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
              <h2 class="sr-only">Products</h2>

              <div class="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
                {filter().map(({ item }) => (
                  <div class="group relative border-b border-r border-gray-200 p-4 sm:p-6">
                    <div class="aspect-square overflow-hidden rounded-lg bg-gray-200 p-2 group-hover:opacity-75">
                      <img
                        src={`https://d26xfdx1w8q2y3.cloudfront.net/${item.image.path}/${item.image.original}`}
                        alt={item.image.alt}
                        class="h-60 w-full object-contain object-center"
                      />
                    </div>
                    <div class="pb-4 pt-10 text-center">
                      <h3 class="text-sm font-medium text-gray-900">
                        <a href={`/${item.slug}`}>
                          <span
                            aria-hidden="true"
                            class="absolute inset-0"
                          ></span>
                          {item.name}
                        </a>
                      </h3>

                      <p class="mt-4 text-base font-medium text-gray-900">
                        $
                        {
                          // (item.price / 100)
                          ((item.price - item.price * (discount || 0)) / 100)
                            .toFixed(2)
                            .toString()
                            .replace(/,/g, "")
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }{" "}
                        + IVA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p class="mt-10 text-center text-4xl font-semibold">Sin búsqueda</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
