-- AlterTable
ALTER TABLE "ProductPackage" ADD COLUMN     "shortDescription" TEXT,
ALTER COLUMN "description" DROP NOT NULL;
