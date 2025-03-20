/*
  Warnings:

  - The primary key for the `EquipmentSpareparts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MedicalEquipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RelocationHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `EquipmentSpareparts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `MedicalEquipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PartsManagement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `RelocationHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Spareparts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `EquipmentSpareparts` DROP FOREIGN KEY `EquipmentSpareparts_equipmentId_fkey`;

-- DropForeignKey
ALTER TABLE `RelocationHistory` DROP FOREIGN KEY `RelocationHistory_medicalEquipmentId_fkey`;

-- AlterTable
ALTER TABLE `EquipmentSpareparts` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `equipmentId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `MedicalEquipment` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `RelocationHistory` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `medicalEquipmentId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `EquipmentSpareparts_id_key` ON `EquipmentSpareparts`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `MedicalEquipment_id_key` ON `MedicalEquipment`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `PartsManagement_id_key` ON `PartsManagement`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `RelocationHistory_id_key` ON `RelocationHistory`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Spareparts_id_key` ON `Spareparts`(`id`);

-- AddForeignKey
ALTER TABLE `RelocationHistory` ADD CONSTRAINT `RelocationHistory_medicalEquipmentId_fkey` FOREIGN KEY (`medicalEquipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentSpareparts` ADD CONSTRAINT `EquipmentSpareparts_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
