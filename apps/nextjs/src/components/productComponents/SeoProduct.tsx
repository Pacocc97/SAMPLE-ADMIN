import type { Image, Seo } from "@prisma/client";

import { env } from "~/env.mjs";

interface ValueModel {
  value: (Seo & { openGraphBasicImage: Image }) | null | undefined;
}

const SeoGeneral = ({ value }: ValueModel) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Title{" "}
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.title ? value?.title : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Description
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.descriptionMeta ? value?.descriptionMeta : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Canonical
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.canonical ? value?.canonical : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Charset
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.charset ? value?.charset : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Noindex
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.noindex === true ? "Activado" : "Desactivado"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            Nofollow
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.nofollow === true ? "Activado" : "Desactivado"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default SeoGeneral;

export const OGBasic = ({ value }: ValueModel) => {
  const imagenOP = value && value.openGraphBasicImage;
  const imageSrc =
    imagenOP &&
    `${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${imagenOP.path}/${imagenOP.original}`;
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:title
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphBasicTitle
              ? value?.openGraphBasicTitle
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:type
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphBasicType
              ? value?.openGraphBasicType
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image
          </dt>
          <dd className="mt-1 break-all text-sm text-gray-900 dark:text-gray-200">
            {imageSrc ? (
              <a target="_blank" href={imageSrc} rel="noreferrer">
                Ver imagen
              </a>
            ) : (
              "Sin definir"
            )}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:url
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphBasicUrl
              ? value?.openGraphBasicUrl
              : "Sin definir"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export const OGOptional = ({ value }: ValueModel) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:audio
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalAudio
              ? value?.openGraphOptionalAudio
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:description
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalDescription
              ? value?.openGraphOptionalDescription
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:determiner
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalDeterminer
              ? value?.openGraphOptionalDeterminer
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:locale
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalLocale
              ? value?.openGraphOptionalLocale
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:local:alternate
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalLocaleAlternate
              ? value?.openGraphOptionalLocaleAlternate
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:site_name
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalSiteName
              ? value?.openGraphOptionalSiteName
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:video
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphOptionalVideo
              ? value?.openGraphOptionalVideo
              : "Sin definir"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export const OGImage = ({ value }: ValueModel) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:url
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageUrl
              ? value?.openGraphImageUrl
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:secure_url
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageSecureUrl
              ? value?.openGraphImageSecureUrl
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:width
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageWidth
              ? value?.openGraphImageWidth
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:height
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageHeight
              ? value?.openGraphImageHeight
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:type
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageType
              ? value?.openGraphImageType
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            og:image:alt
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphImageAlt
              ? value?.openGraphImageAlt
              : "Sin definir"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export const OGArticle = ({ value }: ValueModel) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            article:author
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphArticleAuthor
              ? value?.openGraphArticleAuthor
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            article:section
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphArticleSection
              ? value?.openGraphArticleSection
              : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            article:tag
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.openGraphArticleTags
              ? value?.openGraphArticleTags
              : "Sin definir"}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export const SeoTwitter = ({ value }: ValueModel) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            twitter:card
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.twitterCard ? value?.twitterCard : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            twitter:site
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.twitterSite ? value?.twitterSite : "Sin definir"}
          </dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-black dark:text-white">
            twitter:creator
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
            {value?.twitterCreator ? value?.twitterCreator : "Sin definir"}
          </dd>
        </div>
      </dl>
    </div>
  );
};
