
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is logged in
if (!Auth::isLoggedIn()) {
    sendResponse(false, 'Unauthorized', ['redirect' => '/login']);
}

// Get current user
$user = Auth::getCurrentUser();

// Connect to database
$conn = connectDB();

// Get bookings
$stmt = $conn->prepare("
    SELECT b.*, f.flight_number, f.departure, f.arrival, f.date, f.time 
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

$stmt->close();
closeDB($conn);

sendResponse(true, 'Bookings retrieved successfully', $bookings);
?>
