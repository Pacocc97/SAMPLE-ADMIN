import { type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  FaceFrownIcon,
  FaceSmileIcon,
  FireIcon,
  HandThumbUpIcon,
  HeartIcon,
  UserCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { type OpenPayType } from "@acme/api/src/router/openPay";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";
import { type OpenPayData, type User } from "@acme/db";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import Spinner from "~/components/ui/Spinner";

const activity = [
  {
    id: 1,
    type: "created",
    person: { name: "Chelsea Hagon" },
    date: "7d ago",
    dateTime: "2023-01-23T10:32",
  },
  {
    id: 2,
    type: "edited",
    person: { name: "Chelsea Hagon" },
    date: "6d ago",
    dateTime: "2023-01-23T11:03",
  },
  {
    id: 3,
    type: "sent",
    person: { name: "Chelsea Hagon" },
    date: "6d ago",
    dateTime: "2023-01-23T11:24",
  },
  {
    id: 4,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: "2023-01-23T15:56",
  },
  {
    id: 5,
    type: "viewed",
    person: { name: "Alex Curren" },
    date: "2d ago",
    dateTime: "2023-01-24T09:12",
  },
  {
    id: 6,
    type: "paid",
    person: { name: "Alex Curren" },
    date: "1d ago",
    dateTime: "2023-01-24T09:20",
  },
];
const moods = [
  {
    name: "Excited",
    value: "excited",
    icon: FireIcon,
    iconColor: "text-white",
    bgColor: "bg-red-500",
  },
  {
    name: "Loved",
    value: "loved",
    icon: HeartIcon,
    iconColor: "text-white",
    bgColor: "bg-pink-400",
  },
  {
    name: "Happy",
    value: "happy",
    icon: FaceSmileIcon,
    iconColor: "text-white",
    bgColor: "bg-green-400",
  },
  {
    name: "Sad",
    value: "sad",
    icon: FaceFrownIcon,
    iconColor: "text-white",
    bgColor: "bg-yellow-400",
  },
  {
    name: "Thumbsy",
    value: "thumbsy",
    icon: HandThumbUpIcon,
    iconColor: "text-white",
    bgColor: "bg-blue-500",
  },
  {
    name: "I feel nothing",
    value: null,
    icon: XMarkIconMini,
    iconColor: "text-gray-400",
    bgColor: "bg-transparent",
  },
];

export default function Page() {
  const session = useSession();
  const canUpdate = hasPermission(session.data, "update_order");
  const canDelete = hasPermission(session.data, "delete_order");
  const router = useRouter();
  const id = router.query.id as string;
  const utils = trpc.useContext();
  const order = trpc.order.show.useQuery({ id });
  const { data: openPay } = trpc.openpay.show.useQuery<OpenPayData>({
    id: order.data?.openPayId as string,
  }) as { data: OpenPayData & { user: User; openPay: OpenPayType } };

  const discount = 1 - (openPay?.discount ?? 0) / 10000 || 0;

  /**
   * Thist function deletes a order from the DB
   */
  const { mutate: deleteorder } = trpc.order.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La orden ha sido borrado!",
        icon: "success",
      });
      await utils.order.all.invalidate();
      await router.push("/admin/orden");
    },
  });

  if (order.status === "error") {
    return <div>{order.error.message}</div>;
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
  async function deleteorderHandler(id?: string) {
    if (id)
      await ConfirmModal.fire({
        confirmButtonText: "Sí, seguir!",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteorder({ id });
        }
      });
  }

  /**
   * Formats passed value as a price formatted value.
   *
   * @param {Product} value
   * @returns {string} formatted value
   */
  function formatAsPrice(value: any): string {
    return (value /= 100).toLocaleString("es-MX", {
      style: "currency",
      currency: "mxn",
    });
  }

  function paymentStatus(value: string) {
    switch (value) {
      case "completed":
        return "pagado";
      case "in_progress":
        return "procesando";
      case "failed":
        return "fallido";

      default:
        return "Sin información";
    }
  }

  const shippingAddress = order?.data?.shippingAddress as {
    apartmentNumber?: string | null;
    streetNumber?: string | null;
    street?: string | null;
    neighborhood?: string | null;
    municipality?: string | null;
    state?: string | null;
    postalCode?: string | null;
  };

  const billingAddress = order?.data?.billingAddress as {
    apartmentNumber?: string | null;
    streetNumber?: string | null;
    street?: string | null;
    neighborhood?: string | null;
    municipality?: string | null;
    state?: string | null;
    postalCode?: string | null;
  };

  return (
    <PageComponent
      name="order"
      page="show"
      translate="Orden"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {order.isLoading ? (
        <Spinner />
      ) : (
        <>
          <main>
            <nav
              className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
              aria-label="Breadcrumb"
            >
              <Link
                href="/admin/orden"
                className="inline-flex items-center space-x-3 text-sm font-medium"
              >
                <ChevronLeftIcon
                  className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-200"
                  aria-hidden="true"
                />
                <span>Ordenes</span>
              </Link>
            </nav>
            <div className="items-left flex justify-between">
              <h2 className="mb-2 text-5xl font-semibold">
                {/* {product?.name} */}
              </h2>
              <div className="flex flex-wrap items-center">
                {canDelete.status && (
                  <button
                    type="button"
                    className="mb-2 inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                    onClick={() => deleteorderHandler(order?.data?.id)}
                  >
                    <TrashIcon className="-ml-1 mr-1 w-5" />
                    Borrar
                  </button>
                )}
              </div>
            </div>
            <header className="relative isolate">
              <div
                className="absolute inset-0 -z-10 overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute left-16 top-full -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
                  <div
                    className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
                    style={{
                      clipPath:
                        "polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
                    }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
              </div>

              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
                  <div className="flex items-center gap-x-6">
                    {/*eslint-disable-next-line @next/next/no-img-element*/}
                    <img
                      src="https://tailwindui.com/img/logos/48x48/tuple.svg"
                      alt=""
                      className="h-16 w-16 flex-none rounded-full ring-1 ring-gray-900/10"
                    />
                    <h1>
                      <div className="text-sm leading-6 text-gray-500 dark:text-gray-200">
                        Recibo{" "}
                        <span className="text-gray-700 dark:text-gray-300">
                          #{order?.data?.id}
                        </span>
                      </div>
                      <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                        {openPay?.user?.email}
                      </div>
                    </h1>
                  </div>
                  <div className="flex items-center gap-x-4 sm:gap-x-6">
                    {/* <button
                      type="button"
                      className="hidden text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50 sm:block"
                    >
                      Copy URL
                    </button>
                    <a
                      href="#"
                      className="hidden text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50 sm:block"
                    >
                      Edit
                    </a>
                    <a
                      href="#"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Send
                    </a> */}

                    {/* <Menu as="div" className="relative sm:hidden">
                      <Menu.Button className="-m-3 block p-3">
                        <span className="sr-only">More</span>
                        <EllipsisVerticalIcon
                          className="h-5 w-5 text-gray-500 dark:text-gray-200"
                          aria-hidden="true"
                        />
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                type="button"
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900 dark:text-gray-50",
                                )}
                              >
                                Copy URL
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-50",
                                )}
                              >
                                Edit
                              </a>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu> */}
                  </div>
                </div>
              </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {/* Recibo summary */}
                <div className="lg:col-start-3 lg:row-end-1">
                  <h2 className="sr-only">Summary</h2>
                  <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5 dark:bg-slate-700">
                    <dl className="flex flex-wrap">
                      <div className="flex-auto pl-6 pt-6">
                        <dt className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
                          Cantidad
                        </dt>
                        <dd className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
                          {openPay?.openPay?.amount?.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "mxn",
                          })}
                        </dd>
                      </div>
                      <div className="flex-none self-end px-6 pt-4">
                        <dt className="sr-only">Status</dt>
                        <dd
                          className={classNames(
                            openPay?.openPay.status === "completed"
                              ? "bg-green-50 text-green-600 ring-green-600/20"
                              : "",
                            openPay?.openPay.status === "in_progress"
                              ? "bg-yellow-50-50 text-yellow-600 ring-yellow-600/20"
                              : "",
                            openPay?.openPay.status === "failed"
                              ? "bg-red-50 text-red-600 ring-red-600/20"
                              : "",
                            "rounded-md px-2 py-1 text-xs font-medium capitalize ring-1 ring-inset",
                            // "rounded-md bg-green-50 px-2 py-1 text-xs font-medium capitalize text-green-600 ring-1 ring-inset ring-green-600/20",
                          )}
                        >
                          {paymentStatus(openPay?.openPay?.status)}
                        </dd>
                      </div>
                      <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6">
                        <dt className="flex-none">
                          <span className="sr-only">Client</span>
                          <UserCircleIcon
                            className="h-6 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </dt>
                        <dd className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-50">
                          {openPay?.user?.name}
                        </dd>
                      </div>
                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                        <dt className="flex-none">
                          <span className="sr-only">Due date</span>
                          <CalendarDaysIcon
                            className="h-6 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </dt>
                        <dd className="text-sm leading-6 text-gray-500 dark:text-gray-200">
                          <time dateTime="2023-01-31">
                            {openPay?.openPay.operation_date}
                          </time>
                        </dd>
                      </div>
                      <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                        <dt className="flex-none">
                          <span className="sr-only">Status</span>
                          <CreditCardIcon
                            className="h-6 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </dt>
                        <dd className="text-sm leading-6 text-gray-500 dark:text-gray-200">
                          Pagado con{" "}
                          <span className="capitalize">
                            {openPay?.openPay?.card.brand}
                          </span>
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-6 border-t border-gray-900/5 px-6 py-6">
                      {/* <a
                        href="#"
                        className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50"
                      >
                        Download receipt <span aria-hidden="true">&rarr;</span>
                      </a> */}
                    </div>
                  </div>
                </div>

                {/* Recibo */}
                <div className="-mx-4 bg-white px-4 py-8  shadow-sm ring-1 ring-gray-900/5 dark:bg-slate-700 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
                  <h2 className="text-base  font-semibold leading-6 text-gray-900 dark:text-gray-50">
                    Recibo
                  </h2>
                  <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
                    <div className="sm:pr-4">
                      <dt className="inline text-gray-500 dark:text-gray-200">
                        Emitido el
                      </dt>{" "}
                      <dd className="inline text-gray-700 dark:text-gray-300">
                        <time dateTime="2023-23-01">January 23, 2023</time>
                      </dd>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:pl-4">
                      <dt className="inline text-gray-500 dark:text-gray-200">
                        Pagado el
                      </dt>{" "}
                      <dd className="inline text-gray-700 dark:text-gray-300">
                        <time dateTime="2023-31-01">January 31, 2023</time>
                      </dd>
                    </div>
                    <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4">
                      <dt className="font-semibold text-gray-900 dark:text-gray-50">
                        Envío
                      </dt>
                      <dd className="mt-2 text-gray-500 dark:text-gray-200">
                        {/* <span className="font-medium text-gray-900 dark:text-gray-50">
                          Acme, Inc.
                        </span> */}
                        <br />
                        {shippingAddress?.apartmentNumber}{" "}
                        {shippingAddress?.streetNumber},{" "}
                        {shippingAddress?.street} <br />
                        {shippingAddress?.neighborhood},{" "}
                        {shippingAddress?.municipality},{" "}
                        {shippingAddress?.state} <br />
                        {shippingAddress?.postalCode}
                      </dd>
                    </div>
                    <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6">
                      <dt className="font-semibold text-gray-900 dark:text-gray-50">
                        Facturación
                      </dt>
                      <dd className="mt-2 text-gray-500 dark:text-gray-200">
                        {/* <span className="font-medium text-gray-900 dark:text-gray-50">
                          Tuple, Inc
                        </span> */}
                        <br />
                        {billingAddress?.apartmentNumber}{" "}
                        {billingAddress?.streetNumber}, {billingAddress?.street}{" "}
                        <br />
                        {billingAddress?.neighborhood},{" "}
                        {billingAddress?.municipality}, {billingAddress?.state}{" "}
                        <br />
                        {billingAddress?.postalCode}
                      </dd>
                    </div>
                  </dl>
                  <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
                    <colgroup>
                      <col className="w-full" />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <thead className="border-b border-gray-200 text-gray-900 dark:text-gray-50">
                      <tr>
                        <th scope="col" className="px-0 py-3 font-semibold">
                          Productos
                        </th>
                        <th
                          scope="col"
                          className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                        >
                          Cantidad
                        </th>
                        <th
                          scope="col"
                          className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                        >
                          Precio
                        </th>
                        <th
                          scope="col"
                          className="py-3 pl-8 pr-0 text-right font-semibold"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.data?.products.map(({ quantity, product }) => (
                        <tr
                          key={product.id}
                          className="border-b border-gray-100"
                        >
                          <td className="max-w-0 px-0 py-5 align-top">
                            <div className="truncate font-medium text-gray-900 dark:text-gray-50">
                              {product.name}
                            </div>
                            <div className="truncate text-gray-500 dark:text-gray-200">
                              {product.SKU}
                            </div>
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300 sm:table-cell">
                            {quantity}
                          </td>
                          <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300 sm:table-cell">
                            {formatAsPrice(product.price)}
                          </td>
                          <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-gray-300">
                            {formatAsPrice(product.price * quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th
                          scope="row"
                          className="px-0 pb-0 pt-6 font-normal text-gray-700 dark:text-gray-300 sm:hidden"
                        >
                          Subtotal
                        </th>
                        <th
                          scope="row"
                          colSpan={3}
                          className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 dark:text-gray-300 sm:table-cell"
                        >
                          Subtotal
                        </th>
                        <td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900 dark:text-gray-50">
                          {formatAsPrice(
                            order.data?.products
                              .map(
                                (product) =>
                                  product.currentPrice * product.quantity,
                              )
                              .reduce((acc, curr) => acc + curr, 0),
                          )}
                        </td>
                      </tr>
                      {discount && (
                        <tr>
                          <th
                            scope="row"
                            colSpan={3}
                            className="hidden pt-4 text-right font-normal text-gray-700 dark:text-gray-300 sm:table-cell"
                          >
                            Descuento
                          </th>
                          <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900 dark:text-gray-50">
                            {openPay?.discount ? openPay?.discount / 100 : 0}%
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th
                          scope="row"
                          colSpan={3}
                          className="hidden pt-4 text-right font-normal text-gray-700 dark:text-gray-300 sm:table-cell"
                        >
                          Envío
                        </th>
                        <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900 dark:text-gray-50">
                          $0.00
                        </td>
                      </tr>
                      <tr>
                        <th
                          scope="row"
                          colSpan={3}
                          className="hidden pt-4 text-right font-semibold text-gray-900 dark:text-gray-50 sm:table-cell"
                        >
                          Total
                        </th>
                        <td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                          {formatAsPrice(
                            //@ts-ignore
                            order?.data?.products
                              ?.map(
                                (product) =>
                                  product.currentPrice * product.quantity,
                              )
                              .reduce(
                                (acc: number, curr: number) => acc + curr,
                                0,
                              ) *
                              1.16 *
                              discount,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div>
                  {/* <div className="lg:col-start-3">
                  {/* Activity feed 
                  <h2 className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
                    Activity
                  </h2>
                  <ul role="list" className="mt-6 space-y-6">
                  {activity.map((activityItem, activityItemIdx) => (
                      <li
                      key={activityItem.id}
                      className="relative flex gap-x-4"
                      >
                        <div
                          className={classNames(
                            activityItemIdx === activity.length - 1
                              ? "h-6"
                              : "-bottom-6",
                              "absolute left-0 top-0 flex w-6 justify-center",
                          )}
                        >
                          <div className="w-px bg-gray-200" />
                        </div>
                        {activityItem.type === "commented" ? (
                          <>
                          <img
                          src={activityItem.person.imageUrl}
                              alt=""
                              className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                            />
                            <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                              <div className="flex justify-between gap-x-4">
                                <div className="py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-200">
                                  <span className="font-medium text-gray-900 dark:text-gray-50">
                                    {activityItem.person.name}
                                  </span>{" "}
                                  commented
                                </div>
                                <time
                                  dateTime={activityItem.dateTime}
                                  className="flex-none py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-200"
                                >
                                  {activityItem.date}
                                </time>
                              </div>
                              <p className="text-sm leading-6 text-gray-500 dark:text-gray-200">
                                {activityItem.comment}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                              {activityItem.type === "paid" ? (
                                <CheckCircleIcon
                                  className="h-6 w-6 text-indigo-600"
                                  aria-hidden="true"
                                />
                              ) : (
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                              )}
                            </div>
                            <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-200">
                              <span className="font-medium text-gray-900 dark:text-gray-50">
                                {activityItem.person.name}
                              </span>{" "}
                              {activityItem.type} the invoice.
                            </p>
                            <time
                              dateTime={activityItem.dateTime}
                              className="flex-none py-0.5 text-xs leading-5 text-gray-500 dark:text-gray-200"
                            >
                              {activityItem.date}
                            </time>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* New comment form
                  <div className="mt-6 flex gap-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                      className="h-6 w-6 flex-none rounded-full bg-gray-50"
                    />
                    <form action="#" className="relative flex-auto">
                      <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                        <label htmlFor="comment" className="sr-only">
                          Add your comment
                        </label>
                        <textarea
                          rows={2}
                          name="comment"
                          id="comment"
                          className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder="Add your comment..."
                          defaultValue={""}
                        />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center space-x-5">
                          <div className="flex items-center">
                            <button
                              type="button"
                              className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-200"
                            >
                              <PaperClipIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Attach a file</span>
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Listbox value={selected} onChange={setSelected}>
                              {({ open }) => (
                                <>
                                  <Listbox.Label className="sr-only">
                                    Your mood
                                  </Listbox.Label>
                                  <div className="relative">
                                    <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-200">
                                      <span className="flex items-center justify-center">
                                        {selected.value === null ? (
                                          <span>
                                            <FaceSmileIcon
                                              className="h-5 w-5 flex-shrink-0"
                                              aria-hidden="true"
                                            />
                                            <span className="sr-only">
                                              Add your mood
                                            </span>
                                          </span>
                                        ) : (
                                          <span>
                                            <span
                                              className={classNames(
                                                selected.bgColor,
                                                "flex h-8 w-8 items-center justify-center rounded-full",
                                              )}
                                            >
                                              <selected.icon
                                                className="h-5 w-5 flex-shrink-0 text-white"
                                                aria-hidden="true"
                                              />
                                            </span>
                                            <span className="sr-only">
                                              {selected.name}
                                            </span>
                                          </span>
                                        )}
                                      </span>
                                    </Listbox.Button>

                                    <Transition
                                      show={open}
                                      as={Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <Listbox.Options className="absolute z-10 -ml-6 mt-1 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                        {moods.map((mood) => (
                                          <Listbox.Option
                                            key={mood.value}
                                            className={({ active }) =>
                                              classNames(
                                                active
                                                  ? "bg-gray-100"
                                                  : "bg-white",
                                                "relative cursor-default select-none px-3 py-2",
                                              )
                                            }
                                            value={mood}
                                          >
                                            <div className="flex items-center">
                                              <div
                                                className={classNames(
                                                  mood.bgColor,
                                                  "flex h-8 w-8 items-center justify-center rounded-full",
                                                )}
                                              >
                                                <mood.icon
                                                  className={classNames(
                                                    mood.iconColor,
                                                    "h-5 w-5 flex-shrink-0",
                                                  )}
                                                  aria-hidden="true"
                                                />
                                              </div>
                                              <span className="ml-3 block truncate font-medium">
                                                {mood.name}
                                              </span>
                                            </div>
                                          </Listbox.Option>
                                        ))}
                                      </Listbox.Options>
                                    </Transition>
                                  </div>
                                </>
                              )}
                            </Listbox>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Comment
                        </button>
                      </div>
                    </form>
                  </div>
                </div> */}
                </div>
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
