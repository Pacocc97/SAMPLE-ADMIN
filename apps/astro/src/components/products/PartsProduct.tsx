import { createSignal } from "solid-js";

import { $filters } from "~/store/counter";
import AddToCartForm from "../AddToCartForm";

export const PartsProduct = ({ data, discount }) => {
  const productArray = [...data.parts.map(({ parts }) => parts), data];
  const [getIdArray, setIdArray] = createSignal([]);

  function handleCheck(e) {
    const idValue = e.target.value;
    const isCheck = e.target.checked;
    if (isCheck) {
      setIdArray([...getIdArray(), idValue]);
    } else {
      setIdArray(getIdArray().filter((p) => p !== idValue));
    }
    $filters.set([...getIdArray()]);
  }

  return (
    <>
      <div class="mx-auto max-w-7xl overflow-hidden">
        <h2 class="mt-8 text-base font-medium text-gray-900">
          Partes integrales
        </h2>
        <h2 class="sr-only">Products</h2>
        <div class="-mx-px grid grid-cols-2 border-l border-t border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {data.parts.map(({ parts }) => (
            <div class="group relative border-b border-r border-gray-200 p-2">
              <div class="mb-2 flex items-center">
                <input
                  onChange={(e) => handleCheck(e)}
                  checked={getIdArray().includes(parts.id)}
                  id="green-checkbox"
                  type="checkbox"
                  value={parts.id}
                  class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-green-600 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-green-600"
                />
              </div>
              <div class="h-28 w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
                <img
                  src={`https://d26xfdx1w8q2y3.cloudfront.net/${parts.image.path}/${parts.image.original}`}
                  alt="TODO"
                  class="h-full w-full object-contain object-center"
                />
              </div>
              <div class="pb-4 pt-10 text-center">
                <h3 class="text-sm font-medium text-gray-900">
                  <a href={`/productos/${parts?.slug}`}>
                    <span aria-hidden="true" class=""></span>
                    {parts.name}
                  </a>
                </h3>
                <div class="mt-3 flex flex-col items-center">
                  <p class="mt-1 text-sm text-gray-500">
                    {parts.stock} disponibles
                  </p>
                </div>
                <p class="mt-4 text-base font-medium text-gray-900">
                  $
                  {(
                    (parts.price - parts.price * ((discount || 0) / 10000)) /
                    100
                  )
                    .toFixed(2)
                    .toString()
                    .replace(/,/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {getIdArray().length <= 0 && (
        <p class="mt-1 text-sm text-gray-500">
          Es necesario seleccionar un elemento.
        </p>
      )}

      <div class="mt-10 flex flex-col items-center justify-between space-y-4 border-b border-t py-4 sm:flex-row sm:space-y-0">
        <div class="static flex items-end">
          <div>
            <h1 class="mr-2 text-2xl font-bold">
              $
              {(
                productArray
                  .filter((p) => [...getIdArray(), data.id].includes(p.id))
                  ?.map((p) => p.price - p.price * ((discount || 0) / 10000))
                  ?.reduce((acc, curr) => acc + curr, 0) / 100
              )
                .toFixed(2)
                .toString()
                .replace(/,/g, "")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              <span class="text-base font-normal">{data.currency}</span>
            </h1>
            <p class="ml-2 line-through">
              {data.suggestedPrice &&
                "$" +
                  // (data.suggestedPrice / 100)
                  (
                    productArray
                      .filter((p) => [...getIdArray(), data.id].includes(p.id))
                      ?.map((p) => p.suggestedPrice)
                      ?.reduce((acc, curr) => acc + curr, 0) / 100
                  )
                    .toFixed(2)
                    .toString()
                    .replace(/,/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>
          </div>
        </div>
        <AddToCartForm itemSubArray={productArray} individualParent={data}>
          <button
            type="submit"
            id="alert"
            disabled={getIdArray().length <= 0}
            class={
              getIdArray().length <= 0
                ? "inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-700 bg-none px-8 py-3 text-center text-base font-bold text-white lg:ml-6"
                : "inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-900 bg-none px-8 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow lg:ml-6"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mr-3 h-5 w-5 shrink-0 lg:sr-only xl:not-sr-only xl:mr-3 xl:h-5 xl:w-5 xl:shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
            Añadir al carrito
          </button>
        </AddToCartForm>
      </div>
    </>
  );
};
