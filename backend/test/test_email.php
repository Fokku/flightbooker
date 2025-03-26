<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/email.php';
require_once __DIR__ . '/../config/database.php';

// Test email sending functionality
echo "Testing Email Verification System\n";

// Generate a temporary user ID
$tempUserId = 'pre_' . md5('test@example.com' . time());
$email = 'test@example.com';

echo "Sending test pre-registration OTP to {$email} with ID {$tempUserId}\n";

// Test sending OTP
$result = EmailVerification::sendPreRegistrationOTP($tempUserId, $email);

if ($result['status']) {
    echo "SUCCESS: " . $result['message'] . "\n";

    // In development, let's also retrieve the OTP for testing
    $otp = EmailVerification::getLastOTP($email, 'pre_registration');
    if ($otp) {
        echo "The OTP sent was: {$otp}\n";

        // Let's examine the verification record in the database
        $conn = connectDB();
        if ($conn) {
            $stmt = $conn->prepare("SELECT * FROM email_verifications WHERE email = ? AND otp = ? AND type = 'pre_registration' ORDER BY created_at DESC LIMIT 1");
            $stmt->bind_param("ss", $email, $otp);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                echo "Found verification record in database:\n";
                echo "  ID: " . $row['id'] . "\n";
                echo "  User ID: " . $row['user_id'] . "\n";
                echo "  Email: " . $row['email'] . "\n";
                echo "  OTP: " . $row['otp'] . "\n";
                echo "  Type: " . $row['type'] . "\n";
                echo "  Expires at: " . $row['expires_at'] . "\n";
                echo "  Created at: " . $row['created_at'] . "\n";
            } else {
                echo "ERROR: Verification record not found in database!\n";
            }

            $stmt->close();
            closeDB($conn);
        }
    } else {
        echo "ERROR: Could not retrieve OTP\n";
    }

    // Now test verification
    echo "\nTesting OTP verification\n";
    $verifyResult = EmailVerification::verifyPreRegistrationOTP($tempUserId, $email, $otp);

    if ($verifyResult['status']) {
        echo "SUCCESS: OTP verification successful\n";
    } else {
        echo "ERROR: OTP verification failed: " . $verifyResult['message'] . "\n";

        // Let's check what the verification query is actually doing
        echo "\nDebugging verification query:\n";
        $conn = connectDB();
        if ($conn) {
            $query = "SELECT * FROM email_verifications 
                WHERE user_id = ? AND email = ? AND otp = ? 
                AND type = 'pre_registration' AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1";

            echo "Query: " . $query . "\n";
            echo "Parameters: user_id = " . $tempUserId . ", email = " . $email . ", otp = " . $otp . "\n";

            $stmt = $conn->prepare($query);
            $stmt->bind_param("sss", $tempUserId, $email, $otp);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                echo "Query returned " . $result->num_rows . " rows\n";
            } else {
                echo "Query returned 0 rows\n";
            }

            $stmt->close();
            closeDB($conn);
        }
    }
} else {
    echo "ERROR: " . $result['message'] . "\n";
}

echo "\nCheck backend/logs/email.log for the email content\n";
