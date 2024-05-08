import Link from "next/link";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Image, Seo } from "@prisma/client";

import { classNames } from "~/utils/object";
import SeoGeneral, {
  OGArticle,
  OGBasic,
  OGImage,
  OGOptional,
  SeoTwitter,
} from "../SeoProduct";

interface Props {
  value: (Seo & { openGraphBasicImage: Image }) | null | undefined;
  className: string;
  slug: string;
  editable?: boolean;
}

export default function Accordion({
  editable = false,
  value,
  slug,
  className = "",
}: Props) {
  const faqs = [
    {
      section: "Seo General",
      content: <SeoGeneral value={value} />,
    },
    {
      section: "Open Graph Basic",
      content: <OGBasic value={value} />,
    },
    {
      section: "Open Graph Optional",
      content: <OGOptional value={value} />,
    },
    {
      section: "Open Graph Image",
      content: <OGImage value={value} />,
    },
    {
      section: "Open Graph Article",
      content: <OGArticle value={value} />,
    },
    {
      section: "Twitter",
      content: <SeoTwitter value={value} />,
    },
  ];
  return (
    <div className={classNames(className, "mb-8 mt-[-40px]")}>
      <div className="max-w-screen-lg">
        <div className="mx-auto divide-y-2 divide-gray-200">
          <dl className="mt-6 space-y-6 divide-y divide-gray-200">
            {faqs.map((faq) => (
              <Disclosure
                as="div"
                defaultOpen={editable ? false : true}
                key={faq.section}
                className="pt-6"
              >
                {({ open }) => (
                  <>
                    <dt className="text-lg">
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-400">
                        <span className="font-sm text-base text-gray-900 dark:text-gray-50">
                          {faq.section}
                        </span>
                        <span className="ml-6 flex h-4 items-center">
                          <ChevronDownIcon
                            className={classNames(
                              open ? "-rotate-180" : "rotate-0",
                              "h-6 w-6 transform transition-all",
                            )}
                            aria-hidden="true"
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Transition
                      enter="transition duration-100 ease-linear"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-linear"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel as="dd" className="mt-2 pb-5 pr-12">
                        <>{faq.content}</>
                        {value && (
                          <Link
                            href={{
                              pathname: `${slug}/editar`,
                              query: { paso: "SEO", seoSec: `${faq.section}` },
                            }}
                            className="xs:rounded-lg bg-gray-50 px-2 py-2 text-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:bg-gray-500 dark:text-gray-100 dark:hover:bg-gray-600 sm:rounded-lg"
                          >
                            Editar {faq.section}
                          </Link>
                        )}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
