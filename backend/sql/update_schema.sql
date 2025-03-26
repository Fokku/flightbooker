USE flight_booking;

-- Drop the existing email_verifications table if it has a foreign key constraint
DROP TABLE IF EXISTS email_verifications;

-- Recreate the email_verifications table with the correct structure
CREATE TABLE `email_verifications` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(128) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `type` ENUM('registration', 'pre_registration', 'password_reset') NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add a comment to explain that this table supports both registered users (INT user_id) 
-- and pre-registration users (VARCHAR user_id starting with 'pre_')
ALTER TABLE `email_verifications` COMMENT = 'Supports both registered users and pre-registration verification';

-- Check if the email_verified column exists in the users table, add it if it doesn't
SET @exists = (SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'flight_booking' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'email_verified');

SET @query = IF(@exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE AFTER `role`',
    'SELECT "email_verified column already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
