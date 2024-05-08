import type { ReactElement } from "react";
import Link from "next/link";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
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
  const canShow = hasPermission(session.data, "show_package");
  const canUpdate = hasPermission(session.data, "update_package");
  const canDelete = hasPermission(session.data, "delete_package");
  const utils = trpc.useContext();
  const packages = trpc.package.all.useQuery();

  /**
   * Thist function deletes a package from the DB
   */
  const { mutate: deleteProducer } = trpc.package.delete.useMutation({
    async onSuccess() {
      await utils.package.all.invalidate();
      await Toast.fire({
        title: "El fabricante ha sido borrado!",
        icon: "success",
      });
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function deleteProducertHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProducer({ id });
      }
    });
  }

  return (
    <PageComponent
      name="package"
      page="list"
      translate="paquetes"
      translatePage="lista"
      hasData={packages.data && packages.data.length > 0}
      icon={<RectangleGroupIcon className="h-full w-full" />}
    >
      <TableElement>
        <TableHead>
          <TableHeadCol>image</TableHeadCol>
          <TableHeadCol>nombre</TableHeadCol>
          {/* <TableHeadCol>página web</TableHeadCol>
          <TableHeadCol>ubicación</TableHeadCol> */}
          <TableHeadCol>
            <span className="sr-only">Editar</span>
          </TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Borrar</span>
          </TableHeadCol>
        </TableHead>
        <TableBody>
          {packages.data?.map((pack) => (
            <TableRow key={pack.id}>
              <TableData className="text-base">
                {pack.image && (
                  <FixedImage
                    image={pack.image}
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </TableData>
              <TableData className="font-bold hover:text-black dark:hover:text-white">
                {canShow.status ? (
                  <Link
                    href={`/admin/paquetes/${pack.slug}`}
                    className="font-bold hover:text-black dark:hover:text-white"
                  >
                    {pack.name}
                  </Link>
                ) : (
                  <p className="font-bold hover:text-black dark:hover:text-white">
                    {pack.name}
                  </p>
                )}
              </TableData>
              {/* <TableData className="text-base">{pack.webSite}</TableData>
              <TableData className="text-base">{pack.location}</TableData> */}
              <TableData className="text-right">
                {canUpdate.status && (
                  <LinkElement
                    intent="primary"
                    href={`/admin/paquetes/${pack.slug}/editar`}
                    size="sm"
                  >
                    Editar
                  </LinkElement>
                )}
              </TableData>
              <TableData>
                {canDelete.status && (
                  <ButtonElement
                    intent="danger"
                    onClick={() => deleteProducertHandler(pack.id)}
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
