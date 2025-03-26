<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

class EmailVerification
{
    private static function generateOTP()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private static function sendEmail($to, $subject, $message)
    {
        // Check if we're in a development environment
        $isDevelopment = true; // Set to false in production

        if ($isDevelopment) {
            // In development, log email instead of sending
            try {
                $logDir = dirname(__DIR__) . '/logs';
                $logFile = $logDir . '/email.log';

                // Create directory if it doesn't exist
                if (!is_dir($logDir)) {
                    mkdir($logDir, 0777, true);
                }

                if (!is_writable($logDir)) {
                    error_log("Email log directory is not writable: $logDir");
                    return false;
                }

                $emailLog = fopen($logFile, 'a');
                if ($emailLog === false) {
                    error_log("Could not open email log file: $logFile");
                    return false;
                }

                $timestamp = date('Y-m-d H:i:s');
                $logMessage = "[$timestamp] To: $to\nSubject: $subject\nMessage: $message\n\n";

                $writeResult = fwrite($emailLog, $logMessage);
                fclose($emailLog);

                if ($writeResult === false) {
                    error_log("Failed to write to email log file");
                    return false;
                }

                // For development, return true to simulate successful sending
                error_log("Email logged instead of sent - To: $to, Subject: $subject");
                return true;
            } catch (Exception $e) {
                error_log("Email logging error: " . $e->getMessage());
                return false;
            }
        } else {
            // In production, use the actual mail function
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: ' . SITE_EMAIL . "\r\n";

            return mail($to, $subject, $message, $headers);
        }
    }

    public static function sendVerificationEmail($userId, $email)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Generate OTP
            $otp = self::generateOTP();

            // Set expiration to 15 minutes from now
            // Use UTC timezone to ensure consistency
            $expiresAt = gmdate('Y-m-d H:i:s', time() + 900); // 900 seconds = 15 minutes

            // Store verification record
            $stmt = $conn->prepare("INSERT INTO email_verifications (user_id, email, otp, type, expires_at) VALUES (?, ?, ?, 'registration', ?)");
            $stmt->bind_param("isss", $userId, $email, $otp, $expiresAt);
            $stmt->execute();

            // Send email
            $subject = "Verify your email address";
            $message = "
                <html>
                <body>
                    <h2>Email Verification</h2>
                    <p>Your verification code is: <strong>{$otp}</strong></p>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </body>
                </html>
            ";

            $sent = self::sendEmail($email, $subject, $message);

            $stmt->close();
            closeDB($conn);

