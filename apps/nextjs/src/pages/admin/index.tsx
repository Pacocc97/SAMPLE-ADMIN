import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BuildingOffice2Icon,
  CalendarIcon,
  LockOpenIcon,
  SwatchIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { AdminLayout } from "@layouts/AdminLayout";
import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";

import { classNames } from "~/utils/object";
import { trpc } from "~/utils/trpc";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";

const stats = [
  { label: "Vacation days left", value: 12 },
  { label: "Sick days left", value: 4 },
  { label: "Personal days left", value: 2 },
];
const actions = [
  {
    icon: ProductBoxIcon,
    name: "Vea los productos",
    href: "/admin/producto",
    iconForeground: "text-teal-700",
    iconBackground: "bg-teal-50",
    desc: "Consulte todos los productos y su estado actual.",
  },
  {
    icon: BuildingOffice2Icon,
    name: "Consulte fabricantes",
    href: "/admin/fabricante",
    iconForeground: "text-purple-700",
    iconBackground: "bg-purple-50",
    desc: "Vea los fabricantes disponibles y sus productos.",
  },
  {
    icon: UsersIcon,
    name: "Equipo de trabajo",
    href: "/admin/equipo",
    iconForeground: "text-sky-700",
    iconBackground: "bg-sky-50",
    desc: "Vea los perfiles de sus compañeros de trabajo.",
  },
  {
    icon: UsersIcon,
    name: "Clientes",
    href: "/admin/clientes",
    iconForeground: "text-yellow-700",
    iconBackground: "bg-yellow-50",
    desc: "Consulte la información de nuestra cartera de clientes.",
  },
  {
    icon: SwatchIcon,
    name: "Roles",
    href: "/admin/roles",
    iconForeground: "text-rose-700",
    iconBackground: "bg-rose-50",
    desc: "Vea todos los roles que existen.",
  },
  {
    icon: CalendarIcon,
    name: "Calendario",
    href: "/admin/calendario",
    iconForeground: "text-indigo-700",
    iconBackground: "bg-indigo-50",
    desc: "Consulte fechas importantes y notas del día.",
  },
];
const announcements = [
  {
    id: 1,
    title: "Inicio de promociones Hot Sale",
    href: "#",
    preview:
      "Cum qui rem deleniti. Suscipit in dolor veritatis sequi aut. Vero ut earum quis deleniti. Ut a sunt eum cum ut repudiandae possimus. Nihil ex tempora neque cum consectetur dolores.",
  },
  {
    id: 2,
    title: "Lista de nuevos productos",
    href: "#",
    preview:
      "Alias inventore ut autem optio voluptas et repellendus. Facere totam quaerat quam quo laudantium cumque eaque excepturi vel. Accusamus maxime ipsam reprehenderit rerum id repellendus rerum. Culpa cum vel natus. Est sit autem mollitia.",
  },
  {
    id: 3,
    title: "Revisión de inventarios pendientes",
    href: "#",
    preview:
      "Tenetur libero voluptatem rerum occaecati qui est molestiae exercitationem. Voluptate quisquam iure assumenda consequatur ex et recusandae. Alias consectetur voluptatibus. Accusamus a ab dicta et. Consequatur quis dignissimos voluptatem nisi.",
  },
];

