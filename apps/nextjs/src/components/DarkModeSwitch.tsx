import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import { classNames } from "~/utils/object";

export default function DarkModeSwitch() {
  const [theme, setTheme] = useState<"Light" | "Dark">();

  useEffect(() => {
    setDocumentClass();
  }, []);

  function setDocumentClass() {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setTheme("Dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("Light");
    }
  }

  function darkMode() {
    localStorage.theme = "dark";
    setDocumentClass();
  }

  function lightMode() {
    localStorage.theme = "light";
    setDocumentClass();
  }

  function systemMode() {
    localStorage.removeItem("theme");
    setDocumentClass();
  }

  const types = [
    { name: "Light", icon: SunIcon, trigger: lightMode },
    { name: "Dark", icon: MoonIcon, trigger: darkMode },
    { name: "System", icon: ComputerDesktopIcon, trigger: systemMode },
  ];

  function ThemeIcon() {
    const type = types.find(({ name }) => name === theme) || types[2];

    if (type) {
      return (
        <type.icon className="-mx-1 h-5 w-5 text-sky-500" aria-hidden="true" />
      );
    } else {
      return (
        <ComputerDesktopIcon
          className="-mx-1 h-5 w-5 text-sky-500"
          aria-hidden="true"
        />
      );
    }
  }

  return (
    <Menu as="div" className="relative z-20 inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md border border-white bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-2 ring-indigo-500 ring-offset-gray-100 hover:bg-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 ">
          <ThemeIcon />
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
        <Menu.Items className="absolute right-0 mt-2 w-28 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
          <div className="py-1">
            {types.map((type) => (
              <Menu.Item key={type.name}>
                {({ active }) => (
                  <button
                    onClick={type.trigger}
                    type="button"
                    className={classNames(
                      active
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-600 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-300",
                      "group flex w-full items-center px-4 py-2 text-sm",
                    )}
                  >
                    <type.icon
                      className="mr-3 h-5 w-5 text-sky-400 group-hover:text-sky-500"
                      aria-hidden="true"
                    />
                    {type.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
