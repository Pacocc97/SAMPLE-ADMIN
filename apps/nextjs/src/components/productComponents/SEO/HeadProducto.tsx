/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Head from "next/head";
import type { Image, Product, Seo } from "@prisma/client";

import { env } from "~/env.mjs";

type Props = Seo & {
  openGraphBasicImage?: Image;
};

export const HeadProduct = (seo: Props) => {
  const {
    descriptionMeta,
    title,
    noindex,
    nofollow,
    charset,
    openGraphBasicTitle,
    openGraphBasicType,
    openGraphBasicUrl,
    openGraphOptionalAudio,
    openGraphOptionalDescription,
    openGraphOptionalDeterminer,
    openGraphOptionalLocale,
    openGraphOptionalLocaleAlternate,
    openGraphOptionalSiteName,
    openGraphOptionalVideo,
    openGraphImageUrl,
    openGraphImageSecureUrl,
    openGraphImageType,
    openGraphImageWidth,
    openGraphImageHeight,
    openGraphImageAlt,
    openGraphArticleAuthor,
    openGraphArticleSection,
    openGraphArticleTags,
    twitterCard,
    twitterSite,
    twitterCreator,
  } = seo;

  return (
    <Head>
      <title>{title} | ICB</title>
      {descriptionMeta && (
        <meta name="description" content={`${descriptionMeta}`} key="desc" />
      )}
      {noindex === true && nofollow === false ? (
        <meta name="robots" content="noindex" />
      ) : (
        ""
      )}
      {nofollow === true && noindex === false ? (
        <meta name="robots" content="nofollow" />
      ) : (
        ""
      )}
      {nofollow === true && noindex === true ? (
        <meta name="robots" content="none" />
      ) : (
        ""
      )}
      {charset && <meta charSet={`${charset}`} />}

      {/* OpenGraph Basic */}

      {openGraphBasicTitle && (
        <meta property="og:title" content={`${openGraphBasicTitle}`} />
      )}
      {openGraphBasicType && (
        <meta property="og:type" content={`${openGraphBasicType}`} />
      )}
      <meta
        property="og:image"
        content={`${env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL}/${seo?.openGraphBasicImage?.path}/${seo?.openGraphBasicImage?.original}`}
      />
      {openGraphBasicUrl && (
        <meta property="og:url" content={`${openGraphBasicUrl}`} />
      )}

      {/* OpenGraph Optional */}

      {openGraphOptionalAudio && (
        <meta property="og:audio" content={`${openGraphOptionalAudio}`} />
      )}
      {openGraphOptionalDescription && (
        <meta
          property="og:description"
          content={`${openGraphOptionalDescription}`}
        />
      )}
      {openGraphOptionalDeterminer && (
        <meta
          property="og:determiner"
          content={`${openGraphOptionalDeterminer}`}
        />
      )}
      {openGraphOptionalLocale && (
        <meta property="og:locale" content={`${openGraphOptionalLocale}`} />
      )}
      {openGraphOptionalLocaleAlternate && (
        <meta
          property="og:locale:alternate"
          content={`${openGraphOptionalLocaleAlternate}`}
        />
      )}
      {openGraphOptionalLocaleAlternate && (
        <meta
          property="og:locale:alternate"
          content={`${openGraphOptionalLocaleAlternate}`}
        />
      )}
      {openGraphOptionalSiteName && (
        <meta
          property="og:site_name"
          content={`${openGraphOptionalSiteName}`}
        />
      )}
      {openGraphOptionalVideo && (
        <meta property="og:video" content={`${openGraphOptionalVideo}`} />
      )}

      {/* OpenGraph Image */}

      {openGraphImageUrl && (
        <meta property="og:image" content={`${openGraphImageUrl}`} />
      )}
      {openGraphImageSecureUrl && (
        <meta
          property="og:image:secure_url"
          content={`${openGraphImageSecureUrl}`}
        />
      )}
      {openGraphImageType && (
        <meta property="og:image:type" content={`${openGraphImageType}`} />
      )}
      {openGraphImageWidth && (
        <meta property="og:image:width" content={`${openGraphImageWidth}`} />
      )}
      {openGraphImageHeight && (
        <meta property="og:image:height" content={`${openGraphImageHeight}`} />
      )}
      {openGraphImageAlt && (
        <meta property="og:image:alt" content={`${openGraphImageAlt}`} />
      )}

      {/* OpenGraph Article */}

      {openGraphArticleAuthor && (
        <meta property="article:author" content={`${openGraphArticleAuthor}`} />
      )}
      {openGraphArticleSection && (
        <meta
          property="article:section"
          content={`${openGraphArticleSection}`}
        />
      )}
      {openGraphArticleTags &&
        openGraphArticleTags.map((tag, i: number) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}

      {/* Twitter */}

      {twitterCard && <meta name="twitter:card" content={`${twitterCard}`} />}
      {twitterSite && <meta name="twitter:site" content={`${twitterSite}`} />}
      {twitterCreator && (
        <meta name="twitter:creator" content={`${twitterCreator}`} />
      )}
    </Head>
  );
};
