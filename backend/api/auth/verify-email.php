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
    if (!isset($data['email']) || !isset($data['otp'])) {
        sendResponse(false, 'Missing required fields');
    }

    $email = sanitizeInput($data['email']);
    $otp = sanitizeInput($data['otp']);

    // Get user ID
    $conn = connectDB();
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        closeDB($conn);
        sendResponse(false, 'User not found');
    }

    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $stmt->close();
    closeDB($conn);

    // Verify OTP
    $verifyResult = EmailVerification::verifyOTP($userId, $email, $otp);

    if ($verifyResult['status']) {
        sendResponse(true, 'Email verified successfully');
    } else {
        sendResponse(false, $verifyResult['message']);
    }
} catch (Exception $e) {
    error_log("Email verification error: " . $e->getMessage());
    sendResponse(false, 'An error occurred during email verification');
}
