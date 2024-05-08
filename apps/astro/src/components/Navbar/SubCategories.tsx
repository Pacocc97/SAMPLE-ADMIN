import { createSignal } from "solid-js";

import type { Category } from "@acme/db";

import { classNames } from "~/utils/classNames";

type Props = {
  category: Category & {
    child: Category[];
  };
};

export const SubCategories = (props: Props) => {
  const { category } = props;
  const [open, setOpen] = createSignal<boolean>(false);

  return (
    <>
      <a
        href={`/${category.slug}`}
        class="hover:text-blue-600 hover:underline dark:hover:text-blue-500"
      >
        {category.name}
      </a>
      {category.child.length !== 0 && (
        <button onClick={() => setOpen((p) => !p)}>
          <svg
            class={classNames(
              open() ? "-rotate-180" : "",
              "ml-2	 h-4 w-4 transition-transform",
            )}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      )}
      {category.child.length !== 0 && open() && (
        <ul
          role="list"
          id="slide-right"
          aria-labelledby="Clothing-heading"
          class="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
        >
          {category.child.map((cat: Category) => (
            <li class="flex">
              <a
                href={`/${cat.slug}`}
                class="border-b hover:text-gray-800"
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
