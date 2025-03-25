
<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if user is logged in
if (Auth::isLoggedIn()) {
    $user = Auth::getCurrentUser();
    
    if ($user) {
        sendResponse(true, 'User is logged in', [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);
    } else {
        // Session exists but user data couldn't be retrieved
        session_unset();
        session_destroy();
        sendResponse(false, 'Invalid session');
    }
} else {
    sendResponse(false, 'User is not logged in');
}
?>
