
<?php
require_once '../../config/config.php';
require_once '../../includes/auth.php';

setApiHeaders();

// Check if user is logged in
if (!Auth::isLoggedIn()) {
    sendResponse(false, 'You must be logged in to view booking details');
}

// Check if booking ID is provided
if (!isset($_GET['id'])) {
    sendResponse(false, 'Booking ID is required');
}

$bookingId = intval($_GET['id']);
$userId = $_SESSION['user_id'];

// Connect to database
$conn = connectDB();

// Get booking details with joined flight information
$stmt = $conn->prepare("
    SELECT 
        b.id,
        b.status,
        b.passengers,
        b.total_price,
        b.booking_date,
        f.flight_number,
        f.departure,
        f.arrival,
        f.date,
        f.time,
        f.duration
    FROM 
        bookings b
    JOIN 
        flights f ON b.flight_id = f.id
    WHERE 
        b.id = ? AND b.user_id = ?
");

$stmt->bind_param("ii", $bookingId, $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Booking not found or you do not have permission to view it');
}

$booking = $result->fetch_assoc();
$stmt->close();
closeDB($conn);

// Format booking data
$bookingData = [
    'id' => $booking['id'],
    'flight_number' => $booking['flight_number'],
    'departure' => $booking['departure'],
    'arrival' => $booking['arrival'],
    'date' => $booking['date'],
    'time' => $booking['time'],
    'duration' => $booking['duration'],
    'passengers' => $booking['passengers'],
    'total_price' => floatval($booking['total_price']),
    'booking_date' => $booking['booking_date'],
    'status' => $booking['status'],
];

sendResponse(true, 'Booking details retrieved successfully', $bookingData);
?>
