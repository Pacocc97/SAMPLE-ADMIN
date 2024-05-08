/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Seo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Seo_id_key" ON "Seo"("id");
