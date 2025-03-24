
<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    sendResponse(false, 'Missing required fields');
}

$username = sanitizeInput($data['username']);
$email = sanitizeInput($data['email']);
$password = $data['password'];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format');
}

// Validate password
if (strlen($password) < 8) {
    sendResponse(false, 'Password must be at least 8 characters long');
}

// Register user
$result = Auth::register($username, $email, $password);

sendResponse($result['status'], $result['message']);
?>
