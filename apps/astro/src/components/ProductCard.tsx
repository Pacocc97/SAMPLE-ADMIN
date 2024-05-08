import type { Product } from "@acme/db";

import "solid-js";

const ProductCard = ({
  product,
  discount,
}: {
  product?: Product;
  discount?: number;
}) => {
  function formatAsPrice(value: Product | undefined) {
    if (value) {
      // (value.price - (value.price * ((userData?.role?.discount || 0)
      let valorNuevo = value.price - value.price * (discount || 0);
      return (valorNuevo /= 100).toLocaleString("es-MX", {
        style: "currency",
        currency: `${value.currency ? value.currency : ""}`,
      });
    }
  }
  return (
    <div class="group relative flex min-w-full flex-col overflow-hidden">
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
            <span aria-hidden="true" class="absolute inset-0"></span>
            {product?.name}
          </a>
        </h3>
        <p class="text-sm text-gray-500">{product?.brand}</p>
        <div class="flex flex-1 flex-col justify-end">
          <p class="text-sm italic text-gray-500">
            {product?.Category?.[0]?.name}
          </p>
          <p class="text-sm font-medium text-gray-900">
            {formatAsPrice(product)} {product?.currency} + IVA
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
