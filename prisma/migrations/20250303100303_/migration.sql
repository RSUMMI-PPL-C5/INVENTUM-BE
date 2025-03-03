-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `fullname` VARCHAR(191) NULL,
    `nokar` VARCHAR(191) NOT NULL DEFAULT '',
    `divisiId` INTEGER NULL,
    `waNumber` VARCHAR(191) NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedBy` INTEGER NULL,
    `deletedOn` DATETIME(3) NULL,

    UNIQUE INDEX `User_id_key`(`id`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ListDivisi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `divisi` VARCHAR(191) NULL,
    `parentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `privileges` VARCHAR(191) NULL,

    UNIQUE INDEX `Admin_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MedicalEquipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventorisId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NULL,
    `modelName` VARCHAR(191) NULL,
    `purchaseDate` DATETIME(3) NULL,
    `purchasePrice` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `vendor` VARCHAR(191) NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedBy` INTEGER NULL,
    `deletedOn` DATETIME(3) NULL,

    UNIQUE INDEX `MedicalEquipment_inventorisId_key`(`inventorisId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RelocationHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medicalEquipmentId` INTEGER NOT NULL,
    `initLocation` VARCHAR(191) NOT NULL,
    `currentLocation` VARCHAR(191) NOT NULL,
    `requestDate` VARCHAR(191) NOT NULL,
    `shiftReason` VARCHAR(191) NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Spareparts` (
    `id` VARCHAR(191) NOT NULL,
    `partsName` VARCHAR(191) NOT NULL,
    `purchaseDate` DATETIME(3) NULL,
    `price` INTEGER NULL,
    `toolLocation` VARCHAR(191) NULL,
    `toolDate` VARCHAR(191) NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedBy` INTEGER NULL,
    `deletedOn` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartsManagement` (
    `id` VARCHAR(191) NOT NULL,
    `sparepartId` VARCHAR(191) NOT NULL,
    `replacementComponent` VARCHAR(191) NOT NULL,
    `replacementDate` DATETIME(3) NOT NULL,
    `availabilityCost` INTEGER NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EquipmentSpareparts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `equipmentId` INTEGER NOT NULL,
    `sparepartId` VARCHAR(191) NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,

    UNIQUE INDEX `EquipmentSpareparts_equipmentId_sparepartId_key`(`equipmentId`, `sparepartId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Request` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `medicalEquipment` VARCHAR(191) NOT NULL,
    `complaint` VARCHAR(191) NULL,
    `submissionDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `createdBy` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NULL,
    `modifiedBy` INTEGER NULL,
    `modifiedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifikasi` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `requestId` VARCHAR(191) NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_divisiId_fkey` FOREIGN KEY (`divisiId`) REFERENCES `ListDivisi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListDivisi` ADD CONSTRAINT `ListDivisi_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ListDivisi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RelocationHistory` ADD CONSTRAINT `RelocationHistory_medicalEquipmentId_fkey` FOREIGN KEY (`medicalEquipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartsManagement` ADD CONSTRAINT `PartsManagement_sparepartId_fkey` FOREIGN KEY (`sparepartId`) REFERENCES `Spareparts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentSpareparts` ADD CONSTRAINT `EquipmentSpareparts_equipmentId_fkey` FOREIGN KEY (`equipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EquipmentSpareparts` ADD CONSTRAINT `EquipmentSpareparts_sparepartId_fkey` FOREIGN KEY (`sparepartId`) REFERENCES `Spareparts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
