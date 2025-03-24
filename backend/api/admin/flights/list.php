
<?php
require_once '../../../config/config.php';
require_once '../../../config/database.php';
require_once '../../../includes/auth.php';

setApiHeaders();

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is admin
if (!Auth::isAdmin()) {
    sendResponse(false, 'Unauthorized - Admin access required');
}

// Connect to database
$conn = connectDB();

// Get flights
$stmt = $conn->prepare("SELECT * FROM flights ORDER BY date ASC, time ASC");
$stmt->execute();
$result = $stmt->get_result();

$flights = [];
while ($row = $result->fetch_assoc()) {
    $flights[] = $row;
}

$stmt->close();
closeDB($conn);

sendResponse(true, 'Flights retrieved successfully', $flights);
?>
