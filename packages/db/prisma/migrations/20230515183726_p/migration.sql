-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productPackage" TEXT;

-- CreateTable
CREATE TABLE "ProductPackage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageId" TEXT,

    CONSTRAINT "ProductPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPackage_slug_key" ON "ProductPackage"("slug");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productPackage_fkey" FOREIGN KEY ("productPackage") REFERENCES "ProductPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPackage" ADD CONSTRAINT "ProductPackage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
