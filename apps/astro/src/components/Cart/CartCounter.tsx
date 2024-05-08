import { createEffect, createSignal } from "solid-js";

import type { Image } from "@acme/db";

type CartProduct = {
  id: string;
  slug: string;
  name: string;
  image: Image;
  price: number;
  quantity: number;
};

export const CartCounter = () => {
  const [tasks, setTasks] = createSignal<Array<CartProduct>>([]);

  createEffect(() => {
    const storedTasks = localStorage.getItem("carrito");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  });
  createEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(tasks()));
  });
  // const cartInfo = localStorage.getItem("carrito");
  // const cartItems = JSON.parse(cartInfo)
  //   .map((cart) => cart.quantity)
  //   .reduce((pv, cv) => pv + cv, 0);
  // if (cartItems > 0) {
  //   document.getElementById("cartButton").innerHTML = cartItems;
  // }

  return (
    <div
      id="cartButton"
      class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white dark:border-gray-900"
    >
      {tasks()
        .map((cart) => cart.quantity)
        .reduce((pv, cv) => pv + cv, 0)}
    </div>
  );
};
