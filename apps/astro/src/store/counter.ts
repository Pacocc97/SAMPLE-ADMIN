import { atom } from "nanostores";

const local = JSON.parse(localStorage.getItem("carrito"));

const $counter = atom(
  local?.map((p) => p.quantity).reduce((partialSum, a) => partialSum + a, 0),
);

function increaseCounter() {
  const value = JSON.parse(localStorage.getItem("carrito"))
    ?.map((p) => p.quantity)
    .reduce((partialSum, a) => partialSum + a, 0);
  $counter.set(value);
}

function decreaseCounter() {
  if ($counter.get() > 0) {
    $counter.set($counter?.get() - 1);
  }
}

const value = local
  ?.map((p) => p.price * p.quantity)
  .reduce((partialSum, a) => partialSum + a, 0);

const valueParts =
  local
    ?.map((p) => p?.parts?.map((pt) => pt?.price * pt?.quantity))
    ?.filter((n) => n)
    ?.flat(1)
    .reduce((partialSum, a) => partialSum + a, 0) || 0;

const $price = atom(value + valueParts);

function updatePrice() {
  const value = JSON.parse(localStorage.getItem("carrito"))
    ?.map((p) => p.price * p.quantity)
    .reduce((partialSum, a) => partialSum + a, 0);

  const valueParts =
    JSON.parse(localStorage.getItem("carrito") as string)
      ?.map((p) => p?.parts?.map((pt) => pt?.price * pt?.quantity))
      ?.filter((n) => n)
      ?.flat(1)
      .reduce((partialSum, a) => partialSum + a, 0) || 0;

  if (valueParts) {
    const totalSum = value + valueParts;
    $price.set(totalSum);
  } else {
    $price.set(value);
  }
}

const $filters = atom([]);

export {
  $counter,
  $price,
  $filters,
  increaseCounter,
  decreaseCounter,
  updatePrice,
};
