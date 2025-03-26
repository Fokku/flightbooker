<?php
// Set headers for API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Create a simple response
$response = [
    'status' => true,
    'message' => 'API test successful',
    'data' => [
        'timestamp' => date('Y-m-d H:i:s'),
        'server' => $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'],
        'php_version' => PHP_VERSION
    ]
];

// Send response
echo json_encode($response);
exit;
