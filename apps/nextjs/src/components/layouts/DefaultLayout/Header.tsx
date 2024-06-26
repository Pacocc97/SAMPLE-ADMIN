import { Fragment } from "react";
import Link from "next/link";
import { Popover, Transition } from "@headlessui/react";
import { Bars4Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Profile from "@layouts/DefaultLayout/Profile";
import { signIn, signOut, useSession } from "next-auth/react";

import DarkModeSwitch from "~/components/DarkModeSwitch";
import ButtonElement from "~/components/ui/ButtonElement";
import LinkElement from "~/components/ui/LinkElement";

export default function Header() {
  const { data: session } = useSession();

  return (
    <Popover className="sticky left-0 top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
      <div className="container mx-auto flex min-h-[79px] w-full px-4 sm:px-6">
        <div className="flex flex-1 items-center justify-between py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/">
              <h1 className="w-auto text-xl font-bold text-gray-800 dark:text-white">
                ICB
              </h1>
            </Link>
          </div>
          <div className="-my-2 -mr-2 md:hidden">
            <DarkModeSwitch />
            <Popover.Button className="ml-8 inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-gray-800 dark:text-sky-400 dark:hover:text-blue-500">
              <span className="sr-only">Open menu</span>
              <Bars4Icon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          {/* <Popover.Group as="nav" className="hidden space-x-10 md:flex">
            <Link href="/">
              <span className="text-base font-medium text-gray-700 cursor-pointer hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">
                Home
              </span>
            </Link>
          </Popover.Group> */}
          <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
            <DarkModeSwitch />
            {session ? (
              <Profile />
            ) : (
              // <ButtonElement
              //   intent="blue"
              //   size="md"
              //   onClick={() => signIn("google")}
              //   className="ml-4"
              // >
              //   Login
              // </ButtonElement>
              <LinkElement
                intent="blue"
                size="md"
                href="/login"
                className="ml-4"
              >
                Login
              </LinkElement>
            )}
          </div>
        </div>
      </div>

      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden"
        >
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-5 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold ">Crypto Dashboard</span>
                </div>
                <div className="-mr-2">
                  <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6"></div>
            </div>
            <div className="space-y-6 px-5 py-6">
              {/* <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <Link href="/" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Home
                </Link>
              </div> */}
              <div>
                {session ? (
                  <ButtonElement
                    intent="blue"
                    size="sm"
                    fullWidth
                    onClick={() => signOut()}
                  >
                    Logout
                  </ButtonElement>
                ) : (
                  // <ButtonElement
                  //   intent="blue"
                  //   size="sm"
                  //   fullWidth
                  //   onClick={() => signIn("google")}
                  // >
                  //   Login
                  // </ButtonElement>
                  <LinkElement intent="blue" size="sm" fullWidth href="/login">
                    Login
                  </LinkElement>
                )}
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
