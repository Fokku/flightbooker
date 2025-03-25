
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
    sendResponse(false, 'You must be logged in to update your profile');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['username'])) {
    sendResponse(false, 'Username is required');
}

$username = sanitizeInput($data['username']);
$phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;

// Get current user
$user = Auth::getCurrentUser();
if (!$user) {
    sendResponse(false, 'Failed to get current user');
}

// Connect to database
$conn = connectDB();

// Check if username already exists for other users
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
$stmt->bind_param("si", $username, $user['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Username already taken');
}

// Update user profile
$sql = "UPDATE users SET username = ?";
$params = ["s", $username];

// Add phone if provided
if ($phone !== null) {
    $sql .= ", phone = ?";
    $params[0] .= "s";
    $params[] = $phone;
}

$sql .= " WHERE id = ?";
$params[0] .= "i";
$params[] = $user['id'];

$stmt = $conn->prepare($sql);
call_user_func_array([$stmt, 'bind_param'], $params);

$success = $stmt->execute();
$stmt->close();
closeDB($conn);

if ($success) {
    // Update session data
    $_SESSION['username'] = $username;
    
    sendResponse(true, 'Profile updated successfully');
} else {
    sendResponse(false, 'Failed to update profile');
}
?>
