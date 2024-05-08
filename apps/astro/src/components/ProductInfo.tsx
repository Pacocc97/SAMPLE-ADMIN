import { createSignal } from "solid-js";

import { classNames } from "~/utils/classNames";
import type { Pdf } from "~/types";

interface MyHTML {
  [key: string]: string;
}

interface Props {
  description: string | null;
  brochure: Pdf | null;
  manual: Pdf | null;
}

export const ProductInfo = ({ description, manual, brochure }: Props) => {
  const [getValor, setValor] = createSignal("desc");

  function descriptionFormat(desc: string): string {
    const productDesc = desc || "{}";
    const parseDesc = JSON.parse(productDesc) as Object[];
    const htmlKey = parseDesc[1] as MyHTML;
    return htmlKey["html"];
  }
  return (
    <div class="lg:col-span-3">
      <div class="border-b border-gray-300">
        <nav class="flex gap-4">
          <button
            onClick={() => setValor("desc")}
            title=""
            class={classNames(
              getValor() === "desc"
                ? "border-gray-900  text-gray-900 hover:border-gray-400 hover:text-gray-800"
                : "inline-flex items-center border-transparent text-gray-600",
              "border-b-2 py-4 text-sm font-medium",
            )}
          >
            Descripción
          </button>

          {brochure && (
            <button
              onClick={() => setValor("brochure")}
              title=""
              class={classNames(
                getValor() === "brochure"
                  ? "border-gray-900  text-gray-900 hover:border-gray-400 hover:text-gray-800"
                  : "inline-flex items-center border-transparent text-gray-600",
                "border-b-2 py-4 text-sm font-medium",
              )}
            >
              Ficha técnica
              {/* <span class="ml-2 block rounded-full bg-gray-500 px-2 py-px text-xs font-bold text-gray-100"> {data.rating.count} </span> */}
            </button>
          )}
          {manual && (
            <button
              onClick={() => setValor("manual")}
              title=""
              class={classNames(
                getValor() === "manual"
                  ? "border-gray-900  text-gray-900 hover:border-gray-400 hover:text-gray-800"
                  : "inline-flex items-center border-transparent text-gray-600",
                "border-b-2 py-4 text-sm font-medium",
              )}
            >
              Manual
              {/* <span class="ml-2 block rounded-full bg-gray-500 px-2 py-px text-xs font-bold text-gray-100"> {data.rating.count} </span> */}
            </button>
          )}
        </nav>
      </div>

      <div class="mt-8 flow-root sm:mt-12">
        <h1 class="mt-8 text-3xl font-bold">
          {" "}
          {getValor() === "desc" && "Descripción"}
          {getValor() === "manual" && "Manual"}
          {getValor() === "brochure" && "Ficha técnica"}
        </h1>
        {getValor() === "desc" && description && (
          <div
            class="mt-4"
            innerHTML={descriptionFormat(description).toString()}
          />
        )}
      </div>
      {getValor() === "manual" && manual && (
        <div>
          <embed
            class="my-5 h-96 w-full rounded-lg border"
            src={`https://d26xfdx1w8q2y3.cloudfront.net/${manual.path}/${manual.original}`}
            type="application/pdf"
          />
        </div>
      )}
      {getValor() === "brochure" && brochure && (
        <div>
          <embed
            class="my-5 h-96 w-full rounded-lg border"
            src={`https://d26xfdx1w8q2y3.cloudfront.net/${brochure.path}/${brochure.original}`}
            type="application/pdf"
          />
        </div>
      )}
    </div>
  );
};
