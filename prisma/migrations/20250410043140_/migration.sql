/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fullname` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `divisiId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `waNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_divisiId_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `role` VARCHAR(191) NOT NULL,
    MODIFY `fullname` VARCHAR(191) NOT NULL,
    MODIFY `divisiId` INTEGER NOT NULL,
    MODIFY `waNumber` VARCHAR(191) NOT NULL,
    MODIFY `createdBy` VARCHAR(191) NULL,
    MODIFY `createdOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `modifiedOn` DATETIME(3) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_divisiId_fkey` FOREIGN KEY (`divisiId`) REFERENCES `ListDivisi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
