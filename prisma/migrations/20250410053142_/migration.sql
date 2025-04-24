/*
  Warnings:

  - Made the column `purchaseDate` on table `Spareparts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Spareparts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toolLocation` on table `Spareparts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toolDate` on table `Spareparts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Spareparts` MODIFY `purchaseDate` DATETIME(3) NOT NULL,
    MODIFY `price` INTEGER NOT NULL,
    MODIFY `toolLocation` VARCHAR(191) NOT NULL,
    MODIFY `toolDate` VARCHAR(191) NOT NULL,
    MODIFY `createdBy` VARCHAR(191) NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;
