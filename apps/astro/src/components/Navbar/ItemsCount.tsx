import { useStore } from "@nanostores/solid";
import { createEffect, createSignal } from "solid-js";

import { $counter } from "~/store/counter";

export const ItemsCount = () => {
  const [tasks, setTasks] = createSignal([]);

  createEffect(() => {
    const storedTasks = localStorage.getItem("carrito");
    if (storedTasks) {
      console.log(storedTasks, "storedTasks");
      setTasks(JSON.parse(storedTasks));
    }
  });
  const $Cart = useStore($counter);
  return (
    <>
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
          d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        ></path>
      </svg>
      <span class="sr-only">Notifications</span>
      <div class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white dark:border-gray-900">
        {$Cart}
      </div>
      {/* <div
        id="cartButton"
        class="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 text-xs font-bold text-white dark:border-gray-900"
      ></div> */}
    </>
  );
};
