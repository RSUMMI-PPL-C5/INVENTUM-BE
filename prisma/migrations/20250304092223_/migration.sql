/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Admin` DROP FOREIGN KEY `Admin_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Notifikasi` DROP FOREIGN KEY `Notifikasi_userId_fkey`;

-- DropIndex
DROP INDEX `Notifikasi_userId_fkey` ON `Notifikasi`;

-- DropTable
DROP TABLE `Admin`;