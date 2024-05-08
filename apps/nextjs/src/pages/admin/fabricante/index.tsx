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
  const canShow = hasPermission(session.data, "show_producer");
  const canUpdate = hasPermission(session.data, "update_producer");
  const canDelete = hasPermission(session.data, "delete_producer");
  const utils = trpc.useContext();
  const producers = trpc.producer.all.useQuery();

  /**
   * Thist function deletes a producer from the DB
   */
  const { mutate: deleteProducer } = trpc.producer.delete.useMutation({
    async onSuccess() {
      await utils.producer.all.invalidate();
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
      name="producer"
      page="list"
      translate="fabricante"
      translatePage="lista"
      hasData={producers.data && producers.data.length > 0}
      icon={<BuildingOffice2Icon className="h-full w-full" />}
    >
      <TableElement>
        <TableHead>
          <TableHeadCol>logo</TableHeadCol>
          <TableHeadCol>nombre</TableHeadCol>
          <TableHeadCol>página web</TableHeadCol>
          <TableHeadCol>ubicación</TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Editar</span>
          </TableHeadCol>
          <TableHeadCol>
            <span className="sr-only">Borrar</span>
          </TableHeadCol>
        </TableHead>
        <TableBody>
          {producers.data?.map((producer) => (
            <TableRow key={producer.id}>
              <TableData className="text-base">
                {producer.logo && (
                  <FixedImage
                    image={producer.logo}
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </TableData>
              <TableData className="font-bold hover:text-black dark:hover:text-white">
                {canShow.status ? (
                  <Link
                    href={`/admin/fabricante/${producer.slug}`}
                    className="font-bold hover:text-black dark:hover:text-white"
                  >
                    {producer.name}
                  </Link>
                ) : (
                  <p className="font-bold hover:text-black dark:hover:text-white">
                    {producer.name}
                  </p>
                )}
              </TableData>
              <TableData className="text-base">{producer.webSite}</TableData>
              <TableData className="text-base">{producer.location}</TableData>
              <TableData className="text-right">
                {canUpdate.status && (
                  <LinkElement
                    intent="primary"
                    href={`/admin/fabricante/${producer.slug}/editar`}
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
                    onClick={() => deleteProducertHandler(producer.id)}
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

// <!-- Modal toggle -->
// <button data-modal-target="defaultModal" data-modal-toggle="defaultModal" class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">
//   Toggle modal
// </button>

// <!-- Main modal -->
// <div id="defaultModal" tabindex="-1" aria-hidden="true" class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
//     <div class="relative w-full max-w-2xl max-h-full">
//         <!-- Modal content -->
//         <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
//             <!-- Modal header -->
//             <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
//                 <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
//                     Terms of Service
//                 </h3>
//                 <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="defaultModal">
//                     <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
//                     <span class="sr-only">Close modal</span>
//                 </button>
//             </div>
//             <!-- Modal body -->
//             <div class="p-6 space-y-6">
//                 <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
//                     With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
//                 </p>
//                 <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
//                     The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
//                 </p>
//             </div>
//             <!-- Modal footer -->
//             <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
//                 <button data-modal-hide="defaultModal" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
//                 <button data-modal-hide="defaultModal" type="button" class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">Decline</button>
//             </div>
//         </div>
//     </div>
// </div>
