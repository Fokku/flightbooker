
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

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
if (!isset($data['flight_id']) || !isset($data['passengers']) || !isset($data['customer_name']) || 
    !isset($data['customer_email']) || !isset($data['customer_phone'])) {
    sendResponse(false, 'Missing required fields');
}

$flightId = sanitizeInput($data['flight_id']);
$returnFlightId = isset($data['return_flight_id']) ? sanitizeInput($data['return_flight_id']) : '';
$flightApi = isset($data['flight_api']) ? sanitizeInput($data['flight_api']) : null;
$passengers = (int)$data['passengers'];
$customerName = sanitizeInput($data['customer_name']);
$customerEmail = sanitizeInput($data['customer_email']);
$customerPhone = sanitizeInput($data['customer_phone']);

// Connect to database
$conn = connectDB();

// Check if flight exists and has enough seats
$stmt = $conn->prepare("SELECT id, price, available_seats FROM flights WHERE id = ?");
$stmt->bind_param("i", $flightId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Flight not found');
}

$flight = $result->fetch_assoc();
$stmt->close();

if ($flight['available_seats'] < $passengers) {
    closeDB($conn);
    sendResponse(false, 'Not enough seats available');
}

// Calculate total price
$totalPrice = $flight['price'] * $passengers;

// Create booking
$stmt = $conn->prepare("INSERT INTO bookings (user_id, flight_id, return_flight_id, flight_api, passengers, total_price, customer_name, customer_email, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssiisss", $user['id'], $flightId, $returnFlightId, $flightApi, $passengers, $totalPrice, $customerName, $customerEmail, $customerPhone);
$success = $stmt->execute();

if (!$success) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Failed to create booking');
}

$bookingId = $stmt->insert_id;
$stmt->close();

// Update available seats
$newAvailableSeats = $flight['available_seats'] - $passengers;
$stmt = $conn->prepare("UPDATE flights SET available_seats = ? WHERE id = ?");
$stmt->bind_param("ii", $newAvailableSeats, $flightId);
$stmt->execute();
$stmt->close();

closeDB($conn);

sendResponse(true, 'Booking created successfully', ['booking_id' => $bookingId]);
?>
