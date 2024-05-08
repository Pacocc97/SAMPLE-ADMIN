import { useStore } from "@nanostores/solid";
import { createEffect, createSignal } from "solid-js";

import { $price, updatePrice } from "~/store/counter";
import type { CartProduct } from "./CartProducts";

type Props = {
  discount?: number;
};

const CartSummary = ({ discount }: Props) => {
  const price = useStore($price);
  const [tasks, setTasks] = createSignal<number>();

  createEffect(() => {
    const storedTasks = localStorage.getItem("carrito");
    if (price()) {
      setTasks(price);
    } else if (storedTasks) {
      const value = JSON.parse(storedTasks)
        .map(
          (product) =>
            (product.price - product.price * (discount || 0)) *
            product.quantity,
        )
        .reduce((acc, curr) => acc + curr, 0);

      const valueParts =
        JSON.parse(storedTasks)
          .map((p: CartProduct) =>
            p.parts?.map((pt: CartProduct) => pt?.price * pt?.quantity),
          )
          ?.filter((n) => n)
          ?.flat(1)
          .reduce((partialSum, a) => partialSum + a, 0) || 0;
      setTasks(value + valueParts);
    } else {
      return;
    }
  });

  function formatAsPrice(value: number) {
    return (value /= 100).toLocaleString("es-MX", {
      style: "currency",
      currency: `mxn`,
    });
  }
  return (
    <dl class="mt-6 space-y-4">
      <div class="flex items-center justify-between">
        <dt class="text-sm text-gray-600">Subtotal {}</dt>
        <dd id="orderSubtotal" class="text-sm font-medium text-gray-900">
          {tasks()
            ? formatAsPrice(tasks() - tasks() * (discount || 0))
            : "$00.00"}
          {/* (tasks() - (tasks() * ((discount || 0)))) */}
        </dd>
      </div>
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt class="flex items-center text-sm text-gray-600">
          <span>Envío</span>
          <a
            href="#"
            class="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">
              Learn more about how shipping is calculated
            </span>
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
        </dt>
        <dd class="text-sm font-medium text-gray-900">$0.00</dd>
      </div>
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt class="flex text-sm text-gray-600">
          <span>IVA</span>
          <a
            href="#"
            class="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Learn more about how tax is calculated</span>
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </a>
        </dt>
        <dd id="orderIva" class="text-sm font-medium text-gray-900">
          {tasks()
            ? formatAsPrice((tasks() - tasks() * (discount || 0)) * 0.16)
            : "$00.00"}
        </dd>
      </div>
      <div class="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt class="text-base font-medium text-gray-900">Total de orden</dt>
        <dd id="orderTotal" class="text-base font-medium text-gray-900">
          {tasks()
            ? formatAsPrice((tasks() - tasks() * (discount || 0)) * 1.16)
            : "$00.00"}
        </dd>
      </div>
    </dl>
  );
};

export default CartSummary;
