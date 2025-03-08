/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_userId_fkey`;

-- DropForeignKey
ALTER TABLE `notifikasi` DROP FOREIGN KEY `Notifikasi_userId_fkey`;

-- DropIndex
DROP INDEX `Notifikasi_userId_fkey` ON `notifikasi`;

-- DropTable
DROP TABLE `admin`;
