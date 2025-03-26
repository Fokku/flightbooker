<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// Development environment check
if (!DEVELOPMENT) {
    sendResponse(false, 'This endpoint is only available in development environments');
    exit;
}

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
    exit;
}

try {
    // Check for required parameters
    if (!isset($_GET['email']) || !isset($_GET['type'])) {
        sendResponse(false, 'Email and type parameters are required');
        exit;
    }

    $email = sanitizeInput($_GET['email']);
    $type = sanitizeInput($_GET['type']);

    // Validate type
    $validTypes = ['pre_registration', 'registration', 'password_reset'];
    if (!in_array($type, $validTypes)) {
        sendResponse(false, 'Invalid OTP type. Must be one of: ' . implode(', ', $validTypes));
        exit;
    }

    // Retrieve the OTP
    $otp = EmailVerification::getLastOTP($email, $type);

    if ($otp === null) {
        // If no OTP found, look for any record for this email to help debugging
        $conn = connectDB();
        if ($conn) {
            $stmt = $conn->prepare("
                SELECT id, user_id, otp, type, expires_at, created_at FROM email_verifications 
                WHERE email = ? 
                ORDER BY created_at DESC LIMIT 5
            ");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $records = [];
                while ($row = $result->fetch_assoc()) {
                    $records[] = $row;
                }

                sendResponse(false, 'No OTP found for the specified type, but found other records', [
                    'records' => $records
                ]);
            } else {
                sendResponse(false, 'No OTP records found for this email address');
            }

            $stmt->close();
            closeDB($conn);
            exit;
        }

        sendResponse(false, 'No OTP found for the specified email and type');
        exit;
    }

    // Get session information if type is pre_registration
    $sessionInfo = null;
    if ($type === 'pre_registration' && isset($_SESSION['pre_registration'])) {
        $sessionInfo = $_SESSION['pre_registration'];
    }

    // Get the verification record details
    $conn = connectDB();
    if ($conn) {
        $stmt = $conn->prepare("
            SELECT * FROM email_verifications 
            WHERE email = ? AND otp = ? AND type = ?
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->bind_param("sss", $email, $otp, $type);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $record = $result->fetch_assoc();

            // Check if it's expired
            $dbTimeResult = $conn->query("SELECT UTC_TIMESTAMP() as db_utc_time");
            $timeRow = $dbTimeResult->fetch_assoc();
            $dbUTCTime = $timeRow['db_utc_time'];
            $isExpired = strtotime($record['expires_at']) < strtotime($dbUTCTime);

            sendResponse(true, 'OTP retrieved successfully', [
                'otp' => $otp,
                'record' => $record,
                'is_expired' => $isExpired,
                'current_utc_time' => $dbUTCTime,
                'session_info' => $sessionInfo
            ]);
        } else {
            sendResponse(true, 'OTP retrieved but record details not found', [
                'otp' => $otp,
                'session_info' => $sessionInfo
            ]);
        }

        $stmt->close();
        closeDB($conn);
    } else {
        sendResponse(true, 'OTP retrieved successfully', [
            'otp' => $otp,
            'session_info' => $sessionInfo
        ]);
    }
} catch (Exception $e) {
    error_log("Dev OTP retrieval error: " . $e->getMessage());
    sendResponse(false, 'An error occurred while retrieving the OTP: ' . $e->getMessage());
}
