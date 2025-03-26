<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Connect to database
$conn = connectDB();

if (!$conn) {
    die("Database connection failed. Please check your configuration.\n");
}

// Check if table already exists
$result = $conn->query("SHOW TABLES LIKE 'email_verifications'");
if ($result->num_rows > 0) {
    echo "Table 'email_verifications' already exists. Skipping creation.\n";
} else {
    // Create email_verifications table
    $sql = "CREATE TABLE `email_verifications` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    if ($conn->query($sql) === TRUE) {
        echo "Table 'email_verifications' created successfully.\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
}

// Close connection
closeDB($conn);
echo "Done.\n";
