/*
  Warnings:

  - Added the required column `shippingAddress` to the `OrderProduct` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderProduct" ADD COLUMN     "shippingAddress" JSONB NOT NULL;
