import { createSignal } from "solid-js";

import type {
  Category,
  Gif,
  Image,
  ImagesExtra,
  Pdf,
  Product,
  ProductComplement,
} from "@acme/db";

import { $filters } from "~/store/counter";
import AddToCartForm from "./AddToCartForm";

type MyProduct = Product & {
  manual: Pdf;
  brochure: Pdf;
  image: Image;
  Gif: Gif;
  complement: MyProduct;
  Category: Category[];
  ImagesExtra: (ImagesExtra & {
    image: Image;
  })[];
};

type Props = {
  data: ProductComplement & { complement: Product & { Category: Category } }[];
  product: MyProduct;
  discount?: number;
};

export const ComplementProduct = ({ data, product, discount }: Props) => {
  const productArray = data ? [...data.map((p) => p.complement), product] : [];
  const [getIdArray, setIdArray] = createSignal<string[]>(
    productArray.map((p) => p.id),
  );

  function handleCheck(
    e: Event & { currentTarget: HTMLInputElement; target: HTMLInputElement },
  ) {
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
    <div class="border-y border-gray-300 bg-white">
      <div class="max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">
          Comprados juntos habitualmente
        </h2>

        <div class="mt-6 flex flex-row items-center">
          <div class="relative rounded-lg bg-gray-50 p-2">
            <div class="w-full overflow-hidden rounded-md bg-transparent lg:h-80">
              <img
                src={`https://d26xfdx1w8q2y3.cloudfront.net/${product.image.path}/${product.image.original}`}
                alt="Front of men's Basic Tee in black."
                class="h-full w-full object-contain object-center lg:h-full lg:w-full"
              />
            </div>
            <div class="mt-4 flex flex-wrap justify-between">
              <div class="">
                <h3 class="text-sm text-gray-700">
                  <p
                  //  href={`/productos/${product.slug}`}
                  >
                    <span aria-hidden="true" />
                    {product?.name}
                  </p>
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  {
                    product.Category.find((c: Category) => c.parentId === null)
                      ?.name
                  }
                </p>
              </div>
              <p class="text-sm font-medium text-gray-900">
                {" "}
                $
                {
                  // (product?.price / 100)
                  (
                    (product?.price -
                      product?.price * ((discount || 0) / 10000)) /
                    100
                  )
                    .toFixed(2)
                    .toString()
                    .replace(/,/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              </p>
            </div>
            <input
              value={product.id}
              onChange={(e) => handleCheck(e)}
              checked={getIdArray().includes(product.id)}
              type="checkbox"
              class="absolute  right-2 top-2 h-6 w-6"
            />
          </div>

          <div class="mx-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>

          {data?.map((p, i: number) => (
            <>
              <div class="relative rounded-lg bg-gray-50 p-2">
                <div class="w-full overflow-hidden rounded-md bg-transparent lg:h-80">
                  <img
                    src={`https://d26xfdx1w8q2y3.cloudfront.net/${p.complement.image.path}/${p.complement.image.original}`}
                    alt="Front of men's Basic Tee in black."
                    class="h-full w-full object-contain object-center lg:h-full lg:w-full"
                  />
                </div>
                <div class="mt-4 flex flex-wrap justify-between">
                  <a href={`${p.complement.slug}`}>
                    <div
                    // class="flex flex-col justify-between"
                    >
                      <h3 class="text-sm text-gray-700">
                        <p
                        //  href={`/productos/${p.complement.slug}`}
                        >
                          <span aria-hidden="true" />
                          {p.complement?.name}
                        </p>
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        {
                          p.complement.Category.find(
                            (c: Category) => c.parentId === null,
                          )?.name
                        }
                      </p>
                    </div>
                    <p class="h-6 w-6  text-sm font-medium text-gray-900">
                      {" "}
                      $
                      {
                        // (p.complement?.price / 100)
                        (
                          (p.complement?.price -
                            p.complement?.price * ((discount || 0) / 10000)) /
                          100
                        )
                          .toFixed(2)
                          .toString()
                          .replace(/,/g, "")
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    </p>
                  </a>
                  <input
                    value={p.complement.id}
                    onChange={(e) => handleCheck(e)}
                    checked={getIdArray().includes(p.complement.id)}
                    type="checkbox"
                    class="absolute right-2 top-2 h-6 w-6"
                  />
                </div>
              </div>
              {data.length !== i + 1 && (
                <div class="mx-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
              )}
            </>
          ))}

          <div class="ml-12 mt-10 items-center justify-between space-y-4 py-4 sm:flex-row sm:space-y-0">
            <div class="static mb-4 flex items-end">
              <div class="inline-flex">
                <span class=" lg:ml-6">Total:</span>
                <h1 class="text-lg font-bold">
                  $
                  {(
                    productArray
                      .filter((p) => getIdArray().includes(p.id))
                      ?.map(
                        (p) => p.price - p.price * ((discount || 0) / 10000),
                      )
                      ?.reduce((acc, curr) => acc + curr, 0) / 100
                  )
                    .toFixed(2)
                    .toString()
                    .replace(/,/g, "")
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  <span class="text-base font-normal">{data?.currency}</span>
                </h1>
              </div>
            </div>
            {getIdArray().length > 0 ? (
              <AddToCartForm itemArray={productArray}>
                <button
                  type="submit"
                  id="alert"
                  class="inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-900 bg-none px-8 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out hover:bg-gray-800 focus:shadow lg:ml-6"
                >
                  Añadir
                </button>
              </AddToCartForm>
            ) : (
              <button
                type="submit"
                id="alert"
                disabled
                class="inline-flex items-center justify-center rounded-md border-2 border-transparent bg-gray-500 bg-none px-8 py-3 text-center text-base font-bold text-white transition-all duration-200 ease-in-out focus:shadow lg:ml-6"
              >
                Añadir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
