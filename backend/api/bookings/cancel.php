<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../config/cors.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is logged in
if (!Auth::isLoggedIn()) {
    sendResponse(false, 'Unauthorized', ['redirect' => '/login']);
}

// Get current user
$user = Auth::getCurrentUser();

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['id'])) {
    sendResponse(false, 'Missing booking ID');
}

$bookingId = (int)$data['id'];

// Connect to database
$conn = connectDB();

// Check if booking exists and belongs to user
$stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $bookingId, $user['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Booking not found or does not belong to you');
}

$booking = $result->fetch_assoc();
$stmt->close();

// Check if booking can be canceled (not in the past)
$flightId = $booking['flight_id'];
$stmt = $conn->prepare("SELECT date FROM flights WHERE id = ?");
$stmt->bind_param("i", $flightId);
$stmt->execute();
$flightResult = $stmt->get_result();
$flight = $flightResult->fetch_assoc();
$stmt->close();

$departureDate = new DateTime($flight['date']);
$now = new DateTime();

if ($departureDate < $now) {
    closeDB($conn);
    sendResponse(false, 'Cannot cancel a past booking');
}

// Update booking status to canceled
$status = 'canceled';
$stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $bookingId);
$success = $stmt->execute();
$stmt->close();

if (!$success) {
    closeDB($conn);
    sendResponse(false, 'Failed to cancel booking');
}

// Update flight available seats
$passengers = $booking['passengers'];
$stmt = $conn->prepare("UPDATE flights SET available_seats = available_seats + ? WHERE id = ?");
$stmt->bind_param("ii", $passengers, $flightId);
$stmt->execute();
$stmt->close();

closeDB($conn);

sendResponse(true, 'Booking canceled successfully');
