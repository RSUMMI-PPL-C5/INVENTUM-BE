/*
  Warnings:

  - You are about to drop the column `requestId` on the `CalibrationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `completedOn` on the `MaintenanceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `MaintenanceHistory` table. All the data in the column will be lost.
  - Added the required column `maintenanceDate` to the `MaintenanceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CalibrationHistory` DROP FOREIGN KEY `CalibrationHistory_requestId_fkey`;

-- DropForeignKey
ALTER TABLE `MaintenanceHistory` DROP FOREIGN KEY `MaintenanceHistory_requestId_fkey`;

-- DropIndex
DROP INDEX `CalibrationHistory_requestId_idx` ON `CalibrationHistory`;

-- DropIndex
DROP INDEX `MaintenanceHistory_requestId_idx` ON `MaintenanceHistory`;

-- AlterTable
ALTER TABLE `CalibrationHistory` DROP COLUMN `requestId`;

-- AlterTable
ALTER TABLE `MaintenanceHistory` DROP COLUMN `completedOn`,
    DROP COLUMN `requestId`,
    ADD COLUMN `maintenanceDate` DATETIME(3) NOT NULL;
