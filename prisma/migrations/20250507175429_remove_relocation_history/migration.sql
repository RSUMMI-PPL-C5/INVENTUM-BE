/*
  Warnings:

  - You are about to drop the `relocationhistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RelocationHistory` DROP FOREIGN KEY `RelocationHistory_medicalEquipmentId_fkey`;

-- DropTable
DROP TABLE `RelocationHistory`;
