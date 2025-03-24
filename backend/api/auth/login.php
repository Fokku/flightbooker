
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
if (!isset($data['email']) || !isset($data['password'])) {
    sendResponse(false, 'Missing required fields');
}

$email = sanitizeInput($data['email']);
$password = $data['password'];

// Login user
$result = Auth::login($email, $password);

sendResponse($result['status'], $result['message'], $result['status'] ? $result['user'] : null);
?>
