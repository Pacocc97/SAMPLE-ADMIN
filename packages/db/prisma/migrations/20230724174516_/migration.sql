/*
  Warnings:

  - A unique constraint covering the columns `[quotationId]` on the table `Pdf` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "quotationId" TEXT;

-- AlterTable
ALTER TABLE "Pdf" ADD COLUMN     "quotationId" TEXT;

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "discount" INTEGER,
    "totalPrice" INTEGER,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_id_key" ON "Quotation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pdf_quotationId_key" ON "Pdf"("quotationId");

-- AddForeignKey
ALTER TABLE "Pdf" ADD CONSTRAINT "Pdf_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
