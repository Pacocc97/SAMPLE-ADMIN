/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { createSignal } from "solid-js";

import type { Session, User } from "@acme/db";

import { Toast } from "~/utils/alerts";
import { apiPublic } from "~/utils/api";

type Props = {
  user: (Session & { user: User }) | null;
  defaultAddress?: any;
  typeForm: string;
};

interface Error {
  identifier?: string;
  street?: string;
  streetNumber?: string;
  apartmentNumber?: string;
  postalCode?: string;
  neighborhood?: string;
  municipality?: string;
  state?: string;
}

function AddressFormComponent(props: Props) {
  const [inputs, setInputs] = createSignal(props.defaultAddress);
  const [errors, setErrors] = createSignal<Error>();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const res = await apiPublic.users.show.query({
      email: props?.user?.user.email || undefined,
    });
    if (props.typeForm === "update") {
      console.log(inputs());
      await apiPublic.address.update
        .mutate({
          ...inputs(),
          id: props.defaultAddress.id,
        })
        .then(() => {
          setErrors((errors) => ({}));
          Toast.fire({
            title: "Dirección actualizada",
            icon: "success",
          });
        })
        .catch((err) => {
          const errArr = JSON.parse(err.shape.message);
          for (let i = 0; i < errArr.length; i++) {
            const currentErr = errArr[i];
            setErrors((errors) => ({
              ...errors,
              [currentErr.path[0]]: currentErr.message,
            }));
          }
        });
      // .finally(() => location.reload());
    } else if (props.typeForm === "create") {
      await apiPublic.address.create
        .mutate({
          ...inputs(),
          userId: res.id,
        })
        .then(() =>
          Toast.fire({
            title: "Dirección agregada",
            icon: "success",
          }),
        )
        .catch((err) => {
          const errArr = JSON.parse(err.shape.message);
          for (let i = 0; i < errArr.length; i++) {
            const currentErr = errArr[i];
            setErrors((errors) => ({
              ...errors,
              [currentErr.path[0]]: currentErr.message,
            }));
          }
        });
      // .finally(() => location.reload());
    }
    // Handle form submission logic here
  };

  const handleChange = (e: Event) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement; // Narrow down the type
    if (!target) return; // Handle the case where target is null or undefined
    const name = target.name;
    const value = target.value;
    if (target.value === "" && name !== "id" && name !== "apartmentNumber") {
      delete inputs()[name];
      // const filterArray = { ...inputs(), name };
      // setInputs(filterArray);
    } else {
      setInputs((values) => ({ ...values, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} class="md:col-span-2">
      <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
        <div class="col-span-3">
          <label class="block text-sm font-medium leading-6 text-black">
            Nombre de la dirección
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.identifier || null}
              placeholder="Ej. Bodega, Sucursal, Matriz"
              type="text"
              name="identifier"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.identifier && (
              <p class="mt-2 text-sm text-red-600">{errors()?.identifier}</p>
            )}
          </div>
        </div>
        <div class="col-span-full">
          <label class="block text-sm font-medium leading-6 text-black">
            Calle
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.street || null}
              type="text"
              name="street"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.street && (
              <p class="mt-2 text-sm text-red-600">{errors()?.street}</p>
            )}
          </div>
        </div>

        <div class="col-span-2">
          <label class="block text-sm font-medium leading-6 text-black">
            Número exterior
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.streetNumber || null}
              type="text"
              name="streetNumber"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.streetNumber && (
              <p class="mt-2 text-sm text-red-600">{errors()?.streetNumber}</p>
            )}
          </div>
        </div>

        <div class="col-span-2">
          <label class="block text-sm font-medium leading-6 text-black">
            Número interior
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.apartmentNumber || null}
              type="text"
              name="apartmentNumber"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.apartmentNumber && (
              <p class="mt-2 text-sm text-red-600">
                {errors()?.apartmentNumber}
              </p>
            )}
          </div>
        </div>

        <div class="col-span-2">
          <label class="block text-sm font-medium leading-6 text-black">
            Código postal
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.postalCode || null}
              type="text"
              name="postalCode"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.postalCode && (
              <p class="mt-2 text-sm text-red-600">{errors()?.postalCode}</p>
            )}
          </div>
        </div>

        <div class="col-span-full">
          <label
            for="confirm-password"
            class="block text-sm font-medium leading-6 text-black"
          >
            Colonia
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.neighborhood || null}
              type="text"
              name="neighborhood"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.neighborhood && (
              <p class="mt-2 text-sm text-red-600">{errors()?.neighborhood}</p>
            )}
          </div>
        </div>
        <div class="col-span-3">
          <label class="block text-sm font-medium leading-6 text-black">
            Municipio
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.municipality || null}
              type="text"
              name="municipality"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.municipality && (
              <p class="mt-2 text-sm text-red-600">{errors()?.municipality}</p>
            )}
          </div>
        </div>

        <div class="col-span-3">
          <label class="block text-sm font-medium leading-6 text-black">
            Estado
          </label>
          <div class="mt-2">
            <input
              onInput={handleChange}
              value={inputs()?.state || null}
              type="text"
              name="state"
              class="block w-full rounded-md border bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            {errors()?.state && (
              <p class="mt-2 text-sm text-red-600">{errors()?.state}</p>
            )}
          </div>
        </div>
      </div>

      <div class="mt-8 flex">
        <button
          type="submit"
          class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Guardar
        </button>
        <a
          href="/perfil"
          class="ml-2 rounded-md bg-slate-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Volver
        </a>
      </div>
    </form>
  );
}

export default AddressFormComponent;
