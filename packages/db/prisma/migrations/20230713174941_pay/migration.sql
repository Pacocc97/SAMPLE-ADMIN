-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_openPayId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "openPayId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_openPayId_fkey" FOREIGN KEY ("openPayId") REFERENCES "OpenPayData"("id") ON DELETE SET NULL ON UPDATE CASCADE;
