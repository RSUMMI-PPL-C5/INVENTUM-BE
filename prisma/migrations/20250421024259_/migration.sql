-- AlterTable
ALTER TABLE `medicalequipment` MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `spareparts` MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ALTER COLUMN `createdOn` DROP DEFAULT,
    MODIFY `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
