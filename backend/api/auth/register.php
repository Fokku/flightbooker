<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

try {
    // Get JSON data
    $input = file_get_contents('php://input');
    if (!$input) {
        sendResponse(false, 'No input data received');
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON data');
    }

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

    if ($result['status']) {
        // Get user ID
        $conn = connectDB();
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $userResult = $stmt->get_result();
        $user = $userResult->fetch_assoc();
        $userId = $user['id'];
        $stmt->close();
        closeDB($conn);

        // Send verification email
        $emailResult = EmailVerification::sendVerificationEmail($userId, $email);

        if ($emailResult['status']) {
            sendResponse(true, 'Registration successful. Please check your email for verification code.');
        } else {
            // Registration succeeded but email failed
            sendResponse(true, 'Registration successful but failed to send verification email. Please contact support.');
        }
    } else {
        sendResponse(false, $result['message']);
    }
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    sendResponse(false, 'An error occurred during registration');
}
