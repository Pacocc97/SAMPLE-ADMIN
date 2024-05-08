import { useState, type ReactElement } from "react";
import Link from "next/link";
import {
  InboxIcon,
  ListBulletIcon,
  RectangleGroupIcon,
  Square2StackIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
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
  const canShow = hasPermission(session.data, "show_blog");
  const canUpdate = hasPermission(session.data, "update_blog");
  const canDelete = hasPermission(session.data, "delete_blog");
  const utils = trpc.useContext();
  const blogs = trpc.blog.all.useQuery();
  const [listStyle, setListStyle] = useState(true);

  /**
   * Thist function deletes a blogBlog from the DB
   */
  const { mutate: deleteBlog } = trpc.blog.delete.useMutation({
    async onSuccess() {
      await utils.blog.all.invalidate();
      await Toast.fire({
        title: "El blog ha sido borrado!",
        icon: "success",
      });
    },
  });

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   * @param {string} id
   */
  async function deleteblogtHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBlog({ id });
      }
    });
  }

  const formattedDate = (value: Date | null) => {
    if (value) {
      return value.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else {
      return "Todavía no publicado";
    }
  };

  return (
    <PageComponent
      name="blog"
      page="list"
      translate="blog"
      translatePage="lista"
      hasData={blogs.data && blogs.data.length > 0}
      icon={<InboxIcon className="h-full w-full" />}
    >
      <div className="mb-4 flex flex-row justify-end rounded-md shadow-sm">
        <button
          type="button"
          className="rounded-l-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
          onClick={() => setListStyle(true)}
        >
          <ListBulletIcon className="w-6" />
        </button>
        <button
          type="button"
          className="rounded-r-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500"
          onClick={() => setListStyle(false)}
        >
          <Squares2X2Icon className="w-6" />
        </button>
      </div>
      {listStyle ? (
        <TableElement>
          <TableHead>
            <TableHeadCol>imagen</TableHeadCol>
            <TableHeadCol>título</TableHeadCol>
            <TableHeadCol>fecha de publicación</TableHeadCol>
            <TableHeadCol>
              <span className="sr-only">Editar</span>
            </TableHeadCol>
            <TableHeadCol>
              <span className="sr-only">Borrar</span>
            </TableHeadCol>
          </TableHead>
          <TableBody>
            {blogs.data?.map((blog) => (
              <TableRow key={blog.id}>
                <TableData className="text-base">
                  {blog.image && (
                    <FixedImage
                      image={blog.image}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                </TableData>
                <TableData className="font-bold hover:text-black dark:hover:text-white">
                  {canShow.status ? (
                    <Link
                      href={`/admin/blog/${blog.slug}`}
                      className="font-bold hover:text-black dark:hover:text-white"
                    >
                      {blog.title}
                    </Link>
                  ) : (
                    <p className="font-bold hover:text-black dark:hover:text-white">
                      {blog.title}
                    </p>
                  )}
                </TableData>
                <TableData className="text-base">
                  {" "}
                  <time dateTime={formattedDate(blog.publishedAt)}>
                    {formattedDate(blog.publishedAt)}
                  </time>
                </TableData>
                <TableData className="text-right">
                  {canUpdate.status && (
                    <LinkElement
                      intent="primary"
                      href={`/admin/blog/${blog.slug}/editar`}
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
                      onClick={() => deleteblogtHandler(blog.id)}
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
      ) : (
        <div className="bg-white  dark:bg-gray-900 ">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {blogs.data?.map((blog, i) => (
                <article
                  key={blog.id}
                  className="flex flex-col items-start justify-between"
                >
                  <div className="relative w-full">
                    {blog.image ? (
                      <FixedImage
                        image={blog.image}
                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://picsum.photos/400?random=${i}`}
                        alt=""
                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                      />
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div className="max-w-xl">
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <time
                        dateTime={formattedDate(blog.publishedAt)}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        {formattedDate(blog.publishedAt)}
                      </time>
                    </div>
                    <div className="group relative">
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-300">
                        <Link href={`/admin/blog/${blog.slug}`}>
                          <span className="absolute inset-0" />
                          {blog.title}
                        </Link>
                      </h3>
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {blog.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap">
                      {blog.BlogCategory.map((category) => (
                        <a
                          // href={category.href}
                          key={category.id}
                          className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium capitalize text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                    {/* <div className="relative mt-8 flex items-center gap-x-4">
                    <img
                      src={blog.author.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-full bg-gray-100"
                    />
                    <div className="text-sm leading-6">
                      <p className="font-semibold text-gray-900">
                        <a href={blog.author.href}>
                          <span className="absolute inset-0" />
                          {blog.author.name}
                        </a>
                      </p>
                      <p className="text-gray-600">{blog.author.role}</p>
                    </div>
                    </div> */}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageComponent>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
