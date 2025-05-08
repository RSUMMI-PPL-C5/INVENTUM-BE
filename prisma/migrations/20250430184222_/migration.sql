/*
  Warnings:

  - You are about to drop the column `submissionDate` on the `request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Request` DROP COLUMN `submissionDate`,
    MODIFY `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
