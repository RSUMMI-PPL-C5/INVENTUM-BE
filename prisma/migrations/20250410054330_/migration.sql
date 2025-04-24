/*
  Warnings:

  - You are about to alter the column `modifiedBy` on the `Spareparts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `deletedBy` on the `Spareparts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Made the column `createdBy` on table `Spareparts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Spareparts` MODIFY `purchaseDate` DATETIME(3) NULL,
    MODIFY `price` INTEGER NULL,
    MODIFY `toolLocation` VARCHAR(191) NULL,
    MODIFY `toolDate` VARCHAR(191) NULL,
    MODIFY `createdBy` INTEGER NOT NULL,
    MODIFY `modifiedBy` INTEGER NULL,
    MODIFY `deletedBy` INTEGER NULL;
