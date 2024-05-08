/*
  Warnings:

  - You are about to drop the column `canonical` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `charset` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionMeta` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `nofollow` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `noindex` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticleAuthor` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticleExpirationTime` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticleModifiedTime` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticlePublishedTime` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticleSection` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphArticleTags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphBasicImageId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphBasicTitle` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphBasicType` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphBasicUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageAlt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageHeight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageSecureUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageType` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphImageWidth` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalAudio` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalDescription` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalDeterminer` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalLocale` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalLocaleAlternate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalSiteName` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `openGraphOptionalVideo` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `twitterCard` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `twitterCreator` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `twitterSite` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_openGraphBasicImageId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "canonical",
DROP COLUMN "charset",
DROP COLUMN "descriptionMeta",
DROP COLUMN "nofollow",
DROP COLUMN "noindex",
DROP COLUMN "openGraphArticleAuthor",
DROP COLUMN "openGraphArticleExpirationTime",
DROP COLUMN "openGraphArticleModifiedTime",
DROP COLUMN "openGraphArticlePublishedTime",
DROP COLUMN "openGraphArticleSection",
DROP COLUMN "openGraphArticleTags",
DROP COLUMN "openGraphBasicImageId",
DROP COLUMN "openGraphBasicTitle",
DROP COLUMN "openGraphBasicType",
DROP COLUMN "openGraphBasicUrl",
DROP COLUMN "openGraphImageAlt",
DROP COLUMN "openGraphImageHeight",
DROP COLUMN "openGraphImageSecureUrl",
DROP COLUMN "openGraphImageType",
DROP COLUMN "openGraphImageUrl",
DROP COLUMN "openGraphImageWidth",
DROP COLUMN "openGraphOptionalAudio",
DROP COLUMN "openGraphOptionalDescription",
DROP COLUMN "openGraphOptionalDeterminer",
DROP COLUMN "openGraphOptionalLocale",
DROP COLUMN "openGraphOptionalLocaleAlternate",
DROP COLUMN "openGraphOptionalSiteName",
DROP COLUMN "openGraphOptionalVideo",
DROP COLUMN "title",
DROP COLUMN "twitterCard",
DROP COLUMN "twitterCreator",
DROP COLUMN "twitterSite",
ADD COLUMN     "seoId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seoId_fkey" FOREIGN KEY ("seoId") REFERENCES "Seo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
