<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/email.php';
require_once __DIR__ . '/../config/database.php';

// Test pre-registration functionality
echo "Testing Pre-Registration System\n";

// Generate a test username and email
$username = 'testuser_' . time();
$email = 'testuser_' . time() . '@example.com';
$tempUserId = 'pre_' . md5($email . time());

echo "Using test username: $username, email: $email\n";
echo "Generated temp user ID: $tempUserId\n";

// Check if username is unique
$conn = connectDB();
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "WARNING: Username already exists. This shouldn't happen with a timestamped username.\n";
} else {
    echo "Username check passed. Username is unique.\n";
}
$stmt->close();

// Check if email is unique
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "WARNING: Email already exists. This shouldn't happen with a timestamped email.\n";
} else {
    echo "Email check passed. Email is unique.\n";
}
$stmt->close();

// Send pre-registration OTP
echo "Sending test pre-registration OTP...\n";
$result = EmailVerification::sendPreRegistrationOTP($tempUserId, $email);

if ($result['status']) {
    echo "SUCCESS: " . $result['message'] . "\n";

    // Retrieve the OTP
    $otp = EmailVerification::getLastOTP($email, 'pre_registration');
    if ($otp) {
        echo "The OTP sent was: $otp\n";

        // Create a fake session similar to what the real pre-registration process would create
        $_SESSION['pre_registration'] = [
            'temp_user_id' => $tempUserId,
            'email' => $email,
            'username' => $username,
            'timestamp' => time()
        ];

        // Test OTP verification
        echo "Testing OTP verification...\n";
        $verifyResult = EmailVerification::verifyPreRegistrationOTP($tempUserId, $email, $otp);

        if ($verifyResult['status']) {
            echo "SUCCESS: OTP verification successful\n";

            // Mark as verified in session
            $_SESSION['pre_registration']['verified'] = true;
            $_SESSION['pre_registration']['otp'] = $otp;

            // Display session state
            echo "Session state after verification:\n";
            var_export($_SESSION['pre_registration']);
            echo "\n";

            // Simulate the registration process
            echo "\nSimulating registration with the verified OTP...\n";

            // Connect to database
            if (!$conn) {
                echo "Database connection failed\n";
                exit;
            }

            // Check if email already exists (one more time)
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                echo "WARNING: Email already exists. Skipping user creation.\n";
            } else {
                // Create test password
                $password = 'testpassword';
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

                // Insert new user with email already verified
                $stmt = $conn->prepare("INSERT INTO users (username, email, password, email_verified) VALUES (?, ?, ?, TRUE)");
                $stmt->bind_param("sss", $username, $email, $hashedPassword);
                $success = $stmt->execute();

                if ($success) {
                    $userId = $conn->insert_id;
                    echo "SUCCESS: Test user created with ID: $userId\n";

                    // Clean up - delete the test user
                    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
                    $stmt->bind_param("i", $userId);
                    $stmt->execute();
                    echo "Test user deleted.\n";
                } else {
                    echo "ERROR: Failed to create test user: " . $conn->error . "\n";
                }
            }
            $stmt->close();
        } else {
            echo "ERROR: OTP verification failed: " . $verifyResult['message'] . "\n";
        }
    } else {
        echo "ERROR: Could not retrieve OTP\n";
    }
} else {
    echo "ERROR: " . $result['message'] . "\n";
}

// Clean up - delete any OTP records created during this test
$stmt = $conn->prepare("DELETE FROM email_verifications WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
echo "Cleaned up test OTP records.\n";

$stmt->close();
closeDB($conn);
echo "Test completed.\n";
