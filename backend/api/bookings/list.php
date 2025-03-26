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
    SELECT b.*, f.flight_number, f.departure, f.arrival, f.date, f.time, f.airline, f.duration
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
    // Calculate arrival time based on departure time and duration
    $departure_time = strtotime($row['time']);
    $arrival_time = $departure_time + ($row['duration'] * 60);

    $bookings[] = [
        'id' => $row['id'],
        'booking_id' => $row['id'], // Using id as booking_id since we don't have a separate field
        'flight_id' => $row['flight_id'],
        'flight_number' => $row['flight_number'],
        'airline' => $row['airline'],
        'departure' => $row['departure'],
        'arrival' => $row['arrival'],
        'departure_date' => $row['date'],
        'departure_time' => date('h:i A', $departure_time),
        'arrival_time' => date('h:i A', $arrival_time),
        'passengers' => $row['passengers'],
        'status' => $row['status'],
        'total_price' => $row['total_price'],
        'booking_date' => $row['booking_date']
    ];
}

$stmt->close();
closeDB($conn);

sendResponse(true, 'Bookings retrieved successfully', $bookings);
