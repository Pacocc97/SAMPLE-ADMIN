import { useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLayout } from "@layouts/AdminLayout";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import {
  createMessageFormSchema,
  type CreateMessageFormValues,
} from "@acme/api/src/schemas/commentSchema";
import { hasPermission } from "@acme/api/src/utils/authorization/permission";
import {
  type Image as ImageType,
  type Product,
  type ProductHistory,
  type Role,
  type User,
  type UserComment,
} from "@acme/db";

import { ConfirmModal } from "~/utils/alerts";
import { trpc } from "~/utils/api";
import { calculateWidth } from "~/utils/imageFunc";
import { classNames } from "~/utils/object";
import { env } from "~/env.mjs";

export default function Page() {
  const session = useSession();
  const canShow = hasPermission(session.data, "show_product");
  const canDeleteComments = hasPermission(session.data, "delete_user_comments");
  const utils = trpc.useContext();
  const router = useRouter();
  const id = router.query.id as string;
  const { data: user } = trpc.users.show.useQuery({ id }) as {
    data: User & {
      role: Role;
      picture: ImageType;
      userCommenting: (UserComment & {
        child: UserComment[];
        parent: UserComment;
        userCommenting: User;
        userCommented: User;
      })[];
      ProductHistory: (ProductHistory & { Product: Product })[];
    };
  };
  const { mutate: createComment } = trpc.users.comment.useMutation({
    async onSuccess() {
      reset();
      setReply("");
      await utils.users.show.invalidate({ id });
    },
  });
  const { mutate: deleteComment } = trpc.users.deleteComment.useMutation({
    async onSuccess() {
      reset();
      setReply("");
      await utils.users.show.invalidate({ id });
    },
  });
  const [reply, setReply] = useState<string>("");

  /**
   * Fires a modal for delete confirmation.
   * If confirmed delete, else, return
   *
   * @param {string} id
   */
  async function deleteCommentHandler(id: string) {
    await ConfirmModal.fire({
      confirmButtonText: "Sí, seguir!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteComment({ id });
      }
    });
  }

  const formattedDate = user?.createdAt?.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /**
   * Functions formats date.
   *
   * @param date
   * @returns
   */
  function formatDate(date: Date) {
    const value = date?.toLocaleDateString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    return value;
  }

  const { register, handleSubmit, reset } = useForm<CreateMessageFormValues>({
    resolver: zodResolver(createMessageFormSchema),
  });

  /**
   * When form is submitted, creates new category based on passed data.
   *
   * @param {CreateMessageFormValues} data
   */
  function submitForm(data: CreateMessageFormValues) {
    if (
      session &&
      session.data &&
      session.data.user &&
      session.data.user.id &&
      user
    ) {
      createComment({
        subComment: false,
        commenting: session.data.user.id,
        id: user.id,
        ...data,
      });
    }
  }
  /**
   * When form is submitted, creates new category based on passed data.
   *
   * @param {CreateMessageFormValues} data
   */
  function submitFormSub(data: CreateMessageFormValues) {
    if (
      session &&
      session.data &&
      session.data.user &&
      session.data.user.id &&
      user
    ) {
      createComment({
        subComment: true,
        commenting: session.data.user.id,
        id: user.id,
        parentId: reply,
        ...data,
      });
    }
  }

  const filterComments = user?.userCommenting.filter(
    (comment) => comment.parentId === null,
  );
  console.log(filterComments, "filterComments");

  /**
   * Functions returns repliyed comments of each comment.
   *
   * @param code
   * @returns
   */
  function filterReply(code: string) {
    const filterComments = user?.userCommenting.filter(
      (comment) => comment.parentId === code,
    );
    return filterComments;
  }

  return (
    <>
      <nav
        className="flex items-start px-4 py-3 sm:px-6 lg:px-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/admin/equipo"
          className="inline-flex items-center space-x-3 text-sm font-medium"
        >
          <ChevronLeftIcon
            className="-ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
          <span>Equipo</span>
        </Link>
      </nav>
      <div className="mt-4 min-h-full">
        {/* Page header */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
          <div className="flex items-center space-x-5">
            <div className="shrink-0">
              <div className="relative">
                {user && user.picture ? (
                  <Image
                    height={140}
                    width={calculateWidth(
                      user.picture.width,
                      user.picture.height,
                      140,
                    )}
                    src={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${
                      user.picture ? user.picture.path : ""
                    }/${user.picture ? user.picture.original : ""}`}
                    alt=""
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  user &&
                  user.image && (
                    <Image
                      height={140}
                      width={140}
                      className="h-16 w-16 rounded-full"
                      src={user.image}
                      alt=""
                    />
                  )
                )}
                <span
                  className="absolute inset-0 rounded-full shadow-inner"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Se unió como{" "}
                <a href="#" className="text-gray-900 dark:text-white">
                  {user?.role?.type === "client"
                    ? "Cliente"
                    : "Equipo de trabajo"}
                </a>{" "}
                el <time dateTime={formattedDate}>{formattedDate}</time>
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2 lg:col-start-1">
            {/* Description list*/}
            <section aria-labelledby="applicant-information-title">
              <div className="bg-white shadow dark:bg-gray-700 sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2
                    id="applicant-information-title"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Información de usuario
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Detalles generales del usuario.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 dark:border-gray-600 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tipo de usuario
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user?.role?.type === "client"
                          ? "Cliente"
                          : "Equipo de trabajo"}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Correo electrónico
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user?.email}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rol asignado
                      </dt>
                      <dd className="mt-1 text-sm  capitalize text-gray-900 dark:text-white">
                        {user?.role?.name}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Jerarquía
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {user?.role?.hierarchy}°
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            {/* Comments*/}
            <section aria-labelledby="notes-title">
              <div className="bg-white shadow dark:bg-gray-700 sm:overflow-hidden sm:rounded-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  <div className="px-4 py-5 sm:px-6">
                    <h2
                      id="notes-title"
                      className="text-lg font-medium text-gray-900 dark:text-white"
                    >
                      Notas
                    </h2>
                  </div>
                  <div className="h-[40vh] overflow-auto px-4 py-6 sm:px-6">
                    <ul role="list" className="space-y-4">
                      {filterComments && filterComments?.length > 0
                        ? filterComments.map((comment, idx: number) => (
                            <>
                              <li className="relative" key={idx}>
                                <div className="flex space-x-3">
                                  <div className="shrink-0">
                                    {comment.userCommented.image && (
                                      <Image
                                        height={140}
                                        width={140}
                                        className="h-10 w-10 rounded-full"
                                        src={comment.userCommented.image}
                                        alt=""
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm">
                                      {comment.userCommented.email ? (
                                        <Link
                                          href={`/admin/equipo/${comment.userCommented.email}`}
                                          className="font-medium text-gray-900 dark:text-white"
                                        >
                                          {comment.userCommented?.name}
                                        </Link>
                                      ) : (
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {comment.userCommented?.name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                                      <p>{comment.comment}</p>
                                    </div>
                                    <div className="mt-2 space-x-2 text-sm">
                                      <span className="font-medium text-gray-500 dark:text-gray-400">
                                        {formatDate(comment.createdAt)}
                                      </span>{" "}
                                      <span className="font-medium text-gray-500 dark:text-gray-400">
                                        &middot;
                                      </span>{" "}
                                      <button
                                        type="button"
                                        className="font-medium text-gray-900 dark:text-white"
                                        onClick={() => {
                                          if (reply === comment.id) {
                                            setReply("");
                                          } else {
                                            setReply(comment.id);
                                          }
                                        }}
                                      >
                                        Responder
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                {(comment.userCommented.id ===
                                  session.data?.user?.id ||
                                  canDeleteComments) && (
                                  <button
                                    onClick={() =>
                                      deleteCommentHandler(comment.id)
                                    }
                                    className="absolute right-0 top-0 w-4"
                                  >
                                    <TrashIcon />
                                  </button>
                                )}
                                <ul>
                                  {filterReply(comment.id)?.map((comment) => (
                                    <li
                                      className="relative ml-6 mt-4"
                                      key={comment.id}
                                    >
                                      <div className="flex  space-x-3">
                                        <div className="shrink-0">
                                          {comment.userCommented.image && (
                                            <Image
                                              height={140}
                                              width={140}
                                              className="h-10 w-10 rounded-full"
                                              src={comment.userCommented.image}
                                              alt=""
                                            />
                                          )}
                                        </div>
                                        <div>
                                          <div className="text-sm">
                                            {comment.userCommented.email ? (
                                              <Link
                                                href={`/admin/equipo/${comment.userCommented.email}`}
                                                className="font-medium text-gray-900 dark:text-white"
                                              >
                                                {comment.userCommented?.name}
                                              </Link>
                                            ) : (
                                              <p className="font-medium text-gray-900 dark:text-white">
                                                {comment.userCommented?.name}
                                              </p>
                                            )}
                                          </div>
                                          <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                                            <p>{comment.comment}</p>
                                          </div>
                                          <div className="mt-2 space-x-2 text-sm">
                                            <span className="font-medium text-gray-500 dark:text-gray-400">
                                              {formatDate(comment.createdAt)}
                                            </span>{" "}
                                          </div>
                                        </div>
                                      </div>
                                      {(comment.userCommented.id ===
                                        session.data?.user?.id ||
                                        canDeleteComments) && (
                                        <button
                                          onClick={() =>
                                            deleteCommentHandler(comment.id)
                                          }
                                          className="absolute right-0 top-0 w-4"
                                        >
                                          <TrashIcon />
                                        </button>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </li>

                              {reply === comment.id && (
                                <li>
                                  <form onSubmit={handleSubmit(submitFormSub)}>
                                    <div className="flex justify-end">
                                      <label
                                        htmlFor="comment"
                                        className="sr-only"
                                      >
                                        Comentarios
                                      </label>
                                      <textarea
                                        id="comment"
                                        {...register("replyComment")}
                                        rows={3}
                                        className="block w-9/12 rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:py-1.5 sm:text-sm sm:leading-6"
                                        placeholder="Agregue un comentario"
                                      />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                      <a
                                        href="#"
                                        className="group inline-flex items-start space-x-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                      >
                                        <QuestionMarkCircleIcon
                                          className="sr-only h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                                          aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                          Some HTML is okay.
                                        </span>
                                      </a>
                                      <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                      >
                                        Comentar
                                      </button>
                                    </div>
                                  </form>
                                </li>
                              )}
                              <hr />
                            </>
                          ))
                        : "Sin notas"}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-6 dark:bg-gray-600 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="shrink-0">
                      {session &&
                        session.data &&
                        session.data.user &&
                        session.data.user.image && (
                          <Image
                            height={140}
                            width={140}
                            className="h-10 w-10 rounded-full"
                            src={session.data.user.image}
                            alt=""
                          />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <form onSubmit={handleSubmit(submitForm)}>
                        <div>
                          <label htmlFor="comment" className="sr-only">
                            Comentarios
                          </label>
                          <textarea
                            id="comment"
                            {...register("comment")}
                            rows={3}
                            className="block w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:py-1.5 sm:text-sm sm:leading-6"
                            placeholder="Agregue un comentario"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <a
                            href="#"
                            className="group inline-flex items-start space-x-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            <QuestionMarkCircleIcon
                              className="sr-only h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Some HTML is okay.</span>
                          </a>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            Comentar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section
            aria-labelledby="timeline-title"
            className="lg:col-span-1 lg:col-start-3"
          >
            <div className="overflow-auto bg-white px-4 py-5 shadow dark:bg-gray-700 sm:h-[50vh] sm:rounded-lg sm:px-6 lg:h-[80vh]">
              <h2
                id="timeline-title"
                className="text-lg font-medium text-gray-900 dark:text-white"
              >
                Historial de actividades
              </h2>

              {/* Activity Feed */}
              <div className="mt-6 flow-root">
                <ul role="list" className="-mb-8">
                  {user?.ProductHistory.sort((a, b) => {
                    return b.date.getTime() - a.date.getTime();
                  }).map((item, itemIdx: number) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== user?.ProductHistory.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={classNames(
                                item.type === "create"
                                  ? "bg-blue-500"
                                  : item.type === "edit"
                                  ? " bg-gray-400"
                                  : item.type === "approve"
                                  ? " bg-green-500"
                                  : " bg-amber-500",
                                "mt-2 flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-transparent",
                              )}
                            >
                              {item.type === "create" ? (
                                <ArrowUpTrayIcon
                                  fill="white"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              ) : item.type === "edit" ? (
                                <ArrowPathIcon
                                  fill="white"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              ) : item.type === "approve" ? (
                                <CheckIcon
                                  fill="white"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ExclamationTriangleIcon
                                  fill="white"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                                <span className="text-base font-semibold">
                                  {item.type === "create"
                                    ? "creó"
                                    : item.type === "edit"
                                    ? "editó"
                                    : item.type === "approve"
                                    ? "aprobó"
                                    : "desaprobó"}{" "}
                                </span>
                                {canShow ? (
                                  <Link
                                    href={`/admin/producto/${item.Product.slug}`}
                                    className="font-medium text-gray-900 dark:text-white"
                                  >
                                    {item.Product.name}
                                  </Link>
                                ) : (
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {item.Product.name}
                                  </p>
                                )}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                              <time dateTime={formatDate(item.date)}>
                                {formatDate(item.date)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
