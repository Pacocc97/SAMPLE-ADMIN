-- CreateTable
CREATE TABLE "Seo" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "descriptionMeta" TEXT,
    "canonical" TEXT,
    "noindex" BOOLEAN,
    "nofollow" BOOLEAN,
    "charset" TEXT,
    "openGraphBasicTitle" TEXT,
    "openGraphBasicType" TEXT,
    "openGraphBasicImageId" TEXT,
    "openGraphBasicUrl" TEXT,
    "openGraphOptionalAudio" TEXT,
    "openGraphOptionalDescription" TEXT,
    "openGraphOptionalDeterminer" TEXT,
    "openGraphOptionalLocale" TEXT,
    "openGraphOptionalLocaleAlternate" TEXT,
    "openGraphOptionalSiteName" TEXT,
    "openGraphOptionalVideo" TEXT,
    "openGraphImageUrl" TEXT,
    "openGraphImageSecureUrl" TEXT,
    "openGraphImageType" TEXT,
    "openGraphImageWidth" INTEGER,
    "openGraphImageHeight" INTEGER,
    "openGraphImageAlt" TEXT,
    "openGraphArticleAuthor" TEXT,
    "openGraphArticleSection" TEXT,
    "openGraphArticleTags" TEXT[],
    "twitterCard" TEXT,
    "twitterSite" TEXT,
    "twitterCreator" TEXT,
    "openGraphArticlePublishedTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "openGraphArticleModifiedTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "openGraphArticleExpirationTime" TIMESTAMP(3),

    CONSTRAINT "Seo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_openGraphBasicImageId_fkey" FOREIGN KEY ("openGraphBasicImageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
