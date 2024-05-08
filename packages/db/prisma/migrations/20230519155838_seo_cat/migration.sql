/*
  Warnings:

  - A unique constraint covering the columns `[categoryId]` on the table `Seo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Seo" ADD COLUMN     "categoryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Seo_categoryId_key" ON "Seo"("categoryId");

-- AddForeignKey
ALTER TABLE "Seo" ADD CONSTRAINT "Seo_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
