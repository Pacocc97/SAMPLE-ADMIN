-- DropForeignKey
ALTER TABLE "Seo" DROP CONSTRAINT "Seo_packageId_fkey";

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ProductPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
