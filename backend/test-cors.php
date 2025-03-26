<?php
// We don't include any other files first to avoid side effects
// First, just output CORS headers directly

// Define allowed origins
$allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:8000',
    'http://localhost'
];

// Get the origin of the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'No origin header';

// Set verbose CORS headers for testing
header('Access-Control-Allow-Origin: ' . (in_array($origin, $allowedOrigins) ? $origin : 'http://localhost:8080'));
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Send back full diagnostic information
header('Content-Type: application/json');

// Get all request headers
function getAllHeaders()
{
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) === 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        } elseif ($name === 'CONTENT_TYPE' || $name === 'CONTENT_LENGTH') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', $name))))] = $value;
        }
    }
    return $headers;
}

echo json_encode([
    'status' => 'success',
    'message' => 'CORS test successful',
    'cors' => [
        'detected_origin' => $origin,
        'is_allowed' => in_array($origin, $allowedOrigins),
        'sent_header' => in_array($origin, $allowedOrigins) ? $origin : 'http://localhost:8080'
    ],
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'path' => $_SERVER['REQUEST_URI'],
        'time' => date('Y-m-d H:i:s'),
        'php_version' => PHP_VERSION,
        'headers' => getAllHeaders(),
        'ip' => $_SERVER['REMOTE_ADDR']
    ],
    'server' => [
        'name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'port' => $_SERVER['SERVER_PORT'] ?? 'unknown',
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    ]
]);
