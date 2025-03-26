<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// Enable detailed error logging
error_log("=== Starting register-with-verification process ===");

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

    // Log received data (exclude password for security)
    $logData = $data;
    if (isset($logData['password'])) {
        $logData['password'] = '******';
    }
    error_log("Registration data received: " . json_encode($logData));

    // Validate input
    if (!isset($data['username']) || !isset($data['email']) || !isset($data['password']) || !isset($data['otp'])) {
        sendResponse(false, 'Missing required fields');
    }

    $username = sanitizeInput($data['username']);
    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $otp = sanitizeInput($data['otp']);

    error_log("Processing registration for email: $email, username: $username");

    // Check if pre-registration exists and is verified
    if (!isset($_SESSION['pre_registration'])) {
        error_log("Pre-registration session not found");
        sendResponse(false, 'Invalid or expired verification session');
    }

    // Check if email matches
    if ($_SESSION['pre_registration']['email'] !== $email) {
        error_log("Email mismatch: " . $_SESSION['pre_registration']['email'] . " vs $email");
        sendResponse(false, 'Email mismatch in verification session');
    }

    // Check if session is verified
    if (!isset($_SESSION['pre_registration']['verified']) || $_SESSION['pre_registration']['verified'] !== true) {
        error_log("Session not verified");
        sendResponse(false, 'Email verification incomplete');
    }

    // Check session expiry
    if ((time() - $_SESSION['pre_registration']['timestamp']) > 3600) { // 1 hour expiry
        error_log("Session expired: " . (time() - $_SESSION['pre_registration']['timestamp']) . " seconds elapsed");
        sendResponse(false, 'Verification session has expired');
    }

    // Additional check for OTP
    if (!isset($_SESSION['pre_registration']['otp']) || $_SESSION['pre_registration']['otp'] !== $otp) {
        error_log("OTP mismatch or not set");
        sendResponse(false, 'Invalid verification code');
    }

    // Connect to database
    $conn = connectDB();
    if (!$conn) {
        error_log("Database connection failed");
        sendResponse(false, 'Database connection error');
    }

    // Double-check if email already exists (as a safety measure)
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt->close();
        closeDB($conn);
        error_log("Email already exists: $email");
        sendResponse(false, 'Email already exists');
    }
    $stmt->close();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    if (!$hashedPassword) {
        error_log("Password hashing failed");
        closeDB($conn);
        sendResponse(false, 'Password hashing failed');
    }

    // Insert new user with email already verified
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, email_verified) VALUES (?, ?, ?, TRUE)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);
    $success = $stmt->execute();

    if (!$success) {
        error_log("Database error during user insertion: " . $conn->error);
        $stmt->close();
        closeDB($conn);
        sendResponse(false, 'Registration failed: ' . $conn->error);
    }

    // Get the newly created user ID
    $userId = $conn->insert_id;
    error_log("New user created with ID: $userId");

    // Delete the verification record
    $tempUserId = $_SESSION['pre_registration']['temp_user_id'];
    $stmt = $conn->prepare("DELETE FROM email_verifications WHERE user_id = ? AND email = ? AND type = 'pre_registration'");
    $stmt->bind_param("ss", $tempUserId, $email);
    $stmt->execute();

    // Clear the pre-registration session
    unset($_SESSION['pre_registration']);

    $stmt->close();
    closeDB($conn);

    sendResponse(true, 'Registration successful');
} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    sendResponse(false, 'An error occurred during registration');
}
