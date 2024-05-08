/*
  Warnings:

  - Added the required column `price` to the `ProductPackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductPackage" ADD COLUMN     "price" TEXT NOT NULL;
