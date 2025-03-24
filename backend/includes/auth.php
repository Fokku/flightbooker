
<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// User authentication functions
class Auth {
    // Register a new user
    public static function register($username, $email, $password) {
        $conn = connectDB();
        
        // Check if username or email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $username, $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $stmt->close();
            closeDB($conn);
            return ['status' => false, 'message' => 'Username or email already exists'];
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert new user
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashedPassword);
        $success = $stmt->execute();
        
        $stmt->close();
        closeDB($conn);
        
        if ($success) {
            return ['status' => true, 'message' => 'Registration successful'];
        } else {
            return ['status' => false, 'message' => 'Registration failed'];
        }
    }
    
    // Login user
    public static function login($email, $password) {
        $conn = connectDB();
        
        // Get user with given email
        $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            closeDB($conn);
            return ['status' => false, 'message' => 'Invalid email or password'];
        }
        
        $user = $result->fetch_assoc();
        $stmt->close();
        closeDB($conn);
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Create session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            return [
                'status' => true, 
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ];
        } else {
            return ['status' => false, 'message' => 'Invalid email or password'];
        }
    }
    
    // Logout user
    public static function logout() {
        session_unset();
        session_destroy();
        return ['status' => true, 'message' => 'Logout successful'];
    }
    
    // Check if user is logged in
    public static function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }
    
    // Check if user is admin
    public static function isAdmin() {
        return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    }
    
    // Get current user
    public static function getCurrentUser() {
        if (!self::isLoggedIn()) {
            return null;
        }
        
        $conn = connectDB();
        $stmt = $conn->prepare("SELECT id, username, email, role FROM users WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            closeDB($conn);
            return null;
        }
        
        $user = $result->fetch_assoc();
        $stmt->close();
        closeDB($conn);
        
        return $user;
    }
    
    // Generate and store password reset token
    public static function generateResetToken($email) {
        $conn = connectDB();
        
        // Check if email exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            closeDB($conn);
            return ['status' => false, 'message' => 'Email not found'];
        }
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Store token
        $stmt = $conn->prepare("UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?");
        $stmt->bind_param("sss", $token, $expiry, $email);
        $success = $stmt->execute();
        
        $stmt->close();
        closeDB($conn);
        
        if ($success) {
            return ['status' => true, 'message' => 'Reset token generated', 'token' => $token];
        } else {
            return ['status' => false, 'message' => 'Failed to generate reset token'];
        }
    }
    
    // Verify reset token and change password
    public static function resetPassword($token, $password) {
        $conn = connectDB();
        
        // Check if token exists and is valid
        $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND token_expiry > NOW()");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt->close();
            closeDB($conn);
            return ['status' => false, 'message' => 'Invalid or expired token'];
        }
        
        $user = $result->fetch_assoc();
        
        // Hash new password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Update password and clear token
        $stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt->bind_param("si", $hashedPassword, $user['id']);
        $success = $stmt->execute();
        
        $stmt->close();
        closeDB($conn);
        
        if ($success) {
            return ['status' => true, 'message' => 'Password reset successful'];
        } else {
            return ['status' => false, 'message' => 'Failed to reset password'];
        }
    }
}
?>
