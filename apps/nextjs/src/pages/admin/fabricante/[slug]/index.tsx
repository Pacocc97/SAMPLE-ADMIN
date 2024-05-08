import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronLeftIcon,
  GlobeAltIcon,
  GlobeAmericasIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import PageComponent from "~/components/PageComponent";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import FixedImage from "~/components/images/FixedImage";
import ProductTable from "~/components/productComponents/ProductTable";
import Spinner from "~/components/ui/Spinner";

export default function Page() {
  const session = useSession();
  const canUpdate = hasPermission(session.data, "update_producer");
  const canDelete = hasPermission(session.data, "delete_producer");
  const router = useRouter();
  const slug = router.query.slug as string;
  const utils = trpc.useContext();
  const producer = trpc.producer.show.useQuery({ slug });
  const producerInfo = producer.data;
  const producerCategories = [
    ...new Set(
      producerInfo?.product?.map(
        ({product}) => product.Category.filter((c) => c.parentId === null)[0]?.name,
      ),
    ),
  ];
console.log(producerInfo?.product.map(({product}) => product))
  /**
   * Thist function deletes a producer from the DB
   */
  const { mutate: deleteproducer } = trpc.producer.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El fabricante ha sido borrado!",
        icon: "success",
      });
      await utils.producer.all.invalidate();
      await router.push("/admin/fabricante");
    },
  });

  if (producer.status === "error") {
    return <div>{producer.error.message}</div>;
  }

  /**
   * Fromats phone number
   *
   * @param {string} value
   * @returns
   */
  function transformarPhone(value: string) {
    if (!value) return value;
    const currentValue = value.replace(/[^\d]/g, "");
    const cvLength = currentValue.length;
    if (cvLength < 4) return currentValue;
    if (cvLength < 7)
      return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
    return `(${currentValue.slice(0, 3)}) ${currentValue.slice(
      3,
      6,
    )}-${currentValue.slice(6, 10)}`;
  }

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteproducerHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteproducer({ id });
      }
    });
  }

  return (
    <PageComponent
      name="producer"
      page="show"
      translate="Fabricante"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {producer.isLoading ? (
        <Spinner />
      ) : (
        <>
          <main className="flex-1">
            <nav
              className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
              aria-label="Breadcrumb"
            >
              <Link
                href="/admin/fabricante"
                className="inline-flex items-center space-x-3 text-sm font-medium"
              >
                <ChevronLeftIcon
                  className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                />
                <span>Fabricantes</span>
              </Link>
            </nav>
            <div className="py-8 xl:py-10">
              <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:pb-6">
                <div className="mt-5">
                  <div className="flex items-center">
                    <div className="mr-3 flex-shrink-0">
                      {producerInfo && producerInfo.logo && (
                        <FixedImage
                          className="h-10 w-10 rounded-full"
                          image={producerInfo.logo}
                        />
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900  dark:text-gray-100">
                      {producerInfo?.name}
                    </h1>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0"></div>
                <div className="flex flex-wrap items-center">
                  {producerInfo && canUpdate.status && (
                    <a
                      type="button"
                      href={`${producerInfo.slug}/editar`}
                      className="mr-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <PencilSquareIcon className="-ml-1 mr-1 w-5" />
                      Editar
                    </a>
                  )}
                  {canDelete.status && producerInfo && (
                    <button
                      type="button"
                      className="inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => deleteproducerHandler(producerInfo.id)}
                    >
                      <TrashIcon className="-ml-1 mr-1 w-5" />
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-3">
                <div className="xl:col-span-2 xl:pr-8">
                  <div>
                    <div>
                      <aside className="mt-8 xl:hidden">
                        <h2 className="sr-only">Detalles</h2>
                        <div className="space-y-5">
                          <div className="flex items-center space-x-2">
                            <ShieldCheckIcon
                              className="h-6 w-6 text-green-500 dark:text-green-400"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-green-700 dark:text-green-400">
                              Proveedor activo
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ProductBoxIcon
                              className="h-6 w-6 text-gray-400 dark:text-gray-200"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {producerInfo?.product.length} productos
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GlobeAmericasIcon
                              className="h-6 w-6 text-gray-400 dark:text-gray-200"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {producerInfo?.location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GlobeAltIcon
                              className="h-6 w-6 text-gray-400 dark:text-gray-200"
                              aria-hidden="true"
                            />
                            {producerInfo && producerInfo.webSite ? (
                              <a
                                href={producerInfo.webSite}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                              >
                                {producerInfo?.webSite}
                              </a>
                            ) : (
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                Sin página web registrada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-6 space-y-8  py-6">
                          <div>
                            <h2 className="font-medium text-gray-500 dark:text-gray-300">
                              E-mail
                            </h2>
                            <ul role="list" className="mt-2 leading-8">
                              {producerInfo?.emails.map((email) => (
                                <li key={email} className="inline">
                                  <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-green-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      {email}
                                    </div>
                                  </a>{" "}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h2 className="font-medium text-gray-500 dark:text-gray-300">
                              Teléfonos
                            </h2>
                            <ul role="list" className="mt-2 leading-8">
                              {producerInfo?.phones.map((phone) => (
                                <li key={phone} className="inline">
                                  <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  >
                                    <div className="absolute flex flex-shrink-0 items-center justify-center">
                                      <span
                                        className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      {transformarPhone(phone)}
                                    </div>
                                  </a>{" "}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h2 className="font-medium text-gray-500 dark:text-gray-300">
                              Categorías
                            </h2>
                            <ul className="mt-3 list-disc space-y-3  pl-4">
                              {producerCategories
                                .filter((c) => c)
                                ?.map((category, i) => (
                                  <li key={i} className="justify-start">
                                    <div className="items-center space-x-3">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {category}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </aside>
                    </div>
                  </div>
                  <section
                    aria-labelledby="activity-title"
                    className="mt-8 xl:mt-10"
                  >
                    <div>
                      <div className="">
                        <div className="pb-4">
                          <h2
                            id="activity-title"
                            className="text-lg font-medium text-gray-900 dark:text-gray-100 "
                          >
                            Productos fabricados
                          </h2>
                        </div>
                        <div className="m-2 pt-2">
                          {producerInfo && ProductTable(producerInfo?.product.map(({product}) => product))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <aside className="mt-12 hidden xl:block xl:pl-8">
                  <h2 className="sr-only">Detalles</h2>
                  <div className="space-y-5">
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon
                        className="h-6 w-6 text-green-500 dark:text-green-400"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Proveedor activo
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ProductBoxIcon
                        className="h-6 w-6 text-gray-400 dark:text-gray-200"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {producerInfo?.product.length} productos
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GlobeAmericasIcon
                        className="h-6 w-6 text-gray-400 dark:text-gray-200"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {producerInfo?.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GlobeAltIcon
                        className="h-6 w-6 text-gray-400 dark:text-gray-200"
                        aria-hidden="true"
                      />
                      {producerInfo && producerInfo.webSite ? (
                        <a
                          href={producerInfo.webSite}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                        >
                          {producerInfo?.webSite}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Sin página web registrada
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 space-y-8 py-6">
                    <div>
                      <h2 className="font-medium text-gray-500 dark:text-gray-300">
                        E-mail
                      </h2>
                      <ul role="list" className="mt-2 leading-8">
                        {producerInfo?.emails.map((email) => (
                          <li key={email} className="inline">
                            <a
                              href="#"
                              className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-green-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {email}
                              </div>
                            </a>{" "}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-500 dark:text-gray-300">
                        Teléfonos
                      </h2>
                      <ul role="list" className="mt-2 leading-8">
                        {producerInfo?.phones.map((phone) => (
                          <li key={phone} className="inline">
                            <a
                              href="#"
                              className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {transformarPhone(phone)}
                              </div>
                            </a>{" "}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-500 dark:text-gray-300">
                        Categorías
                      </h2>
                      <ul className="mt-3 list-disc space-y-3 pl-4">
                        {producerCategories?.filter(c => c)?.map((category, i) => (
                          <li key={i} className="justify-start">
                            <div className="items-center space-x-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {category}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </>
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
