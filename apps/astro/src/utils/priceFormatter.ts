import type { Product } from "../types";

export function formatAsPrice(value: Product): string {
  let valorNuevo = value.price;
  return (valorNuevo /= 100).toLocaleString("es-MX", {
    style: "currency",
    currency: `${value.currency ? value.currency : ""}`,
  });
}
