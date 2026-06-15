-- AlterTable
ALTER TABLE `categories` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
