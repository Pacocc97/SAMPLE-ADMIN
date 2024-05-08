/* eslint-disable @typescript-eslint/no-unused-vars */

import { useStore } from "@nanostores/solid";
import { createEffect, createSignal } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

import type { Category, Gif, Image, ImagesExtra, Pdf, Product } from "@acme/db";

import { $filters, increaseCounter, updatePrice } from "~/store/counter";
import { addCartItem } from "~/store/product";

type MyProduct = Product & {
  id: string;
  image: Image;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  manual: Pdf;
  brochure: Pdf;
  Gif: Gif;
  complement: MyProduct;
  Category: Category[];
  ImagesExtra: (ImagesExtra & {
    image: Image;
  })[];
};
type Props = {
  item?: any; //MyProduct;
  itemArray?: any; //MyProduct[];
  itemSubArray?: any; //MyProduct[];
  individualParent?: any; //MyProduct;
  children: JSX.Element;
};

type CartInfo = {
  id: string;
  image: Image;
  name: string;
  price: number;
  quantity: number;
  SKU: string;
  slug: string;
  parts?: {
    id: string;
    name: string;
    slug: string;
    image: Image;
    price: number;
  }[];
};

export default function AddToCartForm({
  children,
  item,
  itemArray,
  itemSubArray,
  individualParent,
}: Props) {
  // we'll hardcode the item info for simplicity!S

  const [tasks, setTasks] = createSignal<CartInfo[]>([]);

  createEffect(() => {
    const storedTasks = localStorage.getItem("carrito");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  });

  createEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(tasks()));
  });

  const addTask = (task: CartInfo) => {
    setTasks((prevState) => [...prevState, task]);
  };

  // const deleteTask = (id: string) => {
  //   setTasks((prevState) => prevState.filter((t) => t.id !== id));
  // };

  // const toggleTask = (id: string) => {
  //   setTasks((prevState) =>
  //     prevState.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)),
  //   );
  // };

  const updateTask = (task: { id: string; quantity: number }) => {
    setTasks((prevState) =>
      prevState.map((t) =>
        t.id === task.id ? { ...t, quantity: task.quantity } : t,
      ),
    );
  };
  const handleFormSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (item) {
      const product = {
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        SKU: item.SKU,
        price: item.price,
        quantity: 1,
      };
      const existingEntry = tasks().find((t) => t.id === item?.id);
      if (existingEntry) {
        const obj = {
          ...existingEntry,
          quantity: existingEntry.quantity + 1,
        };
        updateTask(obj);
        increaseCounter();
        updatePrice();
      } else {
        addTask(product);
        addCartItem(product);
        increaseCounter();
        updatePrice();
      }
    }
    // setTasks("");
  };

  const handleFormArray = (e: SubmitEvent) => {
    e.preventDefault();
    const filters = useStore($filters);
    const arr = itemArray?.filter((p) =>
      (filters().map((p) => p) as string[]).includes(p.id),
    );
    if (arr) {
      for (const item of arr) {
        const product = {
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          SKU: item.SKU,
          quantity: 1,
        };

        const existingEntry = tasks().find((t) => t.id === item?.id);
        if (existingEntry) {
          const obj = {
            ...existingEntry,
            quantity: existingEntry.quantity + 1,
          };
          updateTask(obj);
          increaseCounter();
          updatePrice();

          window.location.href = "/carrito";
        } else {
          addTask(product);
          addCartItem(product);
          window.location.href = "/carrito";
          increaseCounter();
          updatePrice();
        }
      }
    }
  };

  const handleFormSubArray = (e: SubmitEvent) => {
    e.preventDefault();
    const filters = useStore($filters);
    const arr = itemSubArray?.filter((p) =>
      (filters().map((p) => p) as string[]).includes(p.id),
    );
    if (arr && individualParent) {
      const priceAll = arr
        .map((item) => item.price)
        .reduce((acc, curr) => acc + curr, individualParent.price);
      const idArr = arr.map((product) => product.id);
      const product = {
        id: individualParent.id + "," + idArr.join(),
        name: individualParent.name,
        slug: individualParent.slug,
        image: individualParent.image,
        SKU: individualParent.SKU,
        price: individualParent.price, //priceAll,
        quantity: 1,
        parts: arr.map((product) => {
          const obj = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            SKU: individualParent.SKU,
            image: product.image,
            price: product.price,
            quantity: 1,
          };
          return obj;
        }),
      };
      const existingEntry = tasks().find((t) => t.id === item?.id);
      if (existingEntry) {
        const obj = {
          ...existingEntry,
          quantity: existingEntry.quantity + 1,
        };
        updateTask(obj);
        increaseCounter();
        updatePrice();

        // window.location.href = "/carrito";
      } else {
        addTask(product);
        addCartItem(product);
        // window.location.href = "/carrito";
        increaseCounter();
        updatePrice();
      }
      // }
    }
  };
  function addToCart(e: SubmitEvent) {
    e.preventDefault();
    if (item) handleFormSubmit(e);
    if (itemArray) handleFormArray(e);
    if (itemSubArray) handleFormSubArray(e);
  }

  return <form onSubmit={addToCart}>{children}</form>;
}
