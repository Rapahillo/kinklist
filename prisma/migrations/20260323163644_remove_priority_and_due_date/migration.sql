/*
  Warnings:

  - You are about to drop the column `dueDate` on the `TodoItem` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `TodoItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodoItem" DROP COLUMN "dueDate",
DROP COLUMN "priority";

-- DropEnum
DROP TYPE "TodoItemPriority";
