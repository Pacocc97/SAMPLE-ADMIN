import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  InboxIcon,
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
import Accordion from "~/components/productComponents/SEO/Accordion";
import Spinner from "~/components/ui/Spinner";
import { env } from "~/env.mjs";

interface MyHTML {
  [key: string]: string;
}

type SeoPassed = Seo & { openGraphBasicImage: Image };

export default function Page() {
  const session = useSession();
  const canUpdate = hasPermission(session.data, "update_blog");
  const canDelete = hasPermission(session.data, "delete_blog");
  const router = useRouter();
  const slug = router.query.slug as string;
  const utils = trpc.useContext();
  const [open, setOpen] = useState(false);
  const {
    data: blogInfo,
    status,
    error,
    isLoading,
  } = trpc.blog.show.useQuery({ slug });
  console.log(blogInfo);
  /**
   * Thist function deletes a blogBlog from the DB
   */
  const { mutate: deleteBlog } = trpc.blog.delete.useMutation({
    async onSuccess() {
      await router.push("/admin/blog");
      await utils.blog.all.invalidate();
      await Toast.fire({
        title: "El blog ha sido borrado!",
        icon: "success",
      });
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
  async function deleteBlogHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBlog({ id });
      }
    });
  }

  /**
   * Formats passed description as a html formatted value.
   *
   * @returns {string | JSX.Element | JSX.Element[]} formatted description
   */
  function description(): string | JSX.Element | JSX.Element[] {
    const firstLetter = blogInfo?.description?.charAt(0);
    if (firstLetter === "[") {
      const blogDesc = blogInfo?.description || "{}";
      const parseDesc = JSON.parse(blogDesc) as Object[];

      const htmlKey = parseDesc[1] as MyHTML;
      const myDesc = parse(String(htmlKey?.html));
      return myDesc ? myDesc : "Sin descripción";
    } else return parse(blogInfo?.description as string);
  }

  const formattedDate = (value: Date) =>
    value.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  return (
    <PageComponent
      name="blog"
      page="show"
      translate="Fabricante"
      translatePage="mostrar"
      hasData={true}
      icon={<InboxIcon className="h-full w-full" />}
      displayHeader={false}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <nav
            className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
            aria-label="Breadcrumb"
          >
            <Link
              href="/admin/blog"
              className="inline-flex items-center space-x-3 text-sm font-medium"
            >
              <ChevronLeftIcon
                className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
              <span>Blogs</span>
            </Link>
          </nav>
          <main className="flex-1">
            <div className="bg-white py-8 pb-16 dark:bg-gray-900 lg:pb-24 lg:pt-16 xl:py-10">
              <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:pb-6">
                <div className="mt-4 flex space-x-3 md:mt-0"></div>
                <div className="mb-4 flex flex-wrap items-center">
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
                  {blogInfo && canUpdate.status && (
                    <a
                      type="button"
                      href={`${blogInfo.slug}/editar`}
                      className="mr-4 inline-flex cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <PencilSquareIcon className="-ml-1 mr-1 w-5" />
                      Editar
                    </a>
                  )}
                  {canDelete.status && blogInfo && (
                    <button
                      type="button"
                      className="inline-flex rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-600"
                      onClick={() => deleteBlogHandler(blogInfo.id)}
                    >
                      <TrashIcon className="-ml-1 mr-1 w-5" />
                      Borrar
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-5">
                <span>Imagen principal:</span>
                {blogInfo?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${blogInfo.image.path}/${blogInfo.image.original}`}
                    alt=""
                    className="aspect-[5/2] w-full rounded-2xl object-contain xl:rounded-3xl"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="https://picsum.photos/1000/2000"
                    alt=""
                    className="aspect-[5/2] w-full rounded-2xl object-cover xl:rounded-3xl"
                  />
                )}
              </div>
              <div className="mx-auto flex max-w-screen-xl justify-between px-4 ">
                <article className="format format-sm sm:format-base lg:format-lg format-blue dark:format-invert mx-auto w-full max-w-2xl">
                  <header className="not-format mb-4 lg:mb-6">
                    <address className="mb-6 flex items-center not-italic">
                      <div className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                        {/* <img
                        className="mr-4 h-16 w-16 rounded-full"
                        src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                        alt="Jese Leos"
                      /> */}
                        <div>
                          {/* <a
                          href="#"
                          rel="author"
                          className="text-xl font-bold text-gray-900 dark:text-white"
                        >
                          Jese Leos
                        </a>
                        <p className="text-base font-light text-gray-500 dark:text-gray-400">
                          Graphic Designer, educator & CEO Flowbite
                        </p> */}
                          <span>Escrito el:</span>
                          <p className="text-base font-light text-gray-500 dark:text-gray-300">
                            {blogInfo?.createdAt && (
                              <time
                                dateTime={formattedDate(blogInfo.createdAt)}
                                className="text-gray-500 dark:text-gray-300"
                              >
                                {formattedDate(blogInfo.createdAt)}
                              </time>
                            )}
                          </p>
                        </div>
                      </div>
                    </address>
                    <span>Título:</span>
                    <h1 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white lg:mb-6 lg:text-4xl">
                      {blogInfo?.title}
                    </h1>
                  </header>
                  <div className="mb-4">
                    <span>Descripción:</span>

                    <p className="indent-8">{blogInfo?.shortDescription}</p>
                  </div>
                  <div>
                    <span>Contenido:</span>
                    <div className="indent-8">{description()}</div>
                  </div>
                  {/* <section className="not-format">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white lg:text-2xl">
                      Discussion (20)
                    </h2>
                  </div>
                  <form className="mb-6">
                    <div className="mb-4 rounded-lg rounded-t-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                      <label for="comment" className="sr-only">
                        Your comment
                      </label>
                      <textarea
                        id="comment"
                        rows="6"
                        className="w-full border-0 px-0 text-sm text-gray-900 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                        placeholder="Write a comment..."
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800 inline-flex items-center rounded-lg px-4 py-2.5 text-center text-xs font-medium text-white focus:ring-4"
                    >
                      Post comment
                    </button>
                  </form>
                  <article className="mb-6 rounded-lg bg-white p-6 text-base dark:bg-gray-900">
                    <footer className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                          <img
                            className="mr-2 h-6 w-6 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                            alt="Michael Gough"
                          />
                          Michael Gough
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <time
                            pubdate
                            datetime="2022-02-08"
                            title="February 8th, 2022"
                          >
                            Feb. 8, 2022
                          </time>
                        </p>
                      </div>
                      <button
                        id="dropdownComment1Button"
                        data-dropdown-toggle="dropdownComment1"
                        className="inline-flex items-center rounded-lg bg-white p-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        type="button"
                      >
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                        <span className="sr-only">Comment settings</span>
                      </button>

                      <div
                        id="dropdownComment1"
                        className="z-10 hidden w-36 divide-y divide-gray-100 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700"
                      >
                        <ul
                          className="py-1 text-sm text-gray-700 dark:text-gray-200"
                          aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Edit
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Remove
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Report
                            </a>
                          </li>
                        </ul>
                      </div>
                    </footer>
                    <p>
                      Very straight-to-point article. Really worth time reading.
                      Thank you! But tools are just the instruments for the UX
                      designers. The knowledge of the design tools are as
                      important as the creation of the design strategy.
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400"
                      >
                        <svg
                          aria-hidden="true"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                    </div>
                  </article>
                  <article className="mb-6 ml-6 rounded-lg bg-white p-6 text-base dark:bg-gray-900 lg:ml-12">
                    <footer className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                          <img
                            className="mr-2 h-6 w-6 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                            alt="Jese Leos"
                          />
                          Jese Leos
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <time title="February 12th, 2022">Feb. 12, 2022</time>
                        </p>
                      </div>
                      <button
                        id="dropdownComment2Button"
                        data-dropdown-toggle="dropdownComment2"
                        className="inline-flex items-center rounded-lg bg-white p-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        type="button"
                      >
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                        <span className="sr-only">Comment settings</span>
                      </button>
                      <div
                        id="dropdownComment2"
                        className="z-10 hidden w-36 divide-y divide-gray-100 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700"
                      >
                        <ul
                          className="py-1 text-sm text-gray-700 dark:text-gray-200"
                          aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Edit
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Remove
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Report
                            </a>
                          </li>
                        </ul>
                      </div>
                    </footer>
                    <p>Much appreciated! Glad you liked it ☺️</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400"
                      >
                        <svg
                          aria-hidden="true"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                    </div>
                  </article>
                  <article className="mb-6 border-t border-gray-200 bg-white p-6 text-base dark:border-gray-700 dark:bg-gray-900">
                    <footer className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                          <img
                            className="mr-2 h-6 w-6 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                            alt="Bonnie Green"
                          />
                          Bonnie Green
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <time title="March 12th, 2022">Mar. 12, 2022</time>
                        </p>
                      </div>
                      <button
                        id="dropdownComment3Button"
                        data-dropdown-toggle="dropdownComment3"
                        className="inline-flex items-center rounded-lg bg-white p-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        type="button"
                      >
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                        <span className="sr-only">Comment settings</span>
                      </button>

                      <div
                        id="dropdownComment3"
                        className="z-10 hidden w-36 divide-y divide-gray-100 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700"
                      >
                        <ul
                          className="py-1 text-sm text-gray-700 dark:text-gray-200"
                          aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Edit
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Remove
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Report
                            </a>
                          </li>
                        </ul>
                      </div>
                    </footer>
                    <p>
                      The article covers the essentials, challenges, myths and
                      stages the UX designer should consider while creating the
                      design strategy.
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400"
                      >
                        <svg
                          aria-hidden="true"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                    </div>
                  </article>
                  <article className="border-t border-gray-200 bg-white p-6 text-base dark:border-gray-700 dark:bg-gray-900">
                    <footer className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
                          <img
                            className="mr-2 h-6 w-6 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
                            alt="Helene Engels"
                          />
                          Helene Engels
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <time title="June 23rd, 2022">Jun. 23, 2022</time>
                        </p>
                      </div>
                      <button
                        id="dropdownComment4Button"
                        data-dropdown-toggle="dropdownComment4"
                        className="inline-flex items-center rounded-lg bg-white p-2 text-center text-sm font-medium text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        type="button"
                      >
                        <svg
                          className="h-5 w-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                      </button>

                      <div
                        id="dropdownComment4"
                        className="z-10 hidden w-36 divide-y divide-gray-100 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700"
                      >
                        <ul
                          className="py-1 text-sm text-gray-700 dark:text-gray-200"
                          aria-labelledby="dropdownMenuIconHorizontalButton"
                        >
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Edit
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Remove
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                              Report
                            </a>
                          </li>
                        </ul>
                      </div>
                    </footer>
                    <p>
                      Thanks for sharing this. I do came from the Backend
                      development and explored some of the tools to design my
                      Side Projects.
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        type="button"
                        className="flex items-center text-sm text-gray-500 hover:underline dark:text-gray-400"
                      >
                        <svg
                          aria-hidden="true"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        Reply
                      </button>
                    </div>
                  </article>
                </section> */}
                </article>
              </div>
            </div>
          </main>
          {/* 
          <aside
            aria-label="Related articles"
            className="bg-gray-50 py-8 dark:bg-gray-800 lg:py-24"
          >
            <div className="mx-auto max-w-screen-xl px-4">
              <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                Related articles
              </h2>
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                <article className="max-w-xs">
                  <a href="#">
                    <img
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-1.png"
                      className="mb-5 rounded-lg"
                      alt="Image 1"
                    />
                  </a>
                  <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white">
                    <a href="#">Our first office</a>
                  </h2>
                  <p className="mb-4 font-light text-gray-500 dark:text-gray-400">
                    Over the past year, Volosoft has undergone many changes!
                    After months of preparation.
                  </p>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-500 inline-flex items-center font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Read in 2 minutes
                  </a>
                </article>
                <article className="max-w-xs">
                  <a href="#">
                    <img
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-2.png"
                      className="mb-5 rounded-lg"
                      alt="Image 2"
                    />
                  </a>
                  <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white">
                    <a href="#">Enterprise design tips</a>
                  </h2>
                  <p className="mb-4 font-light text-gray-500 dark:text-gray-400">
                    Over the past year, Volosoft has undergone many changes!
                    After months of preparation.
                  </p>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-500 inline-flex items-center font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Read in 12 minutes
                  </a>
                </article>
                <article className="max-w-xs">
                  <a href="#">
                    <img
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-3.png"
                      className="mb-5 rounded-lg"
                      alt="Image 3"
                    />
                  </a>
                  <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white">
                    <a href="#">We partnered with Google</a>
                  </h2>
                  <p className="mb-4 font-light text-gray-500 dark:text-gray-400">
                    Over the past year, Volosoft has undergone many changes!
                    After months of preparation.
                  </p>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-500 inline-flex items-center font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Read in 8 minutes
                  </a>
                </article>
                <article className="max-w-xs">
                  <a href="#">
                    <img
                      src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/article/blog-4.png"
                      className="mb-5 rounded-lg"
                      alt="Image 4"
                    />
                  </a>
                  <h2 className="mb-2 text-xl font-bold leading-tight text-gray-900 dark:text-white">
                    <a href="#">Our first project with React</a>
                  </h2>
                  <p className="mb-4 font-light text-gray-500 dark:text-gray-400">
                    Over the past year, Volosoft has undergone many changes!
                    After months of preparation.
                  </p>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-500 inline-flex items-center font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Read in 4 minutes
                  </a>
                </article>
              </div>
            </div>
          </aside> */}

          {/* <section className="bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
              <div className="mx-auto max-w-screen-md sm:text-center">
                <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Sign up for our newsletter
                </h2>
                <p className="mx-auto mb-8 max-w-2xl font-light text-gray-500 dark:text-gray-400 sm:text-xl md:mb-12">
                  Stay up to date with the roadmap progress, announcements and
                  exclusive discounts feel free to sign up with your email.
                </p>
                <form action="#">
                  <div className="mx-auto mb-3 max-w-screen-sm items-center space-y-4 sm:flex sm:space-y-0">
                    <div className="relative w-full">
                      <label className="mb-2 hidden text-sm font-medium text-gray-900 dark:text-gray-300">
                        Email address
                      </label>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-500 dark:text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                        </svg>
                      </div>
                      <input
                        className="focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:rounded-none sm:rounded-l-lg"
                        placeholder="Enter your email"
                        type="email"
                        id="email"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-primary-700 border-primary-600 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full cursor-pointer rounded-lg border px-5 py-3 text-center text-sm font-medium text-white focus:ring-4 sm:rounded-none sm:rounded-r-lg"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                  <div className="newsletter-form-footer mx-auto max-w-screen-sm text-left text-sm text-gray-500 dark:text-gray-300">
                    We care about the protection of your data.{" "}
                    <a
                      href="#"
                      className="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                    >
                      Read our Privacy Policy
                    </a>
                    .
                  </div>
                </form>
              </div>
            </div>
          </section> */}

          {blogInfo && blogInfo.seo && blogInfo.slug && (
            <SideFormElement show={open} onClose={setOpen}>
              <h2 className="mb-10 text-2xl font-semibold leading-4">
                Información SEO
              </h2>
              <Accordion
                value={blogInfo.seo as SeoPassed}
                slug={blogInfo.slug}
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
