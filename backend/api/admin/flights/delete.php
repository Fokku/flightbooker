
<?php
require_once '../../../config/config.php';
require_once '../../../config/database.php';
require_once '../../../includes/auth.php';

setApiHeaders();

// Check if request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is admin
if (!Auth::isAdmin()) {
    sendResponse(false, 'Unauthorized - Admin access required');
}

// Get flight ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($id === null) {
    sendResponse(false, 'Flight ID is required');
}

// Connect to database
$conn = connectDB();

// Check if flight exists
$stmt = $conn->prepare("SELECT id FROM flights WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Flight not found');
}

$stmt->close();

// Check if flight has bookings
$stmt = $conn->prepare("SELECT id FROM bookings WHERE flight_id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Cannot delete flight with existing bookings');
}

$stmt->close();

// Delete flight
$stmt = $conn->prepare("DELETE FROM flights WHERE id = ?");
$stmt->bind_param("i", $id);
$success = $stmt->execute();

$stmt->close();
closeDB($conn);

if ($success) {
    sendResponse(true, 'Flight deleted successfully');
} else {
    sendResponse(false, 'Failed to delete flight');
}
?>
