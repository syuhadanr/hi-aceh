-- 1. Modify ads location and make columns nullable
ALTER TABLE `ads` MODIFY `location` ENUM('HEADER_BETWEEN', 'MAIN_BELOW_HEADLINE', 'POPULAR_BELOW', 'FEED_ASIDE_TOP', 'FEED_ASIDE_MID', 'FEED_ASIDE_BOTTOM', 'FEED_AFTER_SELESAI', 'FEED_INLINE_1', 'FEED_INLINE_2', 'ARTICLE_ABOVE_TITLE', 'ARTICLE_BELOW_IMAGE', 'ARTICLE_IN_CONTENT', 'ARTICLE_END', 'SIDEBAR', 'MOBILE_HEADER', 'MOBILE_FEED_1', 'MOBILE_FEED_2', 'MOBILE_FEED_AFTER', 'MOBILE_ARTICLE_ABOVE', 'MOBILE_ARTICLE_MIDDLE', 'MOBILE_ARTICLE_END') NOT NULL;

ALTER TABLE `ads` MODIFY `imageUrl` TEXT NULL;
ALTER TABLE `ads` MODIFY `linkUrl` TEXT NULL;

-- 2. Conditionally add columns to ads
SET @dbname = DATABASE();

-- scriptCode
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'ads' AND COLUMN_NAME = 'scriptCode') > 0,
  'SELECT 1',
  'ALTER TABLE ads ADD COLUMN scriptCode LONGTEXT NULL'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- type
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'ads' AND COLUMN_NAME = 'type') > 0,
  'SELECT 1',
  'ALTER TABLE ads ADD COLUMN type ENUM(\'IMAGE_BANNER\', \'CUSTOM_SCRIPT\') NOT NULL DEFAULT \'IMAGE_BANNER\''
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Conditionally add columns to articles
-- editorId
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'editorId') > 0,
  'SELECT 1',
  'ALTER TABLE articles ADD COLUMN editorId VARCHAR(191) NULL'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- sumberName
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'sumberName') > 0,
  'SELECT 1',
  'ALTER TABLE articles ADD COLUMN sumberName VARCHAR(191) NULL'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- sumberUrl
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'articles' AND COLUMN_NAME = 'sumberUrl') > 0,
  'SELECT 1',
  'ALTER TABLE articles ADD COLUMN sumberUrl VARCHAR(191) NULL'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Create tables if they do not exist
CREATE TABLE IF NOT EXISTS `activity_logs` (
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

CREATE TABLE IF NOT EXISTS `comments` (
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

-- 5. Create index and foreign keys
-- CreateIndex
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'articles' AND INDEX_NAME = 'articles_editorId_idx') > 0,
  'SELECT 1',
  'CREATE INDEX articles_editorId_idx ON articles(editorId)'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Foreign keys
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = @dbname AND CONSTRAINT_NAME = 'activity_logs_userId_fkey') > 0,
  'SELECT 1',
  'ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = @dbname AND CONSTRAINT_NAME = 'articles_editorId_fkey') > 0,
  'SELECT 1',
  'ALTER TABLE articles ADD CONSTRAINT articles_editorId_fkey FOREIGN KEY (editorId) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = @dbname AND CONSTRAINT_NAME = 'comments_articleId_fkey') > 0,
  'SELECT 1',
  'ALTER TABLE comments ADD CONSTRAINT comments_articleId_fkey FOREIGN KEY (articleId) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
