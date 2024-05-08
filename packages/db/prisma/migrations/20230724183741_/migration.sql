/*
  Warnings:

  - You are about to drop the column `quotationId` on the `Pdf` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pdfId]` on the table `Quotation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Pdf" DROP CONSTRAINT "Pdf_quotationId_fkey";

-- DropIndex
DROP INDEX "Pdf_quotationId_key";

-- AlterTable
ALTER TABLE "Pdf" DROP COLUMN "quotationId";

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "pdfId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_pdfId_key" ON "Quotation"("pdfId");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "Pdf"("id") ON DELETE SET NULL ON UPDATE CASCADE;
