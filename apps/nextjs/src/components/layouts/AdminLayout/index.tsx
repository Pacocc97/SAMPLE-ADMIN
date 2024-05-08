import { Fragment, useEffect, useState, type ReactNode } from "react";
import Head from "next/head.js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Dialog,
  Disclosure,
  Menu,
  Popover,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  HomeIcon,
  InboxIcon,
  KeyIcon,
  ListBulletIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  PresentationChartLineIcon,
  RectangleGroupIcon,
  SwatchIcon,
  UserGroupIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";

import { classNames } from "~/utils/object";
import DarkModeSwitch from "~/components/DarkModeSwitch";
import Unauthorized from "~/components/Unauthorized";
import ProductBoxIcon from "~/components/icons/ProductBoxIcon";
import { env } from "../../../env.mjs";

type DefaultLayoutProps = { children: ReactNode };

export const AdminLayout = ({ children }: DefaultLayoutProps) => {
  const { data: session, status } = useSession({
    required: true,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const isAuthorized = (permission: string) => {
    return session?.user?.permissions?.includes(permission);
  };
  const isActive = (href: string) => {
    return href == "/admin"
      ? href == router.pathname
      : router.pathname.includes(href);
  };

  if (status === "loading") {
    return <div></div>;
  }

  if (!session.user?.permissions?.includes("access_admin_panel")) {
    return <Unauthorized permission="access_admin_panel" />;
  }
  const navegador = [
    { authorized: true, name: "Tablero", href: "/admin", icon: HomeIcon },
    // {
    //   authorized: true,
    //   icon: PresentationChartBarIcon,
    //   href: "/admin/orden",
    //   name: "Ordenes",
    // },
    {
      authorized: true,
      name: "Ordenes",
      icon: PresentationChartBarIcon,
      children: [
        {
          name: "Ordenes",
          href: "/admin/orden",
          icon: PresentationChartBarIcon,
        },
        {
          name: "Cotizaciones",
          href: "/admin/cotizacion",
          icon: PresentationChartLineIcon,
        },
      ],
    },
    {
      authorized: true,
      name: "Usuarios",
      icon: UserGroupIcon,
      children: [
        { name: "Equipo", href: "/admin/equipo", icon: UsersIcon },
        { name: "Clientes", href: "/admin/clientes", icon: UsersIcon },
      ],
    },
    {
      authorized: isAuthorized("list_product"),
      name: "Productos",
      icon: ProductBoxIcon,
      children: [
        { name: "Productos", href: "/admin/producto", icon: ProductBoxIcon },
        { name: "Paquetes", href: "/admin/paquetes", icon: RectangleGroupIcon },
        {
          name: "Fabricantes",
          href: "/admin/fabricante",
          icon: BuildingOffice2Icon,
        },
        {
          name: "Categorías",
          href: "/admin/categorias_producto",
          icon: ListBulletIcon,
        },
      ],
    },
    {
      authorized: isAuthorized("list_blog"),
      name: "Blog",
      icon: InboxIcon,
      children: [
        {
          authorized: isAuthorized("list_blog"),
          name: "Artículos",
          href: "/admin/blog",
          icon: InboxIcon,
        },
        {
          authorized: isAuthorized("list_blogCategory"),
          name: "Categorías",
          href: "/admin/categorias_blog",
          icon: ListBulletIcon,
        },
      ],
    },

    {
      authorized: isAuthorized("list_roles"),
      name: "Autorización",
      icon: KeyIcon,
      children: [
        { name: "Roles", href: "/admin/roles", icon: SwatchIcon },
        { name: "Permisos", href: "/admin/permisos", icon: LockOpenIcon },
      ],
    },

    {
      authorized: isAuthorized("list_image"),
      name: "Imagen",
      href: "/admin/imagen",
      icon: PhotoIcon,
    },
    // {
    //   authorized: true,
    //   name: "Calendario",
    //   href: "/admin/calendario",
    //   icon: CalendarIcon,
    // },

    // { authorized: true, name: "Reportes", href: "#", icon: ChartBarIcon },
  ];
  return (
    <>
      <Head>
        <title>Panel administrativo</title>
        <link rel="icon" href="/images/Logo-ICB-letras.png" />
      </Head>
      <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white ">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute right-0 top-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-0 flex-1 overflow-y-auto pb-4 pt-5">
                    <div className="flex shrink-0 items-center justify-between px-4">
                      <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text font-bold text-transparent">
                        Tablero ICB
                      </span>
                      <DarkModeSwitch />
                    </div>
                    <nav className="mt-5 space-y-1 px-2">
                      {navegador.map(
                        (item) =>
                          item.authorized &&
                          (!item.children ? (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                isActive(item.href)
                                  ? "bg-gradient-to-r from-sky-500 to-emerald-600 text-black dark:text-white"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                                "group flex items-center rounded-md px-2 py-2 text-base font-medium",
                              )}
                            >
                              <item.icon
                                className={classNames(
                                  isActive(item.href)
                                    ? "text-gray-600 dark:text-white"
                                    : "text-gray-400 group-hover:text-gray-300",
                                  "mr-4 h-6 w-6 flex-shrink-0",
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          ) : (
                            <Disclosure
                              as="div"
                              key={item.name}
                              className="space-y-1"
                            >
                              {({ open }) => (
                                <>
                                  <Disclosure.Button
                                    className={classNames(
                                      "group flex w-full items-center rounded-md py-2 pl-2 pr-1 text-left text-sm  font-medium text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                                    )}
                                  >
                                    <item.icon
                                      className="mr-3 h-6 w-6 shrink-0 text-gray-400"
                                      aria-hidden="true"
                                    />

                                    <span className="flex-1">{item.name}</span>
                                    <svg
                                      className={classNames(
                                        open
                                          ? "rotate-90 text-gray-400"
                                          : "text-gray-300",
                                        "ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400",
                                      )}
                                      viewBox="0 0 20 20"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="M6 6L14 10L6 14V6Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="space-y-1">
                                    {item.children.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        className={classNames(
                                          isActive(subItem.href)
                                            ? "bg-gradient-to-r from-sky-500 to-emerald-600 text-black dark:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                                          "group flex cursor-pointer items-center rounded-md py-2  pl-11 pr-2 text-sm  font-medium",
                                        )}
                                      >
                                        <subItem.icon
                                          className={classNames(
                                            isActive(subItem.href)
                                              ? "text-gray-600 dark:text-white"
                                              : "text-gray-400 group-hover:text-gray-300",
                                            "mr-3 h-5 w-5 flex-shrink-0",
                                          )}
                                          aria-hidden="true"
                                        />
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          )),
                      )}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 shrink-0">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white dark:border-none dark:bg-gray-800">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
              <div className="flex shrink-0 items-center justify-between px-4">
                <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text font-bold text-transparent">
                  Tablero ICB
                </span>
                <DarkModeSwitch />
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navegador.map(
                  (item) =>
                    item.authorized &&
                    (!item.children ? (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          isActive(item.href)
                            ? "bg-gradient-to-r from-sky-500 to-emerald-600 text-black dark:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                          "group flex cursor-pointer items-center rounded-md px-2 py-2 text-sm font-medium",
                        )}
                      >
                        <item.icon
                          className={classNames(
                            isActive(item.href)
                              ? "text-gray-600 dark:text-white"
                              : "text-gray-400 group-hover:text-gray-300",
                            "mr-3 h-6 w-6 flex-shrink-0",
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ) : (
                      <Disclosure
                        as="div"
                        key={item.name}
                        className="space-y-1"
                      >
                        {({ open }) => (
                          <>
                            <Disclosure.Button
                              className={classNames(
                                "group flex w-full items-center rounded-md py-2 pl-2 pr-1 text-left text-sm  font-medium text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                              )}
                            >
                              <item.icon
                                className="mr-3 h-6 w-6 shrink-0 text-gray-400"
                                aria-hidden="true"
                              />

                              <span className="flex-1">{item.name}</span>
                              <svg
                                className={classNames(
                                  open
                                    ? "rotate-90 text-gray-400"
                                    : "text-gray-300",
                                  "ml-3 h-5 w-5 flex-shrink-0 transform transition-colors duration-150 ease-in-out group-hover:text-gray-400",
                                )}
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 6L14 10L6 14V6Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </Disclosure.Button>
                            <Disclosure.Panel className="space-y-1">
                              {item.children.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className={classNames(
                                    isActive(subItem.href)
                                      ? "bg-gradient-to-r from-sky-500 to-emerald-600 text-black dark:text-white"
                                      : "text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                                    "group flex cursor-pointer items-center rounded-md py-2  pl-11 pr-2 text-sm  font-medium",
                                  )}
                                >
                                  <subItem.icon
                                    className={classNames(
                                      isActive(subItem.href)
                                        ? "text-gray-600 dark:text-white"
                                        : "text-gray-400 group-hover:text-gray-300",
                                      "mr-3 h-5 w-5 flex-shrink-0",
                                    )}
                                    aria-hidden="true"
                                  />
                                  {subItem.name}
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )),
                )}
              </nav>
            </div>
          </div>
        </div>
        <Popover className="static md:pl-64">
          <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-none dark:bg-gray-800 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon
                className="h-6 w-6"
                color="#FFFFFF"
                aria-hidden="true"
              />
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 md:hidden"
              aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch md:gap-x-6">
              <form className="relative flex flex-1" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:bg-gray-800 sm:text-sm"
                  placeholder="Buscar..."
                  type="search"
                  name="search"
                  disabled
                />
              </form>
              <div className="flex items-center gap-x-4 md:gap-x-6">
                <Popover.Button
                  type="button"
                  className="-m-2.5 inline-flex items-center p-2.5 text-center text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Ver notificaciones</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  <div className="relative flex">
                    <div className="relative -top-2 right-3 inline-flex h-3 w-3 rounded-full border-2 border-white bg-red-500 dark:border-gray-900"></div>
                  </div>
                </Popover.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                  className="absolute right-0 top-14 z-20 w-full max-w-sm divide-y divide-gray-100 rounded-lg bg-white shadow dark:divide-gray-700 dark:bg-gray-800 md:right-32"
                >
                  <Popover.Panel
                    id="dropdownNotification"
                    aria-labelledby="dropdownNotificationButton"
                  >
                    <div className="block rounded-t-lg bg-gray-50 px-4 py-2 text-center font-medium text-gray-700 dark:bg-gray-700 dark:text-white">
                      Notificaciones
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <a
                        href="#"
                        className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="shrink-0">
                          <Image
                            width={50}
                            height={50}
                            className="h-11 w-11 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-1.jpg"
                            alt="Jese image"
                          />
                          <div className="absolute -mt-5 ml-6 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-blue-600 dark:border-gray-800">
                            <svg
                              className="h-3 w-3 text-white"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path>
                              <path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="w-full pl-3">
                          <div className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                            Nuevo comentario de{" "}
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Jese Leos
                            </span>
                            :{" "}
                            {`"Hola! el cambio de precio de las centrifugas será temporal?"`}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">
                            hace unos momentos
                          </div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="shrink-0">
                          <Image
                            width={50}
                            height={50}
                            className="h-11 w-11 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                            alt="Joseph image"
                          />
                          <div className="absolute -mt-5 ml-6 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-900 dark:border-gray-800">
                            <svg
                              className="h-3 w-3 text-white"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="w-full pl-3">
                          <div className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Joseph Mcfall
                            </span>{" "}
                            y{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              otros 5
                            </span>{" "}
                            han hecho cambios en equipos.
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">
                            hace 10 minutos
                          </div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="shrink-0">
                          <Image
                            width={50}
                            height={50}
                            className="h-11 w-11 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                            alt="Bonnie image"
                          />
                          <div className="absolute -mt-5 ml-6 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-red-600 dark:border-gray-800">
                            <svg
                              className="h-3 w-3 text-white"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div className="w-full pl-3">
                          <div className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Bonnie Green
                            </span>{" "}
                            y{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              otros 15
                            </span>{" "}
                            han visitado la página.
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">
                            hace 44 minutos
                          </div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="shrink-0">
                          <Image
                            width={50}
                            height={50}
                            className="h-11 w-11 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
                            alt="Leslie image"
                          />
                          <div className="absolute -mt-5 ml-6 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-green-400 dark:border-gray-800">
                            <svg
                              className="h-3 w-3 text-white"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <div className="w-full pl-3">
                          <div className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Leslie Livingston
                            </span>{" "}
                            Ha escrito un artículo en el blog: Tipos de
                            microscopios y sus funcionalidades
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">
                            hace 1 hora
                          </div>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="shrink-0">
                          <Image
                            width={50}
                            height={50}
                            className="h-11 w-11 rounded-full"
                            src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                            alt="Robert image"
                          />
                          <div className="absolute -mt-5 ml-6 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-purple-500 dark:border-gray-800">
                            <svg
                              className="h-3 w-3 text-white"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="w-full pl-3">
                          <div className="mb-1.5 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Robert Brown
                            </span>{" "}
                            Ha agregado un anuncio: &quot;Inicio de promociones
                            Hot Sale&quot;
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">
                            hace 3 horas
                          </div>
                        </div>
                      </a>
                    </div>
                    <a
                      href="#"
                      className="block rounded-b-lg bg-gray-50 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100  dark:bg-gray-700 dark:text-white dark:hover:bg-gray-700"
                    >
                      <div className="inline-flex items-center ">
                        <svg
                          className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Ver todo
                      </div>
                    </a>
                  </Popover.Panel>
                </Transition>
                {/* Separator */}
                <div
                  className="hidden md:block md:h-6 md:w-px md:bg-gray-900/10"
                  aria-hidden="true"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <Image
                      className="inline-block h-9 w-9 rounded-full"
                      referrerPolicy="no-referrer"
                      src={
                        session?.user?.image ||
                        env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL +
                          "/images/placeholders/default-user-placeholder.jpg"
                      }
                      width={40}
                      height={40}
                      alt="User Avatar"
                    />
                    <span className="hidden md:flex md:items-center">
                      <span
                        className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50"
                        aria-hidden="true"
                      >
                        {session?.user?.name}
                      </span>
                      <ChevronDownIcon
                        className="ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
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
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none  dark:bg-gray-700">
                      <Menu.Item>
                        <Link
                          href="/admin/perfil"
                          className={classNames(
                            "block w-full rounded px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-600",
                          )}
                        >
                          Mi perfil
                        </Link>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={() => signOut()}
                          className={classNames(
                            "block w-full rounded px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-100 dark:text-gray-50 dark:hover:bg-gray-600",
                          )}
                        >
                          Cerrar sesión
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto px-4 sm:px-6 md:px-8">
                {/* Replace with your content */}
                <main className="text-gray-800 dark:text-gray-50">
                  {children}
                </main>
                {/* /End replace */}
              </div>
            </div>
          </main>
        </Popover>

        {/* <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-gray-100 pt-1 pl-1 dark:bg-gray-800 sm:pl-3 sm:pt-3 md:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <main className="text-gray-800 dark:text-gray-50">
                {children}
              </main>
            </div>
          </div>
        </main>
      </div> */}
      </div>
    </>
  );
};
