import {
  CreditCardIcon,
  KeyIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { classNames } from "~/utils/object";

const navigation = [
  { name: "Seo General", href: "#", icon: UserCircleIcon, current: true },
  { name: "Open Graph", href: "#", icon: KeyIcon, current: false },
  { name: "Twitter", href: "#", icon: CreditCardIcon, current: false },
];

export default function Example() {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="px-2 py-6 sm:px-6 lg:col-span-3 lg:px-0 lg:py-0">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? "bg-gray-50 text-indigo-700 hover:bg-white hover:text-indigo-700"
                  : "text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:text-white",
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
              )}
              aria-current={item.current ? "page" : undefined}
            >
              <item.icon
                className={classNames(
                  item.current
                    ? "text-indigo-500 group-hover:text-indigo-500"
                    : "text-gray-400 group-hover:text-gray-500",
                  "-ml-1 mr-3 h-6 w-6 flex-shrink-0",
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        <form action="#" method="POST">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="space-y-6 bg-white px-4 py-6 sm:p-6"></div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <button>Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
