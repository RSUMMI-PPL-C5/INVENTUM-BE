/*
  Warnings:

  - You are about to drop the column `equipmentId` on the `PartsHistory` table. All the data in the column will be lost.
  - Added the required column `medicalEquipmentId` to the `PartsHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PartsHistory` DROP FOREIGN KEY `PartsHistory_equipmentId_fkey`;

-- DropIndex
DROP INDEX `PartsHistory_equipmentId_idx` ON `PartsHistory`;

-- AlterTable
ALTER TABLE `PartsHistory` DROP COLUMN `equipmentId`,
    ADD COLUMN `medicalEquipmentId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `PartsHistory_medicalEquipmentId_idx` ON `PartsHistory`(`medicalEquipmentId`);

-- AddForeignKey
ALTER TABLE `PartsHistory` ADD CONSTRAINT `PartsHistory_medicalEquipmentId_fkey` FOREIGN KEY (`medicalEquipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