            if ($sent) {
                return ['status' => true, 'message' => 'Verification email sent successfully'];
            } else {
                return ['status' => false, 'message' => 'Failed to send verification email'];
            }
        } catch (Exception $e) {
            error_log("Email verification error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while sending verification email'];
        }
    }

    public static function verifyOTP($userId, $email, $otp)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Check if OTP exists and is valid
            $stmt = $conn->prepare("
                SELECT * FROM email_verifications 
                WHERE user_id = ? AND email = ? AND otp = ? 
                AND type = 'registration' AND expires_at > UTC_TIMESTAMP()
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt->bind_param("iss", $userId, $email, $otp);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                // If no results, check if OTP exists but is expired
                $stmt->close();

                $stmt = $conn->prepare("
                    SELECT expires_at FROM email_verifications 
                    WHERE user_id = ? AND email = ? AND otp = ? 
                    AND type = 'registration'
                    ORDER BY created_at DESC LIMIT 1
                ");
                $stmt->bind_param("iss", $userId, $email, $otp);
                $stmt->execute();
                $expiryResult = $stmt->get_result();

                if ($expiryResult->num_rows > 0) {
                    $stmt->close();
                    closeDB($conn);
                    return ['status' => false, 'message' => 'Verification code has expired'];
                } else {
                    $stmt->close();
                    closeDB($conn);
                    return ['status' => false, 'message' => 'Invalid verification code'];
                }
            }

            // Update user's email verification status
            $stmt = $conn->prepare("UPDATE users SET email_verified = TRUE WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();

            // Delete used verification record
            $stmt = $conn->prepare("DELETE FROM email_verifications WHERE user_id = ? AND email = ? AND otp = ?");
            $stmt->bind_param("iss", $userId, $email, $otp);
            $stmt->execute();

            $stmt->close();
            closeDB($conn);

            return ['status' => true, 'message' => 'Email verified successfully'];
        } catch (Exception $e) {
            error_log("OTP verification error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while verifying OTP'];
        }
    }

    public static function sendPasswordResetOTP($userId, $email)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Generate OTP
            $otp = self::generateOTP();

            // Set expiration to 15 minutes from now
            // Use UTC timezone to ensure consistency
            $expiresAt = gmdate('Y-m-d H:i:s', time() + 900); // 900 seconds = 15 minutes

            // Store verification record
            $stmt = $conn->prepare("INSERT INTO email_verifications (user_id, email, otp, type, expires_at) VALUES (?, ?, ?, 'password_reset', ?)");
            $stmt->bind_param("isss", $userId, $email, $otp, $expiresAt);
            $stmt->execute();

            // Send email
            $subject = "Password Reset Verification";
            $message = "
                <html>
                <body>
                    <h2>Password Reset Verification</h2>
                    <p>Your verification code is: <strong>{$otp}</strong></p>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                </body>
                </html>
            ";

            $sent = self::sendEmail($email, $subject, $message);

            $stmt->close();
            closeDB($conn);

            if ($sent) {
                return ['status' => true, 'message' => 'Password reset verification email sent successfully'];
            } else {
                return ['status' => false, 'message' => 'Failed to send password reset verification email'];
            }
        } catch (Exception $e) {
            error_log("Password reset OTP error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while sending password reset verification email'];
        }
    }

    public static function verifyPasswordResetOTP($userId, $email, $otp)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Check if OTP exists and is valid
            $stmt = $conn->prepare("
                SELECT * FROM email_verifications 
                WHERE user_id = ? AND email = ? AND otp = ? 
                AND type = 'password_reset' AND expires_at > UTC_TIMESTAMP()
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt->bind_param("iss", $userId, $email, $otp);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                // If no results, check if OTP exists but is expired
                $stmt->close();

                $stmt = $conn->prepare("
                    SELECT expires_at FROM email_verifications 
                    WHERE user_id = ? AND email = ? AND otp = ? 
                    AND type = 'password_reset'
                    ORDER BY created_at DESC LIMIT 1
                ");
                $stmt->bind_param("iss", $userId, $email, $otp);
                $stmt->execute();
                $expiryResult = $stmt->get_result();

                if ($expiryResult->num_rows > 0) {
                    $stmt->close();
                    closeDB($conn);
                    return ['status' => false, 'message' => 'Verification code has expired'];
                } else {
                    $stmt->close();
                    closeDB($conn);
                    return ['status' => false, 'message' => 'Invalid verification code'];
                }
            }

            // Delete used verification record
            $stmt = $conn->prepare("DELETE FROM email_verifications WHERE user_id = ? AND email = ? AND otp = ?");
            $stmt->bind_param("iss", $userId, $email, $otp);
            $stmt->execute();

            $stmt->close();
            closeDB($conn);

            return ['status' => true, 'message' => 'OTP verified successfully'];
        } catch (Exception $e) {
            error_log("Password reset OTP verification error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while verifying OTP'];
        }
    }

    public static function sendPreRegistrationOTP($tempUserId, $email)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Generate OTP
            $otp = self::generateOTP();

            // Set expiration to 15 minutes from now
            // Use UTC timezone to ensure consistency
            $expiresAt = gmdate('Y-m-d H:i:s', time() + 900); // 900 seconds = 15 minutes

            // Store verification record
            $stmt = $conn->prepare("INSERT INTO email_verifications (user_id, email, otp, type, expires_at) VALUES (?, ?, ?, 'pre_registration', ?)");
            $stmt->bind_param("ssss", $tempUserId, $email, $otp, $expiresAt);
            $stmt->execute();

            // Send email
            $subject = "Email Verification for Registration";
            $message = "
                <html>
                <body>
                    <h2>Complete Your Registration</h2>
                    <p>Your verification code is: <strong>{$otp}</strong></p>
                    <p>Please enter this code to complete your registration.</p>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </body>
                </html>
            ";

            $sent = self::sendEmail($email, $subject, $message);

            $stmt->close();
            closeDB($conn);

            if ($sent) {
                return ['status' => true, 'message' => 'Verification email sent successfully'];
            } else {
                return ['status' => false, 'message' => 'Failed to send verification email'];
            }
        } catch (Exception $e) {
            error_log("Pre-registration email verification error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while sending verification email'];
        }
    }

    public static function verifyPreRegistrationOTP($tempUserId, $email, $otp)
    {
        $conn = connectDB();
        if (!$conn) {
            return ['status' => false, 'message' => 'Database connection error'];
        }

        try {
            // Log all input parameters
            error_log("verifyPreRegistrationOTP called with: tempUserId=$tempUserId, email=$email, otp=$otp");

            // Get server time info for debugging
            $serverTime = date('Y-m-d H:i:s');
            $serverTimeUTC = gmdate('Y-m-d H:i:s');
            $dbTimeResult = $conn->query("SELECT NOW() as db_time, UTC_TIMESTAMP() as db_utc_time");
            $timeRow = $dbTimeResult->fetch_assoc();
            $dbTime = $timeRow['db_time'];
            $dbUTCTime = $timeRow['db_utc_time'];

            error_log("Time debug - Server time: $serverTime, Server UTC: $serverTimeUTC");
            error_log("Time debug - DB time: $dbTime, DB UTC: $dbUTCTime");

            // First check if the record exists at all, without time constraint
            $checkStmt = $conn->prepare("
                SELECT id, expires_at FROM email_verifications 
                WHERE user_id = ? AND email = ? AND otp = ? AND type = 'pre_registration'
                ORDER BY created_at DESC LIMIT 1
            ");
            $checkStmt->bind_param("sss", $tempUserId, $email, $otp);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();

            if ($checkResult->num_rows === 0) {
                error_log("No matching OTP record found for tempUserId=$tempUserId, email=$email, otp=$otp");
                $checkStmt->close();
                closeDB($conn);
                return ['status' => false, 'message' => 'Invalid verification code'];
            }

            // Record exists, now check if it's expired
            $row = $checkResult->fetch_assoc();
            $recordId = $row['id'];
            $expiresAt = $row['expires_at'];
            error_log("Found OTP record with ID=$recordId, expires_at=$expiresAt");
            $checkStmt->close();

            // Check if it's expired by comparing with current UTC time
            if (strtotime($expiresAt) < strtotime($dbUTCTime)) {
                error_log("OTP is expired. Expires at: $expiresAt, Current UTC time: $dbUTCTime");
                closeDB($conn);
                return ['status' => false, 'message' => 'Verification code has expired'];
            }

            // If we get here, the code is valid and not expired
            error_log("OTP verification successful for ID=$recordId");
            closeDB($conn);
            return ['status' => true, 'message' => 'OTP verified successfully'];
        } catch (Exception $e) {
            error_log("Pre-registration OTP verification error: " . $e->getMessage());
            closeDB($conn);
            return ['status' => false, 'message' => 'An error occurred while verifying OTP'];
        }
    }

    // Add this new method for retrieving OTP in development

    /**
     * Retrieves the most recent OTP for a specified email and type from the database
     * This should only be used in development environments
     */
    public static function getLastOTP($email, $type = 'pre_registration')
    {
        // Only allow this in development environment
        if (!DEVELOPMENT) {
            error_log("Attempted to retrieve OTP in production environment");
            return null;
        }

        $conn = connectDB();
        if (!$conn) {
            error_log("Database connection error when retrieving OTP");
            return null;
        }

        try {
            $stmt = $conn->prepare("
                SELECT otp FROM email_verifications 
                WHERE email = ? AND type = ? 
                ORDER BY created_at DESC LIMIT 1
            ");
            $stmt->bind_param("ss", $email, $type);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 0) {
                $stmt->close();
                closeDB($conn);
                return null;
            }

            $row = $result->fetch_assoc();
            $stmt->close();
            closeDB($conn);

            return $row['otp'];
        } catch (Exception $e) {
            error_log("Error retrieving OTP: " . $e->getMessage());
            closeDB($conn);
            return null;
        }
    }
}
