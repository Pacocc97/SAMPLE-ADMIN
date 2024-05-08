/*
  Warnings:

  - A unique constraint covering the columns `[original]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Image_original_key" ON "Image"("original");
