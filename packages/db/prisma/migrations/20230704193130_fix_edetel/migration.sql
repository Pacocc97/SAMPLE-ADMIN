-- DropForeignKey
ALTER TABLE "ProducerOfProduct" DROP CONSTRAINT "ProducerOfProduct_producerId_fkey";

-- DropForeignKey
ALTER TABLE "ProducerOfProduct" DROP CONSTRAINT "ProducerOfProduct_productId_fkey";

-- AddForeignKey
ALTER TABLE "ProducerOfProduct" ADD CONSTRAINT "ProducerOfProduct_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerOfProduct" ADD CONSTRAINT "ProducerOfProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
