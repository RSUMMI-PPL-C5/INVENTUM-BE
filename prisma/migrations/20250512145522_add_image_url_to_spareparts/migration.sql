/*
  Warnings:

  - Made the column `modifiedOn` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Spareparts` ADD COLUMN `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
