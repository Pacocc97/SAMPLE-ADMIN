import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import parse from "html-react-parser";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";
import { type Image, type Seo } from "@acme/db";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import PageComponent from "~/components/PageComponent";
import SideFormElement from "~/components/forms/elements/SideFormElement";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import FixedImage from "~/components/images/FixedImage";
import ProductTable from "~/components/productComponents/ProductTable";
import Accordion from "~/components/productComponents/SEO/Accordion";
import Spinner from "~/components/ui/Spinner";

interface MyHTML {
  [key: string]: string;
}

type SeoPassed = Seo & { openGraphBasicImage: Image };

export default function Page() {
  const session = useSession();
  const canUpdate = hasPermission(session.data, "update_package");
  const canDelete = hasPermission(session.data, "delete_package");
  const router = useRouter();
  const slug = router.query.slug as string;
  const utils = trpc.useContext();
  const [open, setOpen] = useState(false);
  const productPackage = trpc.package.show.useQuery({ slug });
  const productPackageInfo = productPackage.data;
  const productSum = productPackageInfo?.products
    .map((p) => p.price)
    .reduce((acc, o) => acc + o, 0);

  /**
   * Thist function deletes a productPackage from the DB
   */
  const { mutate: deleteproductPackage } = trpc.package.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "El fabricante ha sido borrado!",
        icon: "success",
      });
      await utils.package.all.invalidate();
      await router.push("/admin/fabricante");
    },
  });

  if (productPackage.status === "error") {
    return <div>{productPackage.error.message}</div>;
  }

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteproductPackageHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteproductPackage({ id });
      }
    });
  }

  /**
   * Formats passed value as a price formatted value.
   *
   * @param {number | undefined | null} value
   * @returns {string} formatted value
   */
  function precioFormato(value: number | undefined | null): string {
    return (value ? value / 100 : 0)
      .toFixed(2)
      .toString()
      .replace(/,/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Formats passed description as a html formatted value.
   *
   * @returns {string | JSX.Element | JSX.Element[]} formatted description
   */
  function description(): string | JSX.Element | JSX.Element[] {
    const productDesc = productPackageInfo?.description || "{}";
    const parseDesc = JSON.parse(productDesc) as Object[];

    const htmlKey = parseDesc[1] as MyHTML;
    const myDesc = parse(String(htmlKey?.html));
    return myDesc ? myDesc : "Sin descripción";
  }

  return (
    <PageComponent
      name="package"
      page="show"
      translate="Fabricante"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {productPackage.isLoading ? (
        <Spinner />
      ) : (
        <>
          <nav
            className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
            aria-label="Breadcrumb"
          >
            <Link
              href="/admin/paquetes"
              className="inline-flex items-center space-x-3 text-sm font-medium"
            >
              <ChevronLeftIcon
                className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <span>Paquetes</span>
            </Link>
          </nav>
          <main className="flex-1">
            <div className="py-8 xl:py-10">
              <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:pb-6">
                <div className="mt-5">
                  <div className="flex items-center">
                    <div className="mr-3 shrink-0"></div>
                    <h1 className="text-3xl font-bold text-gray-900  dark:text-gray-100">
                      {productPackageInfo?.name}
                    </h1>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0"></div>
                <div className="flex flex-wrap items-center">
                  <button
                    className="mr-4 inline-flex rounded-lg border  border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
                    type="button"
                    onClick={() => setOpen(true)}
                  >
                    <dd className="text-gray-500 dark:text-gray-400">
                      Ir a SEO
                    </dd>
                    <ArrowRightOnRectangleIcon className="ml-3 w-5" />
                  </button>
                  {productPackageInfo && canUpdate.status && (
                    <a
                      type="button"
                      href={`${productPackageInfo.slug}/editar`}
                      className="mr-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <PencilSquareIcon className="-ml-1 mr-1 w-5" />
                      Editar
                    </a>
                  )}
                  {canDelete.status && productPackageInfo && (
                    <button
                      type="button"
                      className="inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                      onClick={() =>
                        deleteproductPackageHandler(productPackageInfo.id)
                      }
                    >
                      <TrashIcon className="-ml-1 mr-1 w-5" />
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-3">
                <div className="xl:col-span-2 xl:pr-8">
                  <div className="mt-10">
                    {productPackageInfo && productPackageInfo.image && (
                      <FixedImage
                        className="h-96 w-96 rounded-full"
                        image={productPackageInfo.image}
                      />
                    )}
                  </div>
                  <div>
                    <div>
                      <aside className="mt-8 xl:hidden">
                        <h2 className="sr-only">Detalles</h2>
                        <div className="space-y-5">
                          <h2 className="font-medium text-gray-500 dark:text-gray-300">
                            Precio
                          </h2>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon
                              className="h-6 w-6 text-gray-400 dark:text-gray-200"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {precioFormato(productPackageInfo?.price)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6 space-y-8  py-6">
                          <div>
                            <h3 className="font-medium text-gray-500 dark:text-gray-300">
                              Descripción corta
                            </h3>
                            <div className="mt-2 leading-8">
                              {productPackageInfo?.shortDescription}
                            </div>
                          </div>
                          <div>
                            <h2 className="font-medium text-gray-500 dark:text-gray-300">
                              Descripción
                            </h2>
                            <div className="mt-2 leading-8">
                              {description()}
                            </div>
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
                      <div>
                        <div className="pb-4">
                          <h2
                            id="activity-title"
                            className="text-lg font-medium text-gray-900 dark:text-gray-100 "
                          >
                            Productos del paquete
                          </h2>
                        </div>
                        <div className="m-2 pt-2">
                          {productPackageInfo &&
                            ProductTable(productPackageInfo.products)}
                        </div>
                        <p className="mr-10 text-right">
                          Precio total: ${precioFormato(productSum)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
                <aside className="mt-12 hidden xl:block xl:pl-8">
                  <h2 className="sr-only">Detalles</h2>
                  <div className="space-y-5">
                    <h2 className="font-medium text-gray-500 dark:text-gray-300">
                      Precio
                    </h2>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon
                        className="h-6 w-6 text-gray-400 dark:text-gray-200"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {precioFormato(productPackageInfo?.price)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-8  py-6">
                    <div>
                      <h3 className="font-medium text-gray-500 dark:text-gray-300">
                        Descripción corta
                      </h3>
                      <div className="mt-2 leading-8">
                        {productPackageInfo?.shortDescription}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-500 dark:text-gray-300">
                        Descripción
                      </h2>
                      <div className="mt-2 leading-8">{description()}</div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
          {productPackageInfo &&
            productPackageInfo.seo &&
            productPackageInfo.slug && (
              <SideFormElement show={open} onClose={setOpen}>
                <h2 className="mb-10 text-2xl font-semibold leading-4">
                  Información SEO
                </h2>
                <Accordion
                  value={productPackageInfo.seo as SeoPassed}
                  slug={productPackageInfo.slug}
                  className="pl-3"
                />
              </SideFormElement>
            )}
        </>
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
