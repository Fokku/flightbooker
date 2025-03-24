
<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Logout user
$result = Auth::logout();

sendResponse($result['status'], $result['message']);
?>
