import { Fragment, useState, type ReactElement } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import type { BlogCategory, Image, Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";

import { hasPermission } from "@acme/api/src/utils/authorization/permission";

import { ConfirmModal, Toast } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import categoryStructure from "~/utils/categoryStructure";
import { classNames } from "~/utils/object";
import PageComponent from "~/components/PageComponent";
import CreateBlogCategoryForm from "~/components/forms/blogCategory/CreateBlogCategoryForm";
import EditBlogCategoryForm from "~/components/forms/blogCategory/EditBlogCategoryForm";
import EditCategoryForm from "~/components/forms/category/EditCategoryForm";
import SideFormElement from "~/components/forms/elements/SideFormElement";
import FixedImage from "~/components/images/FixedImage";
import TableBody from "~/components/tables/elements/TableBody";
import TableData from "~/components/tables/elements/TableData";
import TableElement from "~/components/tables/elements/TableElement";
import TableHead from "~/components/tables/elements/TableHead";
import TableHeadCol from "~/components/tables/elements/TableHeadCol";
import TableRow from "~/components/tables/elements/TableRow";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";

interface CategoryTree {
  id: string;
  name: string;
  parentId: string | null;
  characteristics: Prisma.JsonValue | null;
  parent: BlogCategory | null;
  child: BlogCategory[] | null;
  slug: string;
  description: string | null;
  imageId: string | null;
  image: Image | null;
}

interface WholeCategory extends BlogCategory {
  parent: WholeCategory | null;
  child: WholeCategory[] | null;
  image: Image | null;
}

export default function Page() {
  const session = useSession();
  const canShow = hasPermission(session.data, "show_blogCategory");
  const canUpdate = hasPermission(session.data, "update_blogCategory");
  const canDelete = hasPermission(session.data, "delete_blogCategory");
  const utils = trpc.useContext();
  const categories = trpc.blogCategory.all.useQuery();

  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [idEdit, setIdEdit] = useState<BlogCategory>();

  const { mutate: deleteCategory } = trpc.blogCategory.delete.useMutation({
    async onSuccess() {
      await Toast.fire({
        title: "La categoría ha sido borrado!",
        icon: "success",
      });
      await utils.category.all.invalidate();
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

  /**
   * Opens side bar to edit selected category.
   *
   * @param {CategoryTree} category
   */
  function myEdit(category: CategoryTree) {
    setIdEdit(category);
    setOpenEdit(true);
  }

  /**
   * Returns a new row based on subcategories of passed category.
   *
   * @param {WholeCategory[]} value
   * @param {number} num
   * @returns
   */
  const SubRow = (value: WholeCategory[], num: number) => {
    const numero = num * 0.1;

    return value.map((category, index) => (
      <Fragment key={index}>
        <Disclosure.Panel as={Disclosure}>
          <Disclosure>
            {({ open }) => (
              <>
                <TableRow
                  className={classNames(
                    open ? "bg-slate-100 dark:bg-slate-600" : "",
                    "",
                  )}
                >
                  <Disclosure.Button as="th">
                    <div
                      style={{ marginLeft: `${numero}rem` }}
                      className="flex items-center whitespace-nowrap px-6 py-4 font-medium text-gray-900 hover:cursor-pointer dark:text-white"
                    >
                      {category.child && category.child.length >= 1 ? (
                        <ChevronRightIcon
                          className={classNames(
                            open ? "rotate-90 transform" : "",
                            "w-5  transform font-bold transition-all dark:hover:text-white",
                          )}
                        />
                      ) : (
                        <span className="w-5"></span>
                      )}
                      {category.name}
                    </div>
                  </Disclosure.Button>
                  <TableData>
                    <span title={category.slug || undefined}>
                      {category.image && (
                        <FixedImage
                          width={32}
                          image={category.image}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                    </span>
                  </TableData>
                  <TableData className="text-base">
                    {category.child && category.child.length}
                  </TableData>
                  <TableData className="text-right">
                    {canShow.status && (
                      <LinkElement
                        href={`/admin/categorias_blog/${category.slug}`}
                        intent="blue"
                        size="sm"
                      >
                        Ver
                      </LinkElement>
                    )}
                  </TableData>
                  <TableData className="text-right">
                    {canUpdate.status && (
                      <ButtonElement
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        onClick={() => myEdit(category as any)}
                        intent="primary"
                        size="sm"
                      >
                        Editar
                      </ButtonElement>
                    )}
                  </TableData>
                  <TableData>
                    {canDelete.status && (
                      <ButtonElement
                        intent="danger"
                        onClick={() => deleteCategoryHandler(category.id)}
                        size="sm"
                      >
                        Borrar
                      </ButtonElement>
                    )}
                  </TableData>
                </TableRow>
                {category.child && SubRow(category.child, num + 10)}
              </>
            )}
          </Disclosure>
        </Disclosure.Panel>
      </Fragment>
    ));
  };
  const myTD = ["", "", "", "", "", ""];

  return (
    <PageComponent
      name="category"
      page="list"
      translate="Categoría de blog"
      translatePage="lista"
      hasData={categories.data && categories.data.length > 0}
      icon={<ListBulletIcon className="h-full w-full" />}
      setOpen={setOpen}
    >
      {categories.isError ? (
        <div>No se pudo cargar la información</div>
      ) : (
        <TableElement>
          <TableHead>
            <TableHeadCol>Nombre</TableHeadCol>
            <TableHeadCol>imagen</TableHeadCol>
            <TableHeadCol>Subcategorías</TableHeadCol>
            <TableHeadCol>
              <span className="sr-only">Ver</span>
            </TableHeadCol>
            <TableHeadCol>
              <span className="sr-only">Editar</span>
            </TableHeadCol>
            <TableHeadCol>
              <span className="sr-only">Borrar</span>
            </TableHeadCol>
          </TableHead>
          <TableBody>
            {categories.isLoading ? (
              <TableRow className="animate-pulse">
                {myTD.map((tdx, index) => (
                  <TableData key={index}>
                    <div className="h-4 rounded bg-gray-300">{tdx}</div>
                  </TableData>
                ))}
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
              categoryStructure(categories.data as any).map((category, index) => (
                <Fragment key={index}>
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <TableRow
                          key={category.id}
                          className={
                            open ? "bg-slate-100 dark:bg-slate-600" : ""
                          }
                        >
                          <Disclosure.Button as="th">
                            <div className="flex items-center whitespace-nowrap px-6 py-4 font-medium text-gray-900 hover:cursor-pointer dark:text-white">
                              {category.child && category.child.length >= 1 ? (
                                <ChevronRightIcon
                                  className={classNames(
                                    open ? "rotate-90 transform" : "",
                                    "w-5 transform font-bold transition-all dark:hover:text-white",
                                  )}
                                />
                              ) : (
                                <span className="w-5"></span>
                              )}
                              {category.name}
                            </div>
                          </Disclosure.Button>
                          <TableData>
                            <span title={category.slug || undefined}>
                              {category.image && (
                                <FixedImage
                                  width={32}
                                  image={category.image}
                                  className="h-8 w-8 rounded-full"
                                />
                              )}
                            </span>
                          </TableData>
                          <TableData className="text-base">
                            {category.child && category.child.length}
                          </TableData>

                          <TableData className="text-right">
                            {canShow.status && (
                              <LinkElement
                                href={`/admin/categorias_blog/${category.slug}`}
                                intent="blue"
                                size="sm"
                              >
                                Ver
                              </LinkElement>
                            )}
                          </TableData>
                          <TableData className="text-right">
                            {canUpdate.status && (
                              <ButtonElement
                                onClick={() => myEdit(category)}
                                intent="primary"
                                size="sm"
                              >
                                Editar
                              </ButtonElement>
                            )}
                          </TableData>
                          <TableData>
                            {canDelete.status && (
                              <ButtonElement
                                intent="danger"
                                onClick={() =>
                                  deleteCategoryHandler(category.id)
                                }
                                size="sm"
                              >
                                Borrar
                              </ButtonElement>
                            )}
                          </TableData>
                        </TableRow>
                        {category.child &&
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                          SubRow(category.child as any[], 10)}
                      </>
                    )}
                  </Disclosure>
                </Fragment>
              ))
            )}
          </TableBody>
        </TableElement>
      )}

      <SideFormElement show={open} onClose={setOpen}>
        <PageComponent
          name="blogCategory"
          page="create"
          translate="Categoría de blog"
          translatePage="crear"
          manualResponsive={false}
          icon={<ListBulletIcon className="h-full w-full" />}
        >
          <CreateBlogCategoryForm />
        </PageComponent>
      </SideFormElement>
      <SideFormElement show={openEdit} onClose={setOpenEdit}>
        <PageComponent
          name="category"
          page="update"
          translate="Categoría de blog"
          translatePage="actualizar"
          manualResponsive={false}
          icon={<ListBulletIcon className="h-full w-full" />}
        >
          {!!idEdit && <EditBlogCategoryForm blogCategory={idEdit as any} />}
        </PageComponent>
      </SideFormElement>
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
