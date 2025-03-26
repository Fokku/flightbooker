<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../config/cors.php';

// Set error handler
function handleError($errno, $errstr, $errfile, $errline)
{
    error_log("Error [$errno] $errstr in $errfile on line $errline");
    sendResponse(false, 'An error occurred during login');
    return true;
}
set_error_handler('handleError');

// Set exception handler
function handleException($e)
{
    error_log("Exception: " . $e->getMessage());
    sendResponse(false, 'An error occurred during login');
}
set_exception_handler('handleException');

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
    if (!isset($data['username']) || !isset($data['password'])) {
        sendResponse(false, 'Missing required fields');
    }

    $username = sanitizeInput($data['username']);
    $password = $data['password'];

    // Login user
    $result = Auth::login($username, $password, true); // true indicates login with username

    // If email needs verification, send a new verification code
    if (!$result['status'] && isset($result['needsVerification']) && $result['needsVerification']) {
        require_once '../../includes/email.php';
        $resendResult = EmailVerification::sendVerificationEmail($result['userId'], $result['email']);

        if ($resendResult['status']) {
            $result['message'] = 'Email not verified. A new verification code has been sent to your email.';
        } else {
            $result['message'] = 'Email not verified. Failed to send a new verification code. Please try again.';
        }
    }

    sendResponse($result['status'], $result['message'], $result['status'] ? $result['user'] : (isset($result['needsVerification']) ? ['needsVerification' => true, 'email' => $result['email']] : null));
} catch (Exception $e) {
    error_log("Login endpoint error: " . $e->getMessage());
    sendResponse(false, 'An error occurred during login');
}
