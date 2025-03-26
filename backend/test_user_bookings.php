<?php
// Set test environment
$_SERVER['REQUEST_METHOD'] = 'GET';

// Mock Auth class to simulate a logged-in user
require_once 'config/config.php';
require_once 'config/database.php';

class Auth
{
    public static function isLoggedIn()
    {
        return true;
    }

    public static function getCurrentUser()
    {
        return [
            'id' => 4, // Use an ID from your test data
            'username' => 'testuser',
            'email' => 'test@example.com'
        ];
    }
}

// Now include and run the API endpoint
ob_start();
require_once 'api/bookings/user.php';
$output = ob_get_clean();

// Display results
echo "API Response:\n";
echo "----------------------------------------------------\n";
echo $output;
echo "\n----------------------------------------------------\n";

// Check log file for debug information
echo "\nLog file contents:\n";
echo "----------------------------------------------------\n";
$logContent = file_get_contents(__DIR__ . '/logs/app.log');
echo $logContent ?: "No log data found.";
echo "\n----------------------------------------------------\n";
