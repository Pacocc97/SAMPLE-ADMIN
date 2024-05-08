import type { ReactElement } from "react";
import Link from "next/link";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import PageComponent from "~/components/PageComponent";
import FixedImage from "~/components/images/FixedImage";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";

export default function Page() {
  const session = useSession();
  const canShow = hasPermission(session.data, "show_order");
  const canUpdate = hasPermission(session.data, "update_order");
  const canDelete = hasPermission(session.data, "delete_order");
  const utils = trpc.useContext();
  const orders = trpc.order.all.useQuery();

  /**
   * Thist function deletes a order from the DB
   */
  const { mutate: deleteOrder } = trpc.order.delete.useMutation({
    async onSuccess() {
      await utils.order.all.invalidate();
      await Toast.fire({
        title: "La orden ha sido borrada!",
        icon: "success",
      });
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function deleteOrdertHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOrder({ id });
      }
    });
  }

  function formatDate(value: Date) {
    const objectDate = value;
    const day = objectDate.getDate();
    const month = objectDate.getMonth();
    const year = objectDate.getFullYear();
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const format2 = day + "/" + month + "/" + year;
    return format2;
  }
  return (
    <PageComponent
      name="order"
      page="list"
      translate="ordenes"
      translatePage="lista"
      hasData={orders.data && orders.data.length > 0}
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      <TableElement>
        <TableHead>
          <TableHeadCol>id</TableHeadCol>
          <TableHeadCol>cliente</TableHeadCol>
          <TableHeadCol>productos</TableHeadCol>
          <TableHeadCol>fecha de orden</TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Editar</span>
          </TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Borrar</span>
          </TableHeadCol>
        </TableHead>
        <TableBody>
          {orders.data?.map((order) => (
            <TableRow key={order.id}>
              <TableData className="font-bold hover:text-black dark:hover:text-white">
                {canShow.status ? (
                  <Link
                    href={`/admin/orden/${order.id}`}
                    className="font-bold hover:text-black dark:hover:text-white"
                  >
                    {order.id}
                  </Link>
                ) : (
                  <p className="font-bold hover:text-black dark:hover:text-white">
                    {order.id}
                  </p>
                )}
              </TableData>
              <TableData className="text-base">
                {order.openPay?.user?.email}
              </TableData>
              <TableData className="text-base">
                {order.products
                  .map((p) => p.quantity)
                  .reduce((acc, curr) => acc + curr, 0)}
              </TableData>
              <TableData className="text-base">
                {formatDate(order.createdAt)}
              </TableData>
              <TableData className="text-right">
                {canShow.status && (
                  <LinkElement
                    intent="primary"
                    href={`/admin/orden/${order.id}/`}
                    size="sm"
                  >
                    Ver
                  </LinkElement>
                )}
              </TableData>
              <TableData>
                {canDelete.status && (
                  <ButtonElement
                    intent="danger"
                    onClick={() => deleteOrdertHandler(order.id)}
                    size="sm"
                  >
                    Borrar
                  </ButtonElement>
                )}
              </TableData>
            </TableRow>
          ))}
        </TableBody>
      </TableElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
