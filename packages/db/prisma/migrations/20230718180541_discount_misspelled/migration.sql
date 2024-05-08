/*
  Warnings:

  - You are about to drop the column `discont` on the `OpenPayData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OpenPayData" DROP COLUMN "discont",
ADD COLUMN     "discount" INTEGER;
