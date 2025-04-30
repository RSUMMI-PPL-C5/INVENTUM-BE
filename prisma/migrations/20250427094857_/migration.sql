/*
  Warnings:

  - You are about to drop the `EquipmentSpareparts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartsManagement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EquipmentSpareparts` DROP FOREIGN KEY `EquipmentSpareparts_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `EquipmentSpareparts` DROP FOREIGN KEY `EquipmentSpareparts_sparepartId_fkey`;

-- DropForeignKey
ALTER TABLE `PartsManagement` DROP FOREIGN KEY `PartsManagement_sparepartId_fkey`;

-- DropTable
DROP TABLE `EquipmentSpareparts`;

-- DropTable
DROP TABLE `PartsManagement`;

-- CreateTable
CREATE TABLE `PartsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `equipmentId` VARCHAR(191) NOT NULL,
    `sparepartId` VARCHAR(191) NOT NULL,
    `actionPerformed` TEXT NOT NULL,
    `technician` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NOT NULL,
    `replacementDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PartsHistory_id_key`(`id`),
    INDEX `PartsHistory_equipmentId_idx`(`equipmentId`),
    INDEX `PartsHistory_sparepartId_idx`(`sparepartId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartsHistory` ADD CONSTRAINT `PartsHistory_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartsHistory` ADD CONSTRAINT `PartsHistory_sparepartId_fkey` FOREIGN KEY (`sparepartId`) REFERENCES `Spareparts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