export default function Page() {
  const { data } = useSession();
  const user = data?.user;
  const { data: users } = trpc.users.all.useQuery();
  const { data: open } = trpc.openpay.all.useQuery();

  const filterTeam = users
    ?.filter((data) => data?.role?.type === "team")
    .slice(1, 5);
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="sr-only">Profile</h1>
        {/* Main 3 column grid */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            {/* Welcome panel */}
            <section aria-labelledby="profile-overview-title">
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
                <h2 className="sr-only" id="profile-overview-title">
                  Profile Overview
                </h2>
                <div className="bg-white p-6 dark:bg-gray-700">
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:space-x-5">
                      <div className="flex-shrink-0">
                        {user && user.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="mx-auto h-20 w-20 rounded-full"
                            src={user.image}
                            alt=""
                          />
                        )}
                      </div>
                      <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-200">
                          Bienvenido,
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                          {user?.name}
                        </p>
                        <p className="text-sm font-medium uppercase text-gray-600 dark:text-gray-200">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-center sm:mt-0">
                      {user && user.id && (
                        <Link
                          href={`/admin/equipo/${user.id}`}
                          className="flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  dark:bg-gray-700 dark:text-white"
                        >
                          Ver perfil
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                {/* <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 dark:bg-gray-600 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="px-6 py-5 text-center text-sm font-medium"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {stat.value}
                      </span>{' '}
                      <span className="text-gray-600 dark:text-gray-200">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div> */}
              </div>
            </section>

            {/* Actions panel */}
            <section aria-labelledby="quick-links-title">
              <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
                <h2 className="sr-only" id="quick-links-title">
                  Quick links
                </h2>
                {actions.map((action, actionIdx) => (
                  <div
                    key={action.name}
                    className={classNames(
                      actionIdx === 0
                        ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
                        : "",
                      actionIdx === 1 ? "sm:rounded-tr-lg" : "",
                      actionIdx === actions.length - 2
                        ? "sm:rounded-bl-lg"
                        : "",
                      actionIdx === actions.length - 1
                        ? "rounded-bl-lg rounded-br-lg sm:rounded-bl-none"
                        : "",
                      "group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500 dark:bg-gray-700",
                    )}
                  >
                    <div>
                      <span
                        className={classNames(
                          action.iconBackground,
                          action.iconForeground,
                          "inline-flex rounded-lg p-3 ring-4 ring-white dark:ring-gray-800",
                        )}
                      >
                        <action.icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-medium">
                        <Link href={action.href} className="focus:outline-none">
                          {/* Extend touch target to entire panel */}
                          <span
                            className="absolute inset-0"
                            aria-hidden="true"
                          />
                          {action.name}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-200">
                        {action.desc}
                      </p>
                    </div>
                    <span
                      className="pointer-events-none absolute right-6 top-6 text-gray-300 group-hover:text-gray-400"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                      </svg>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="grid grid-cols-1 gap-4">
            {/* Announcements */}
            <section aria-labelledby="announcements-title">
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
                <div className="p-6">
                  <h2
                    className="text-base font-medium text-gray-900 dark:text-white"
                    id="announcements-title"
                  >
                    Anuncios
                  </h2>
                  <div className="mt-6 flow-root">
                    <ul role="list" className="-my-5 divide-y divide-gray-200">
                      {announcements.map((announcement) => (
                        <li key={announcement.id} className="py-5">
                          <div className="relative focus-within:ring-2 focus-within:ring-cyan-500">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              <a
                                href={announcement.href}
                                className="hover:underline focus:outline-none"
                              >
                                {/* Extend touch target to entire panel */}
                                <span
                                  className="absolute inset-0"
                                  aria-hidden="true"
                                />
                                {announcement.title}
                              </a>
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-200">
                              {announcement.preview}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/admin/calendario"
                      className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  dark:bg-gray-700 dark:text-white"
                    >
                      Ver todos
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Hires */}
            <section aria-labelledby="recent-hires-title">
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-700">
                <div className="p-6">
                  <h2
                    className="text-base font-medium text-gray-900 dark:text-white"
                    id="recent-hires-title"
                  >
                    Comentarios recientes
                  </h2>
                  <div className="mt-6 flow-root">
                    <ul role="list" className="-my-5 divide-y divide-gray-200">
                      {filterTeam?.map((person: User) => (
                        <li key={person.id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {person.image && (
                                <Image
                                  height={100}
                                  width={100}
                                  className="h-8 w-8 rounded-full"
                                  src={person.image}
                                  alt=""
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {person.name}
                              </p>
                              <p className="truncate text-sm text-gray-500 dark:text-gray-200">
                                {person.email}
                              </p>
                            </div>
                            <div>
                              <Link
                                href={`/admin/equipo/${person.id}`}
                                className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  dark:bg-gray-700 dark:text-white"
                              >
                                Ver
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <a
                      href="#"
                      className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50  dark:bg-gray-700 dark:text-white"
                    >
                      Ver todos
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
