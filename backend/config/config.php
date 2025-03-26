<?php
// Define if we're in development mode
define('DEVELOPMENT', true); // Set to false in production

// Define base paths
define('BASE_PATH', dirname(__DIR__));
define('API_PATH', BASE_PATH . '/api');
define('INCLUDES_PATH', BASE_PATH . '/includes');

// Error reporting settings
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Session settings - improved for compatibility
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

// For production, use secure cookies
if (!DEVELOPMENT) {
    ini_set('session.cookie_secure', 1);
}

// Handle SameSite cookie issues in modern browsers
ini_set('session.cookie_samesite', 'Lax');  // Use 'Lax' for better compatibility

// Set a specific session name for this application
session_name('skyglobe_session');

// Start the session
session_start();

// Site settings
define('SITE_NAME', 'Flight Booker');
define('SITE_EMAIL', 'noreply@flightbooker.com');

// Set headers for API
function setApiHeaders()
{
    // Define allowed origins
    $allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:8000'
    ];

    // Get the origin of the request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // Check if the origin is allowed
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Default to the frontend URL
        header('Access-Control-Allow-Origin: http://localhost:8080');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

// Function to generate response
function sendResponse($status, $message, $data = null)
{
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Function to validate and sanitize input
function sanitizeInput($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
