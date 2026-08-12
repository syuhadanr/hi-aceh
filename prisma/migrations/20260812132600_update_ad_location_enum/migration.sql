-- AlterTable
ALTER TABLE `ads` ADD COLUMN `ratio` VARCHAR(191) NULL DEFAULT '1:1',
    ADD COLUMN `scriptCode` LONGTEXT NULL,
    ADD COLUMN `type` ENUM('IMAGE_BANNER', 'CUSTOM_SCRIPT') NOT NULL DEFAULT 'IMAGE_BANNER',
    MODIFY `location` ENUM('HEADER_BETWEEN', 'MAIN_BELOW_HEADLINE', 'POPULAR_BELOW', 'FEED_ASIDE_TOP', 'FEED_ASIDE_MID', 'FEED_ASIDE_BOTTOM', 'FEED_AFTER_SELESAI', 'FEED_INLINE_1', 'FEED_INLINE_2', 'ARTICLE_ABOVE_TITLE', 'ARTICLE_BELOW_IMAGE', 'ARTICLE_IN_CONTENT', 'ARTICLE_END', 'SIDEBAR', 'MOBILE_HEADER', 'MOBILE_FEED_1', 'MOBILE_FEED_2', 'MOBILE_FEED_AFTER', 'MOBILE_ARTICLE_ABOVE', 'MOBILE_ARTICLE_MIDDLE', 'MOBILE_ARTICLE_END') NOT NULL,
    MODIFY `imageUrl` TEXT NULL,
    MODIFY `linkUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `articles` ADD COLUMN `editorId` VARCHAR(191) NULL,
    ADD COLUMN `sumberName` VARCHAR(191) NULL,
    ADD COLUMN `sumberUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_userId_idx`(`userId`),
    INDEX `activity_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comments_articleId_idx`(`articleId`),
    INDEX `comments_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `articles_editorId_idx` ON `articles`(`editorId`);

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_editorId_fkey` FOREIGN KEY (`editorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
