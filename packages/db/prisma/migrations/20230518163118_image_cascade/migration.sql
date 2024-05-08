-- DropForeignKey
ALTER TABLE "ProductPackage" DROP CONSTRAINT "ProductPackage_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Seo" DROP CONSTRAINT "Seo_openGraphBasicImageId_fkey";

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_openGraphBasicImageId_fkey" FOREIGN KEY ("openGraphBasicImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPackage" ADD CONSTRAINT "ProductPackage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
