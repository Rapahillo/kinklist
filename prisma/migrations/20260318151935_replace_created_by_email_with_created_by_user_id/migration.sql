/*
  Warnings:

  - You are about to drop the column `createdByEmail` on the `TodoItem` table. All the data in the column will be lost.
  - Added the required column `createdByUserId` to the `TodoItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TodoItem" DROP COLUMN "createdByEmail",
ADD COLUMN     "createdByUserId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "TodoItem" ADD CONSTRAINT "TodoItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
