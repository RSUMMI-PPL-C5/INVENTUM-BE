/*
  Warnings:

  - You are about to drop the column `requestId` on the `calibrationhistory` table. All the data in the column will be lost.
  - You are about to drop the column `completedOn` on the `maintenancehistory` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `maintenancehistory` table. All the data in the column will be lost.
  - Added the required column `maintenanceDate` to the `MaintenanceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `calibrationhistory` DROP FOREIGN KEY `CalibrationHistory_requestId_fkey`;

-- DropForeignKey
ALTER TABLE `maintenancehistory` DROP FOREIGN KEY `MaintenanceHistory_requestId_fkey`;

-- DropIndex
DROP INDEX `CalibrationHistory_requestId_idx` ON `calibrationhistory`;

-- DropIndex
DROP INDEX `MaintenanceHistory_requestId_idx` ON `maintenancehistory`;

-- AlterTable
ALTER TABLE `calibrationhistory` DROP COLUMN `requestId`;

-- AlterTable
ALTER TABLE `maintenancehistory` DROP COLUMN `completedOn`,
    DROP COLUMN `requestId`,
    ADD COLUMN `maintenanceDate` DATETIME(3) NOT NULL;
