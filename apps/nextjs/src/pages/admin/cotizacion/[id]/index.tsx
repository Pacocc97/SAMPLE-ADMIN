import { type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import FixedImage from "~/components/images/FixedImage";
import Spinner from "~/components/ui/Spinner";
import { env } from "~/env.mjs";

const secondaryNavigation = [
  { name: "Overview", href: "#", current: true },
  { name: "Activity", href: "#", current: false },
  { name: "Settings", href: "#", current: false },
  { name: "Collaborators", href: "#", current: false },
  { name: "Notifications", href: "#", current: false },
];

export default function Page() {
  const session = useSession();
  const canShowProduct = hasPermission(session.data, "show_product");
  const canUpdate = hasPermission(session.data, "update_quotation");
  const canDelete = hasPermission(session.data, "delete_quotation");
  const router = useRouter();
  const id = router.query.id as string;
  const utils = trpc.useContext();
  const { data: quote, status, error } = trpc.quote.show.useQuery({ id });

  /**
   * Formats passed value as a price formatted value.
   *
   * @param {Product} value
   * @returns {string} formatted value
   */
  function formatAsPrice(value: number): string {
    return (value /= 100).toLocaleString("es-MX", {
      style: "currency",
      currency: "mxn",
    });
  }

  const totalPrice = quote?.products
    ?.map(({ currentPrice }: { currentPrice: number }) => currentPrice)
    ?.reduce((acc: number, curr: number) => acc + curr, 0);

  const stats = [
    {
      name: "Subtotal",
      value: totalPrice ? formatAsPrice(totalPrice * 0.16) : "N/A",
    },
    {
      name: "IVA",
      value: totalPrice ? formatAsPrice(totalPrice * 0.16) : "N/A",
      unit: "16%",
    },
    { name: "Descuento", value: `${(quote?.discount || 0) / 100}%` },
    {
      name: "Número de productos",
      value: quote?.products
        .map(({ quantity }) => quantity)
        .reduce((acc, curr) => acc + curr, 0),
    },
  ];
  // const discount = 1 - openPay.data?.discount / 10000 || 0;

  /**
   * Thist function deletes a quote from the DB
   */
  const { mutate: deletequote, isLoading } = trpc.quote.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La orden ha sido borrado!",
        icon: "success",
      });
      await utils.quote.all.invalidate();
      await router.push("/admin/orden");
    },
  });

  if (status === "error") {
    return <div>{error.message}</div>;
  }

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deletequoteHandler(id?: string) {
    if (id)
      await ConfirmModal.fire({
        confirmButtonText: "Sí, seguir!",
      }).then((result) => {
        if (result.isConfirmed) {
          deletequote({ id });
        }
      });
  }

  console.log(quote);

  return (
    <PageComponent
      name="quotation"
      page="show"
      translate="Orden"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <main className="rounded-md bg-white p-4 dark:bg-inherit">
            <header>
              {/* Secondary navigation */}
              {/* <nav className="flex overflow-x-auto border-b border-white/10 py-4">
                <ul
                  role="list"
                  className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
                >
                  {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={item.current ? "text-indigo-400" : ""}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav> */}
              <nav
                className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
                aria-label="Breadcrumb"
              >
                <Link
                  href="/admin/cotizacion"
                  className="inline-flex items-center space-x-3 text-sm font-medium"
                >
                  <ChevronLeftIcon
                    className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                  <span>Cotizaciones</span>
                </Link>
              </nav>
              <div className="items-left mb-5 flex justify-between">
                <h2 className="mb-2 text-5xl font-semibold">
                  {/* {product?.name} */}
                </h2>
                <div className="flex flex-wrap items-center">
                  <Link
                    href={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                      quote?.pdf?.path || ""
                    }/${quote?.pdf?.original || ""}`}
                    target="_blank"
                    className="mb-2 mr-4 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 hover:text-blue-800 dark:border-gray-600  dark:bg-gray-800 dark:text-gray-400 hover:dark:bg-gray-700 hover:dark:text-gray-200"
                  >
                    Descargar
                  </Link>
                  {canDelete.status && (
                    <button
                      type="button"
                      className="mb-2 inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => deletequoteHandler(quote?.id)}
                    >
                      <TrashIcon className="-ml-1 mr-1 w-5" />
                      Borrar
                    </button>
                  )}
                </div>
              </div>

              {/* Heading */}
              <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4 rounded-t-lg bg-gray-400/10 px-4 py-4 dark:bg-gray-700/10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
                <div>
                  <div className="flex items-center gap-x-3">
                    {/* <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div> */}
                    <h1 className="flex gap-x-3 text-base leading-7">
                      {quote?.user ? (
                        <Link href={`/admin/clientes/${quote?.user?.id}`}>
                          <span className="font-semibold dark:text-white">
                            {quote?.user?.email}
                          </span>
                          <span className="text-gray-600">/</span>
                          <span className="font-semibold dark:text-white">
                            {quote?.user?.name}
                          </span>
                        </Link>
                      ) : (
                        "Sin usuario registrado"
                      )}
                    </h1>
                  </div>
                  <p className="mt-2 text-xs capitalize leading-6 text-gray-400">
                    {quote?.user?.role?.name}
                  </p>
                </div>
                <div className="order-first flex-none rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium capitalize text-indigo-400 ring-1 ring-inset ring-indigo-400/30 sm:order-none">
                  {quote?.user?.role?.type}
                </div>
              </div>
              <object
                data={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                  quote?.pdf?.path || ""
                }/${quote?.pdf?.original || ""}`}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  No se puede mostrar el PDF.{" "}
                  <a
                    href={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                      quote?.pdf?.path || ""
                    }/${quote?.pdf?.original || ""}`}
                  >
                    Descargar
                  </a>{" "}
                  en su lugar.
                </p>
              </object>
              {/* Stats */}
              <div className="grid grid-cols-1 rounded-t-lg bg-gray-400/10 dark:bg-gray-700/10 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, statIdx) => (
                  <div
                    key={stat.name}
                    className={classNames(
                      statIdx % 2 === 1
                        ? "sm:border-l"
                        : statIdx === 2
                        ? "lg:border-l"
                        : "",
                      "border-t px-4 py-6 dark:border-white/5 sm:px-6 lg:px-8",
                    )}
                  >
                    <p className="text-sm font-medium leading-6 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="mt-2 flex items-baseline gap-x-2">
                      <span className="text-4xl font-semibold tracking-tight dark:text-white">
                        {stat.value}
                      </span>
                      {stat.unit ? (
                        <span className="text-sm dark:text-gray-400">
                          {stat.unit}
                        </span>
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>
            </header>

            {/* Activity list */}
            <div className="border-t border-white/10 pt-11">
              <h2 className="px-4 text-base font-semibold leading-7 dark:text-white sm:px-6 lg:px-8">
                Productos cotizados
              </h2>
              <table className="mt-6 w-full whitespace-nowrap text-left">
                <colgroup>
                  <col className="w-full sm:w-4/12" />
                  <col className="lg:w-4/12" />
                  <col className="lg:w-2/12" />
                  <col className="lg:w-1/12" />
                  <col className="lg:w-1/12" />
                </colgroup>
                <thead className="border-b border-white/10 text-sm leading-6 dark:text-white">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8"
                    >
                      Producto
                    </th>
                    <th
                      scope="col"
                      className="hidden py-2 pl-0 pr-8 font-semibold sm:table-cell"
                    >
                      Precio
                    </th>
                    <th
                      scope="col"
                      className="py-2 pl-0 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20"
                    >
                      Cantidad
                    </th>
                    <th
                      scope="col"
                      className="hidden py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
                    >
                      Importe
                    </th>
                    {/* <th
                      scope="col"
                      className="hidden py-2 pl-0 pr-4 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                    >
                      Deployed at
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5">
                  {quote?.products?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
                        <div className="flex items-center gap-x-4">
                          <FixedImage
                            image={item.product.image}
                            // alt=""
                            className="h-8 w-8 rounded-full bg-gray-800"
                          />
                          <div className="truncate text-sm font-medium leading-6 text-black dark:dark:text-white">
                            {canShowProduct ? (
                              <Link
                                href={`/admin/producto/${item?.product?.slug}`}
                              >
                                {item.product.name}
                              </Link>
                            ) : (
                              item.product.name
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
                        <div className="flex gap-x-3">
                          <div className="font-mono text-sm leading-6 dark:text-gray-400">
                            {formatAsPrice(item.currentPrice)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pl-0 pr-4 text-sm leading-6 sm:pr-8 lg:pr-20">
                        <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="hidden py-4 pl-0 pr-8 text-sm leading-6 dark:text-gray-400 md:table-cell lg:pr-20">
                        {formatAsPrice(item.currentPrice * item.quantity)}
                      </td>
                      {/* <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
                        hola
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
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
