/*
  Warnings:

  - You are about to drop the column `calibrationResults` on the `CalibrationHistory` table. All the data in the column will be lost.
  - You are about to drop the column `partsReplaced` on the `MaintenanceHistory` table. All the data in the column will be lost.
  - Added the required column `actionPerformed` to the `CalibrationHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `result` to the `CalibrationHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CalibrationHistory` DROP COLUMN `calibrationResults`,
    ADD COLUMN `actionPerformed` TEXT NOT NULL,
    ADD COLUMN `result` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MaintenanceHistory` DROP COLUMN `partsReplaced`;
