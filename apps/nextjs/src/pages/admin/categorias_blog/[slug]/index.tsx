import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";
import { type Image, type Seo } from "@acme/db";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/trpc";
import PageComponent from "~/components/PageComponent";
import SideFormElement from "~/components/forms/elements/SideFormElement";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import FixedImage from "~/components/images/FixedImage";
import Accordion from "~/components/productComponents/SEO/Accordion";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";
import Spinner from "~/components/ui/Spinner";

type Characteristics = {
  name: string;
  type: string;
  unit: string;
};

type SeoPassed = Seo & { openGraphBasicImage: Image };

export default function Page() {
  const router = useRouter();
  const utils = trpc.useContext();
  const session = useSession();
  const canShow = hasPermission(session.data, "show_blogCategory");
  const canUpdate = hasPermission(session.data, "update_blogCategory");
  const canDelete = hasPermission(session.data, "delete_blogCategory");
  const slug = router.query.slug as string;
  const blogCategory = trpc.blogCategory.show.useQuery({ slug });
  const blogCategoryInfo = blogCategory.data;
  const [open, setOpen] = useState(false);

  const { mutate: deleteCategory } = trpc.blogCategory.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La categoría ha sido borrada!",
        icon: "success",
      });
      await utils.blogCategory.all.invalidate();
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteCategoryHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCategory({ id });
      }
    });
  }

  if (blogCategory.status === "error") {
    return <div>{blogCategory.error.message}</div>;
  }

  return (
    <PageComponent
      name="blogCategory"
      page="show"
      translate="categoría"
      translatePage="mostrar"
      hasData={true}
      icon={<ProductBoxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {blogCategory.isLoading ? (
        <Spinner />
      ) : (
        <>
          <nav
            className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
            aria-label="Breadcrumb"
          >
            <Link
              href="/admin/categorias_blog"
              className="inline-flex items-center space-x-3 text-sm font-medium"
            >
              <ChevronLeftIcon
                className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <span>Categorías</span>
            </Link>
          </nav>
          <main className="flex-1">
            <div className="py-8 xl:py-10">
              <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:pb-6">
                <div className="mt-5">
                  <div className="flex items-center">
                    <div className="mr-3 shrink-0"></div>
                    <h1 className="text-3xl font-bold text-gray-900  dark:text-gray-100">
                      {blogCategoryInfo?.name}
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
                  {blogCategoryInfo && canUpdate.status && (
                    <a
                      type="button"
                      href={`${blogCategoryInfo.slug}/editar`}
                      className="mr-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <PencilSquareIcon className="-ml-1 mr-1 w-5" />
                      Editar
                    </a>
                  )}
                  {canDelete.status && blogCategoryInfo && (
                    <button
                      type="button"
                      className="inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => deleteCategoryHandler(blogCategoryInfo.id)}
                    >
                      <TrashIcon className="-ml-1 mr-1 w-5" />
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-2">
                <div className=" xl:pr-8">
                  <div className="mt-10">
                    {blogCategoryInfo && blogCategoryInfo.image && (
                      <FixedImage
                        className="h-96 w-96 rounded-full"
                        image={blogCategoryInfo.image}
                      />
                    )}
                  </div>
                  <div>
                    <div>
                      <aside className="mt-8 xl:hidden">
                        <h2 className="sr-only">Detalles</h2>
                        {/* <div className="space-y-5">
                          <h2 className="font-medium text-gray-500 dark:text-gray-300">
                            Precio
                          </h2>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon
                              className="h-6 w-6 text-gray-400 dark:text-gray-200"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {precioFormato(blogCategoryInfo?.price)}
                            </span>
                          </div>
                        </div> */}
                        <div className="mt-6 space-y-8  py-6">
                          <div>
                            <h3 className="font-medium text-gray-500 dark:text-gray-300">
                              Descripción
                            </h3>
                            <div className="mt-2 leading-8">
                              {blogCategoryInfo?.description}
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
                            Sub categorías
                          </h2>
                        </div>
                        {blogCategoryInfo?.child &&
                        blogCategoryInfo?.child.length > 0 ? (
                          <div className="m-2 pt-2">
                            <TableElement>
                              <TableHead>
                                <TableHeadCol>imagen</TableHeadCol>
                                <TableHeadCol>nombre</TableHeadCol>
                                <TableHeadCol>
                                  <span className="sr-only">Editar</span>
                                </TableHeadCol>
                                <TableHeadCol>
                                  <span className="sr-only">Borrar</span>
                                </TableHeadCol>
                              </TableHead>
                              <TableBody>
                                {blogCategoryInfo?.child?.map(
                                  (blogCategory) => (
                                    <TableRow key={blogCategory.id}>
                                      <TableData className="text-base">
                                        {blogCategory.image && (
                                          <FixedImage
                                            image={blogCategory.image}
                                            className="h-8 w-8 rounded-full"
                                          />
                                        )}
                                      </TableData>
                                      <TableData className="font-bold hover:text-black dark:hover:text-white">
                                        {canShow.status ? (
                                          <Link
                                            href={`/admin/categorias_blog/${blogCategory.slug}`}
                                            className="font-bold hover:text-black dark:hover:text-white"
                                          >
                                            {blogCategory.name}
                                          </Link>
                                        ) : (
                                          <p className="font-bold hover:text-black dark:hover:text-white">
                                            {blogCategory.name}
                                          </p>
                                        )}
                                      </TableData>
                                      <TableData className="text-right">
                                        {canUpdate.status && (
                                          <LinkElement
                                            intent="primary"
                                            href={`/admin/categorias_blog/${blogCategory.slug}/editar`}
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
                                            onClick={() =>
                                              deleteCategoryHandler(
                                                blogCategory.id,
                                              )
                                            }
                                            size="sm"
                                          >
                                            Borrar
                                          </ButtonElement>
                                        )}
                                      </TableData>
                                    </TableRow>
                                  ),
                                )}
                              </TableBody>
                            </TableElement>
                          </div>
                        ) : (
                          <p>Sin subcategorías</p>
                        )}
                        <p className="mr-10 text-right">
                          {/* Precio total: ${precioFormato(productSum)} */}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
                <aside className="mt-12 hidden xl:block xl:pl-8">
                  <h2 className="sr-only">Detalles</h2>
                  {/* <div className="space-y-5">
                    <h2 className="font-medium text-gray-500 dark:text-gray-300">
                      Precio
                    </h2>
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon
                        className="h-6 w-6 text-gray-400 dark:text-gray-200"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {precioFormato(blogCategoryInfo?.price)}
                      </span>
                    </div>
                  </div> */}
                  <div className="mt-6 space-y-8  py-6">
                    <div>
                      <h3 className="font-medium text-gray-500 dark:text-gray-300">
                        Descripción
                      </h3>
                      <div className="mt-2 leading-8">
                        {blogCategoryInfo?.description}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
          {blogCategoryInfo &&
            blogCategoryInfo.seo &&
            blogCategoryInfo.slug && (
              <SideFormElement show={open} onClose={setOpen}>
                <h2 className="mb-10 text-2xl font-semibold leading-4">
                  Información SEO
                </h2>
                <Accordion
                  value={blogCategoryInfo.seo as SeoPassed}
                  slug={blogCategoryInfo.slug}
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
