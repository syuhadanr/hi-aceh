-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'PENULIS') NOT NULL DEFAULT 'PENULIS',
    `bio` TEXT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `type` ENUM('TEKS', 'FOTO', 'VIDEO') NOT NULL DEFAULT 'TEKS',
    `videoUrl` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT',
    `isBreaking` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `featuredImageId` VARCHAR(191) NULL,

    UNIQUE INDEX `articles_slug_key`(`slug`),
    INDEX `articles_authorId_idx`(`authorId`),
    INDEX `articles_categoryId_idx`(`categoryId`),
    INDEX `articles_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `location` ENUM('HEADER_BANNER', 'SIDEBAR', 'IN_ARTICLE', 'POPUP') NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `linkUrl` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `impressions` INTEGER NOT NULL DEFAULT 0,
    `clicks` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_views` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `ipHash` VARCHAR(191) NOT NULL,
    `userAgent` TEXT NULL,
    `referrer` TEXT NULL,
    `viewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_views_articleId_idx`(`articleId`),
    INDEX `page_views_viewedAt_idx`(`viewedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ArticleTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ArticleTags_AB_unique`(`A`, `B`),
    INDEX `_ArticleTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_featuredImageId_fkey` FOREIGN KEY (`featuredImageId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_views` ADD CONSTRAINT `page_views_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleTags` ADD CONSTRAINT `_ArticleTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleTags` ADD CONSTRAINT `_ArticleTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
