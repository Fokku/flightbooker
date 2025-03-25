
<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is logged in
if (!Auth::isLoggedIn()) {
    sendResponse(false, 'You must be logged in to update your password');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['current_password']) || !isset($data['new_password'])) {
    sendResponse(false, 'Current password and new password are required');
}

$currentPassword = $data['current_password'];
$newPassword = $data['new_password'];

// Validate new password
if (strlen($newPassword) < 8) {
    sendResponse(false, 'New password must be at least 8 characters long');
}

// Get current user
$user = Auth::getCurrentUser();
if (!$user) {
    sendResponse(false, 'Failed to get current user');
}

// Connect to database
$conn = connectDB();

// Get user's current password hash
$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'User not found');
}

$userData = $result->fetch_assoc();
$stmt->close();

// Verify current password
if (!password_verify($currentPassword, $userData['password'])) {
    closeDB($conn);
    sendResponse(false, 'Current password is incorrect');
}

// Hash new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param("si", $hashedPassword, $user['id']);
$success = $stmt->execute();
$stmt->close();
closeDB($conn);

if ($success) {
    sendResponse(true, 'Password updated successfully');
} else {
    sendResponse(false, 'Failed to update password');
}
?>
