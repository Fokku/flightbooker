<?php
require_once '../config/config.php';

// Log request details
error_log("Request Headers: " . json_encode(getallheaders()));
error_log("HTTP_ORIGIN: " . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'Not set'));

// Set CORS headers using our function
setApiHeaders();

// Send a response with diagnostic information
header('Content-Type: application/json');
echo json_encode([
    'status' => true,
    'message' => 'CORS test successful',
    'data' => [
        'origin' => isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'Not set',
        'remote_addr' => $_SERVER['REMOTE_ADDR'],
        'request_time' => date('Y-m-d H:i:s'),
        'server_port' => $_SERVER['SERVER_PORT'],
        'request_headers' => getallheaders(),
        'php_version' => PHP_VERSION
    ]
]);
