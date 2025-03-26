<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// Enable detailed error logging
error_log("=== Starting pre-registration verification process ===");
error_log("Session ID: " . session_id());

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
    exit;
}

try {
    // Get JSON data
    $input = file_get_contents('php://input');
    if (!$input) {
        sendResponse(false, 'No input data received');
        exit;
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON data');
        exit;
    }

    // Validate input
    if (!isset($data['email']) || !isset($data['otp'])) {
        sendResponse(false, 'Missing required fields');
        exit;
    }

    $email = sanitizeInput($data['email']);
    $otp = sanitizeInput($data['otp']);
    error_log("Verification requested for email: $email with OTP: $otp");

    // Debug session data
    if (isset($_SESSION['pre_registration'])) {
        error_log("Session pre_registration data: " . json_encode($_SESSION['pre_registration']));
    } else {
        error_log("ERROR: pre_registration session data not found!");
    }

    // Check if we need to manually get the tempUserId if session doesn't have it
    if (
        !isset($_SESSION['pre_registration']) ||
        !isset($_SESSION['pre_registration']['temp_user_id']) ||
        $_SESSION['pre_registration']['email'] !== $email
    ) {
        // Session might be lost, let's try to recover by looking up the email in the database
        error_log("Session data missing or mismatched, attempting fallback lookup for email: $email");

        // Get the most recent tempUserId for this email from the database
        $conn = connectDB();
        if ($conn) {
            $stmt = $conn->prepare("
                SELECT user_id FROM email_verifications 
                WHERE email = ? AND type = 'pre_registration'
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $recoveredTempUserId = $row['user_id'];
                error_log("Recovered tempUserId from database: $recoveredTempUserId");

                // Use the recovered tempUserId and recreate the session
                $tempUserId = $recoveredTempUserId;
                $_SESSION['pre_registration'] = [
                    'temp_user_id' => $tempUserId,
                    'email' => $email,
                    'timestamp' => time()
                ];
                error_log("Session recreated with recovered data");
            } else {
                error_log("No records found for email: $email, cannot recover session");
                $stmt->close();
                closeDB($conn);
                sendResponse(false, 'No registration in progress for this email');
                exit;
            }

            $stmt->close();
            closeDB($conn);
        }
    } else {
        $tempUserId = $_SESSION['pre_registration']['temp_user_id'];
        error_log("Using temp user ID from session: $tempUserId");
    }

    // Verify the OTP
    $verifyResult = EmailVerification::verifyPreRegistrationOTP($tempUserId, $email, $otp);
    error_log("OTP verification result: " . json_encode($verifyResult));

    if (!$verifyResult['status']) {
        sendResponse(false, $verifyResult['message']);
        exit;
    }

    // Mark as verified in session
    $_SESSION['pre_registration']['verified'] = true;
    $_SESSION['pre_registration']['otp'] = $otp;
    error_log("OTP verification successful, session updated");

    sendResponse(true, 'Email verification successful');
} catch (Exception $e) {
    error_log("Pre-registration OTP verification error: " . $e->getMessage());
    sendResponse(false, 'An error occurred during verification');
}
