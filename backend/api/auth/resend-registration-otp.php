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
    if (!isset($data['email'])) {
        sendResponse(false, 'Missing required field: email');
    }

    $email = sanitizeInput($data['email']);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'Invalid email format');
    }

    // Check if pre-registration session exists
    if (
        !isset($_SESSION['pre_registration']) ||
        $_SESSION['pre_registration']['email'] !== $email ||
        (time() - $_SESSION['pre_registration']['timestamp']) > 3600
    ) { // 1 hour expiry

        // Create a new pre-registration session
        $tempUserId = 'pre_' . md5($email . time());

        $_SESSION['pre_registration'] = [
            'temp_user_id' => $tempUserId,
            'email' => $email,
            'timestamp' => time()
        ];
    } else {
        // Use existing session
        $tempUserId = $_SESSION['pre_registration']['temp_user_id'];
    }

    // Delete any existing verification records for this temp user
    $conn = connectDB();
    $stmt = $conn->prepare("DELETE FROM email_verifications WHERE user_id = ? AND email = ? AND type = 'pre_registration'");
    $stmt->bind_param("ss", $tempUserId, $email);
    $stmt->execute();
    $stmt->close();
    closeDB($conn);

    // Send a new verification email
    $emailResult = EmailVerification::sendPreRegistrationOTP($tempUserId, $email);

    if ($emailResult['status']) {
        sendResponse(true, 'Verification code resent successfully');
    } else {
        sendResponse(false, $emailResult['message']);
    }
} catch (Exception $e) {
    error_log("Resend verification error: " . $e->getMessage());
    sendResponse(false, 'An error occurred while resending the verification code');
}
