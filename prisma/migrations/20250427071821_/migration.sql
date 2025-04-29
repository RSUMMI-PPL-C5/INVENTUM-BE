-- CreateTable
CREATE TABLE `MaintenanceHistory` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `medicalEquipmentId` VARCHAR(191) NOT NULL,
    `actionPerformed` TEXT NOT NULL,
    `technician` VARCHAR(191) NOT NULL,
    `partsReplaced` TEXT NULL,
    `result` VARCHAR(191) NOT NULL,
    `completedOn` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `MaintenanceHistory_id_key`(`id`),
    INDEX `MaintenanceHistory_requestId_idx`(`requestId`),
    INDEX `MaintenanceHistory_medicalEquipmentId_idx`(`medicalEquipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CalibrationHistory` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `medicalEquipmentId` VARCHAR(191) NOT NULL,
    `calibrationMethod` VARCHAR(191) NOT NULL,
    `calibrationResults` TEXT NOT NULL,
    `technician` VARCHAR(191) NOT NULL,
    `calibrationDate` DATETIME(3) NOT NULL,
    `nextCalibrationDue` DATETIME(3) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CalibrationHistory_id_key`(`id`),
    INDEX `CalibrationHistory_requestId_idx`(`requestId`),
    INDEX `CalibrationHistory_medicalEquipmentId_idx`(`medicalEquipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaintenanceHistory` ADD CONSTRAINT `MaintenanceHistory_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceHistory` ADD CONSTRAINT `MaintenanceHistory_medicalEquipmentId_fkey` FOREIGN KEY (`medicalEquipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalibrationHistory` ADD CONSTRAINT `CalibrationHistory_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalibrationHistory` ADD CONSTRAINT `CalibrationHistory_medicalEquipmentId_fkey` FOREIGN KEY (`medicalEquipmentId`) REFERENCES `MedicalEquipment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
