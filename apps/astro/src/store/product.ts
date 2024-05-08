import { persistentAtom, persistentMap } from "@nanostores/persistent";
import { useStore } from "@nanostores/solid";
import { action, atom, map } from "nanostores";

import type { Product } from "@acme/db";

export type CartItem = {
  id: string;
  name: string;
  imageSrc: string;
  quantity: number;
};

// const product = atom(() => {
//   action(product, "product", (value) => schema);
// });
export type CartItemDisplayInfo = Pick<CartItem, "id" | "name" | "imageSrc">;
export const cartItems = map<Record<any, any>>({});

// export function addCartItem(value: any) {
//   cartItems.set(value);
// }

export function addCartItem(value) {
  // const existingEntry = cartItems.get()[id];
  // if (existingEntry) {
  // cartItems.setKey(value.id, {
  //   ...existingEntry,
  //   quantity: existingEntry.quantity + 1,
  // });
  // } else {
  const { id, ...data } = value;
  cartItems.setKey(value.id, {
    id,
    quantity: 1,
  });
}
// }
