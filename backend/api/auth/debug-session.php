<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../config/cors.php';

setApiHeaders();

// IMPORTANT: Only enable in development!
$isDevelopment = true; // Set to false in production

if (!$isDevelopment) {
    sendResponse(false, 'Debug endpoints are disabled in production');
    exit;
}

// Get email from query params
if (!isset($_GET['email'])) {
    sendResponse(false, 'Email parameter is required');
    exit;
}

$email = sanitizeInput($_GET['email']);
$debugInfo = [];

// Session information
$debugInfo['session_info'] = [
    'session_id' => session_id(),
    'has_pre_registration' => isset($_SESSION['pre_registration']),
];

if (isset($_SESSION['pre_registration'])) {
    $debugInfo['pre_registration'] = $_SESSION['pre_registration'];

    // Calculate time remaining if session exists
    if (isset($_SESSION['pre_registration']['timestamp'])) {
        $elapsed = time() - $_SESSION['pre_registration']['timestamp'];
        $remaining = 3600 - $elapsed; // 1 hour expiry
        $debugInfo['session_time'] = [
            'elapsed_seconds' => $elapsed,
            'remaining_seconds' => $remaining,
            'is_expired' => $remaining <= 0
        ];
    }
}

// Database information
$conn = connectDB();
if ($conn) {
    // Check for OTPs in the database
    $stmt = $conn->prepare("
        SELECT * FROM email_verifications 
        WHERE email = ? AND type = 'pre_registration'
        ORDER BY created_at DESC
    ");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $records = [];
        while ($row = $result->fetch_assoc()) {
            // Add expiration info
            $dbTimeResult = $conn->query("SELECT UTC_TIMESTAMP() as db_utc_time");
            $timeRow = $dbTimeResult->fetch_assoc();
            $dbUTCTime = $timeRow['db_utc_time'];

            $row['is_expired'] = strtotime($row['expires_at']) < strtotime($dbUTCTime);
            $records[] = $row;
        }
        $debugInfo['database_records'] = $records;
    } else {
        $debugInfo['database_records'] = "No records found for $email";
    }

    $stmt->close();
    closeDB($conn);
} else {
    $debugInfo['database_error'] = "Failed to connect to database";
}

// Server and database time information
$debugInfo['time_info'] = [
    'server_time' => date('Y-m-d H:i:s'),
    'server_utc' => gmdate('Y-m-d H:i:s')
];

if ($conn) {
    $conn = connectDB();
    $timeResult = $conn->query("SELECT NOW() as db_time, UTC_TIMESTAMP() as db_utc_time");
    $timeRow = $timeResult->fetch_assoc();
    $debugInfo['time_info']['db_time'] = $timeRow['db_time'];
    $debugInfo['time_info']['db_utc_time'] = $timeRow['db_utc_time'];
    closeDB($conn);
}

sendResponse(true, 'Debug information', $debugInfo);
