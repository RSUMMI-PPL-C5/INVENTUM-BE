-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_divisiId_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `divisiId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_divisiId_fkey` FOREIGN KEY (`divisiId`) REFERENCES `ListDivisi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
