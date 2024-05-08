/*
  Warnings:

  - You are about to drop the column `seoId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Seo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_seoId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "seoId";

-- AlterTable
ALTER TABLE "Seo" ADD COLUMN     "productId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Seo_productId_key" ON "Seo"("productId");

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
