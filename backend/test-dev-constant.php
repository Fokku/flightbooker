<?php
require_once 'config/config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status' => true,
    'message' => 'Development constant test',
    'data' => [
        'development_defined' => defined('DEVELOPMENT'),
        'development_value' => DEVELOPMENT,
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s'),
        'timezone' => date_default_timezone_get(),
    ]
]);
