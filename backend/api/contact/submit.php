
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
    sendResponse(false, 'Missing required fields');
}

$name = sanitizeInput($data['name']);
$email = sanitizeInput($data['email']);
$message = sanitizeInput($data['message']);

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format');
}

// Connect to database
$conn = connectDB();

// Insert contact message
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $message);
$success = $stmt->execute();

$stmt->close();
closeDB($conn);

if ($success) {
    sendResponse(true, 'Message sent successfully');
} else {
    sendResponse(false, 'Failed to send message');
}
?>
