import { Fragment } from "react";
import Image from "next/image";
import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";

import { classNames } from "~/utils/object";
import { env } from "../../../env.mjs";

export default function Profile() {
  const { data: session } = useSession();
  return (
    <Menu as="div" className="relative ml-8">
      <div>
        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
          <span className="sr-only">Open user menu</span>
          <Image
            className="h-10 w-10 rounded-full"
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
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-900">
              {session?.user?.name}
            </p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700",
                )}
              >
                Your Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700",
                )}
              >
                Settings
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                onClick={() => signOut()}
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block w-full px-4 py-2 text-left text-sm text-gray-700",
                )}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
