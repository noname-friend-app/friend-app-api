/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `GroupMember` table. All the data in the column will be lost.
  - Added the required column `role` to the `GroupMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Group_name_key";

-- AlterTable
ALTER TABLE "GroupMember" DROP COLUMN "isAdmin",
ADD COLUMN     "role" TEXT NOT NULL;
