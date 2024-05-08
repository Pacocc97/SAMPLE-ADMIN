-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "OpenPayData" DROP CONSTRAINT "OpenPayData_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quotation" DROP CONSTRAINT "Quotation_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserComment" DROP CONSTRAINT "UserComment_commentedId_fkey";

-- DropForeignKey
ALTER TABLE "UserComment" DROP CONSTRAINT "UserComment_commentingId_fkey";

-- AddForeignKey
ALTER TABLE "UserComment" ADD CONSTRAINT "UserComment_commentingId_fkey" FOREIGN KEY ("commentingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserComment" ADD CONSTRAINT "UserComment_commentedId_fkey" FOREIGN KEY ("commentedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenPayData" ADD CONSTRAINT "OpenPayData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
