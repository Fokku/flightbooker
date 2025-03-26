<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// Enable detailed error logging
error_log("=== Starting pre-registration process ===");

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

    // Username validation should be moved here
    if (isset($data['username'])) {
        $username = sanitizeInput($data['username']);

        // Validate username (you can add more validation as needed)
        if (strlen($username) < 3) {
            sendResponse(false, 'Username must be at least 3 characters long');
        }

        // Check if username already exists
        $conn = connectDB();
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $stmt->close();
            closeDB($conn);
            sendResponse(false, 'Username already exists. Please choose a different username.');
        }

        $stmt->close();
    } else {
        $username = ''; // No username provided, could be optional at this stage
    }

    $email = sanitizeInput($data['email']);
    error_log("Pre-registration requested for email: $email" . ($username ? ", username: $username" : ""));

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'Invalid email format');
    }

    // Check if email already exists
    $conn = connectDB();
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt->close();
        closeDB($conn);
        sendResponse(false, 'Email already registered. Please use a different email.');
    }

    $stmt->close();
    closeDB($conn);

    // Generate a temporary user ID for pre-registration verification
    $tempUserId = 'pre_' . md5($email . time());
    error_log("Generated temporary user ID: $tempUserId");

    // Store in session for verification later
    $_SESSION['pre_registration'] = [
        'temp_user_id' => $tempUserId,
        'email' => $email,
        'username' => $username,
        'timestamp' => time()
    ];

    // Debug session
    error_log("Session data stored: " . json_encode($_SESSION['pre_registration']));
    error_log("Full session ID: " . session_id());

    // Send verification email
    $emailResult = EmailVerification::sendPreRegistrationOTP($tempUserId, $email);

    if ($emailResult['status']) {
        // In development environment, log the OTP for easier testing
        if (DEVELOPMENT) {
            $otp = EmailVerification::getLastOTP($email, 'pre_registration');
            if ($otp) {
                error_log("DEVELOPMENT MODE - OTP for $email: $otp");
            }
        }
        sendResponse(true, 'Verification code sent successfully');
    } else {
        error_log("Failed to send verification email: " . $emailResult['message']);
        sendResponse(false, $emailResult['message']);
    }
} catch (Exception $e) {
    error_log("Pre-registration error: " . $e->getMessage());
    sendResponse(false, 'An error occurred during pre-registration');
}
