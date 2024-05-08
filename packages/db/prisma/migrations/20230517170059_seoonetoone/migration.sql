/*
  Warnings:

  - You are about to drop the column `seoId` on the `ProductPackage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[packageId]` on the table `Seo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductPackage" DROP CONSTRAINT "ProductPackage_seoId_fkey";

-- AlterTable
ALTER TABLE "ProductPackage" DROP COLUMN "seoId";

-- AlterTable
ALTER TABLE "Seo" ADD COLUMN     "packageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Seo_packageId_key" ON "Seo"("packageId");

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ProductPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
