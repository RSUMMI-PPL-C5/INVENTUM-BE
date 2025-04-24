/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `MedicalEquipment` MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Request` ADD COLUMN `requestType` ENUM('MAINTENANCE', 'CALIBRATION') NOT NULL DEFAULT 'MAINTENANCE',
    MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Spareparts` MODIFY `createdBy` VARCHAR(191) NOT NULL,
    MODIFY `modifiedBy` VARCHAR(191) NULL,
    MODIFY `deletedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `createdOn` DROP DEFAULT,
    MODIFY `modifiedOn` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifiedAt` DATETIME(3) NOT NULL,

    INDEX `Komentar_userId_fkey`(`userId`),
    INDEX `Komentar_requestId_fkey`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Request_id_key` ON `Request`(`id`);

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
