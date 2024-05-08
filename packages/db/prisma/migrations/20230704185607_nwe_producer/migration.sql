/*
  Warnings:

  - You are about to drop the `_ProducerToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProducerToProduct" DROP CONSTRAINT "_ProducerToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProducerToProduct" DROP CONSTRAINT "_ProducerToProduct_B_fkey";

-- DropTable
DROP TABLE "_ProducerToProduct";

-- CreateTable
CREATE TABLE "ProducerOfProduct" (
    "producerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProducerOfProduct_pkey" PRIMARY KEY ("productId","producerId")
);

-- AddForeignKey
ALTER TABLE "ProducerOfProduct" ADD CONSTRAINT "ProducerOfProduct_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerOfProduct" ADD CONSTRAINT "ProducerOfProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
