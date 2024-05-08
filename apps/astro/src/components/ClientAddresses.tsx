/* eslint-disable react/jsx-key */

import type { Address, Role, User } from "@acme/db";

import { apiPublic } from "~/utils/api";

type Props = {
  user:
    | (User & {
        role: Role | null;
        address: Address[];
      })
    | null
    | undefined;
};

function ClientAddresses({ user }: Props) {
  /**
   * Thist function deletes a package from the DB
   */

  async function deleteAddress(addressId: string) {
    await apiPublic.address.delete.mutate({ id: addressId });
    location.reload();
  }

  return (
    <>
      {user?.address ? (
        user?.address?.map((address) => (
          <div class="flex flex-col justify-between rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
            <div class="flex-auto px-6 pt-6">
              <dt class="text-sm font-semibold normal-case leading-6 text-gray-900">
                Información de{" "}
                {address?.identifier ? (
                  <span class="capitalize">{address?.identifier}</span>
                ) : (
                  "Dirección sin nombre"
                )}
              </dt>
            </div>
            <h2 class="sr-only">Summary</h2>
            <div class="flex flex-wrap">
              <div class="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                <dt class="flex-none">
                  <span class="sr-only">Client</span>
                  <svg
                    class="h-6 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </dt>
                <dd class="text-sm font-medium leading-6 text-gray-900">
                  {`${address.street} ${address.streetNumber}${
                    address.apartmentNumber && ` Int.${address.apartmentNumber}`
                  }, ${address.neighborhood}, ${address.municipality}, ${
                    address.state
                  }, ${address.postalCode}.`}
                </dd>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-3 border-t border-gray-900/5 px-6 py-2">
              <a
                href={`/actualizar_direccion_${address.id}`}
                class="col-span-2 text-xs font-semibold leading-6 text-gray-900"
              >
                Editar dirección <span aria-hidden="true">&rarr;</span>
              </a>
              <button
                onclick={() => deleteAddress(address.id)}
                class="justify-self-end"
              >
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
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Sin direcciones agregadas</p>
      )}
    </>
  );
}

export default ClientAddresses;
