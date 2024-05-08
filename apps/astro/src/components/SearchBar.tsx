import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { api, apiPublic } from "~/utils/api";

export const SearchBar = () => {
  const [getSearch, setSearch] = createSignal([]);
  const [getSearchValue, setSearchValue] = createSignal("");

  async function handleInput(e) {
    const value = e.target.value;
    setSearchValue(value);
    const data = await apiPublic.search.all.query({ value });
    if (data) {
      setSearch(data);
    } else {
      setSearch([]);
    }
  }

  return (
    <div class="relative">
      <div class="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
        <div class="w-full max-w-lg lg:max-w-xs">
          <label for="search" class="sr-only">
            Buscar
          </label>
          <div class="relative">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              id="search"
              autocomplete="off"
              name="search"
              class="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Buscar"
              type="search"
              onInput={handleInput}
            />
          </div>
        </div>
      </div>

      {getSearch().length > 0 && (
        <div class="absolute left-0 top-10 z-40 rounded-lg border bg-white">
          <ul class="w-80 space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200">
            {getSearch()
              .slice(0, 5)
              .map(({ item }) => (
                <li>
                  <a
                    onClick={() => setSearch([])}
                    href={`/${item.slug}`}
                    class="flex rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div
                    // class="flex h-5 items-center"
                    >
                      {item.image && (
                        <img
                          src={`https://d26xfdx1w8q2y3.cloudfront.net/${item.image.path}/${item.image.original}`}
                          alt={""} //aquí va el alt
                          class="mt-2 w-14 rounded border-gray-300 bg-gray-100 object-contain"
                        />
                      )}
                    </div>
                    <div class="ml-2 cursor-pointer text-sm">
                      <div class="font-medium text-gray-900 dark:text-gray-300">
                        <div>{item.name}</div>
                        <p class="text-xs font-normal text-gray-500 dark:text-gray-300">
                          {item.Category.find((c) => c.parentId === null)?.name}
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            <li class="border-t">
              <a
                onClick={() => setSearch([])}
                href={`/busqueda/${getSearchValue()}`}
                class="flex rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div class="flex h-5 items-center">
                  {/* <img
                src={`https://d26xfdx1w8q2y3.cloudfront.net/${item.image.path}/${item.image.original}`}
                alt={item.image.alt}
                class="h-9 w-9 rounded border-gray-300 bg-gray-100"
              /> */}
                </div>
                <div class="ml-2 cursor-pointer text-sm">
                  <div class="font-medium text-gray-900 dark:text-gray-300">
                    <div>Ver más resutlados</div>
                    <p class="text-xs font-normal text-gray-500 dark:text-gray-300">
                      Todos los resultados de "{getSearchValue()}".
                    </p>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
