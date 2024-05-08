-- CreateTable
CREATE TABLE "ProductParts" (
    "productId" TEXT NOT NULL,
    "partsId" TEXT NOT NULL,

    CONSTRAINT "ProductParts_pkey" PRIMARY KEY ("productId","partsId")
);

-- AddForeignKey
ALTER TABLE "ProductParts" ADD CONSTRAINT "ProductParts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductParts" ADD CONSTRAINT "ProductParts_partsId_fkey" FOREIGN KEY ("partsId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
