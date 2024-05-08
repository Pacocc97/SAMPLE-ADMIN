/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  AtSymbolIcon,
  BookOpenIcon,
  GlobeAltIcon,
  LifebuoyIcon,
  MegaphoneIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import type { Control, UseFormRegister } from "react-hook-form";

import { classNames } from "~/utils/object";
import { type Size } from "~/types/types";
import { OpenGraphArticle } from "./SeoInputs/OpenGraphArticle";
import { OpenGraphBasic } from "./SeoInputs/OpenGraphBasic";
import { OpenGraphImage } from "./SeoInputs/OpenGraphImage";
import { OpenGraphOptional } from "./SeoInputs/OpenGraphOptional";
import { SeoGeneral } from "./SeoInputs/SeoGeneral";
import { Twitter } from "./SeoInputs/Twitter";

type Handle = {
  reset: () => void;
};

export const SeoSection = ({
  register,
  control,
  getError,
  imageOpError,
  sizeOp,
  baseOpImage,
  setBaseOpImage,
  setFileName,
  imageOpRef,
  seoSec,
  errors,
  setAltImage,
  altImage,
}: {
  register: UseFormRegister<any>;
  control: Control<any>;
  getError: Function;
  imageOpError?: string;
  sizeOp: Size;
  setFileName?: Dispatch<SetStateAction<string | undefined>>;
  baseOpImage?: string;
  setBaseOpImage: Dispatch<SetStateAction<string | undefined>>;
  imageOpRef: RefObject<Handle>;
  seoSec?: string | string[];
  errors: any;
  setAltImage?: Dispatch<SetStateAction<string | null | undefined>>;
  altImage?: string | null;
}) => {
  const [currentSection, setCurrentSection] = useState(
    seoSec ? seoSec : "Seo General",
  );
  const navigation = [
    {
      name: "Seo General",
      icon: MegaphoneIcon,
      current: "Seo General" === currentSection ? true : false,
      error:
        errors?.title ||
        errors?.descriptionMeta ||
        errors?.canonical ||
        errors?.charset
          ? true
          : false,
    },
    {
      name: "Open Graph Basic",
      icon: GlobeAltIcon,
      current: "Open Graph Basic" === currentSection ? true : false,
      error:
        errors?.openGraphBasicTitle ||
        errors?.openGraphBasicType ||
        errors?.openGraphBasicUrl ||
        errors?.openGraphBasicImageId
          ? true
          : false,
    },
    {
      name: "Open Graph Optional",
      icon: LifebuoyIcon,
      current: "Open Graph Optional" === currentSection ? true : false,
      error:
        errors?.openGraphOptionalAudio ||
        errors?.openGraphOptionalDescription ||
        errors?.openGraphOptionalDeterminer ||
        errors?.openGraphOptionalLocale ||
        errors?.openGraphOptionalLocaleAlternate ||
        errors?.openGraphOptionalSiteName ||
        errors?.openGraphOptionalVideo
          ? true
          : false,
    },
    {
      name: "Open Graph Image",
      icon: PhotoIcon,
      current: "Open Graph Image" === currentSection ? true : false,
      error:
        errors?.openGraphImageUrl ||
        errors?.openGraphImageSecureUrl ||
        errors?.openGraphImageType ||
        errors?.openGraphImageWidth ||
        errors?.openGraphImageHeight ||
        errors?.openGraphImageAlt
          ? true
          : false,
    },
    {
      name: "Open Graph Article",
      icon: BookOpenIcon,
      current: "Open Graph Article" === currentSection ? true : false,
      error:
        errors?.openGraphArticleAuthor ||
        errors?.openGraphArticleSection ||
        errors?.openGraphArticleTags
          ? true
          : false,
    },
    {
      name: "Twitter",
      icon: AtSymbolIcon,
      current: "Twitter" === currentSection ? true : false,
      error:
        errors?.twitterCard || errors?.twitterSite || errors?.twitterCreator
          ? true
          : false,
    },
  ];

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
      <aside className="mx-8 mb-4 rounded-lg border-r border-gray-200 px-2 py-4 dark:border-none sm:px-6 lg:col-span-3 lg:px-0 lg:py-0 ">
        <nav className="space-y-1 divide-y-4 divide-slate-400/25">
          {navigation.map((item) => (
            <a
              key={item.name}
              onClick={() => setCurrentSection(item.name)}
              className={classNames(
                item.error ? "text-red-600" : " text-black dark:text-white",
                item.current
                  ? "bg-gradient-to-r from-sky-500 to-emerald-600 "
                  : "hover:bg-gray-100 hover:text-black  dark:hover:bg-gray-700 dark:hover:text-white",
                "group flex cursor-pointer items-center rounded-md px-2 py-3 text-sm font-medium",
              )}
              aria-current={item.current ? "page" : undefined}
            >
              <item.icon
                className={classNames(
                  item.current
                    ? "text-gray-600 dark:text-white"
                    : "text-gray-400 group-hover:text-gray-300",
                  "mr-4 h-6 w-6 flex-shrink-0",
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>
      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        {currentSection === "Seo General" ? (
          <SeoGeneral
            control={control}
            getError={getError}
            register={register}
          />
        ) : currentSection === "Open Graph Basic" ? (
          <OpenGraphBasic
            getError={getError}
            register={register}
            imageOpError={imageOpError}
            sizeOp={sizeOp}
            baseOpImage={baseOpImage}
            setBaseOpImage={setBaseOpImage}
            imageOpRef={imageOpRef}
            setFileName={setFileName}
            setAltImage={setAltImage}
            altImage={altImage}
          />
        ) : currentSection === "Open Graph Optional" ? (
          <OpenGraphOptional getError={getError} register={register} />
        ) : currentSection === "Open Graph Image" ? (
          <OpenGraphImage getError={getError} register={register} />
        ) : currentSection === "Open Graph Article" ? (
          <OpenGraphArticle
            getError={getError}
            register={register}
            control={control}
          />
        ) : (
          <Twitter getError={getError} register={register} />
        )}
      </div>
    </div>
  );
};
