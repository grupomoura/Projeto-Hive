/*
  Warnings:

  - Added the required column `instagramUserId` to the `InstagramToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstagramToken" ADD COLUMN     "instagramUserId" TEXT NOT NULL,
ADD COLUMN     "pageId" TEXT;

-- AddForeignKey
ALTER TABLE "InstagramToken" ADD CONSTRAINT "InstagramToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
