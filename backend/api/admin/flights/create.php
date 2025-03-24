
<?php
require_once '../../../config/config.php';
require_once '../../../config/database.php';
require_once '../../../includes/auth.php';

setApiHeaders();

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is admin
if (!Auth::isAdmin()) {
    sendResponse(false, 'Unauthorized - Admin access required');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['flight_number']) || !isset($data['departure']) || !isset($data['arrival']) || 
    !isset($data['date']) || !isset($data['time']) || !isset($data['price'])) {
    sendResponse(false, 'Missing required fields');
}

$flightNumber = sanitizeInput($data['flight_number']);
$flightApi = isset($data['flight_api']) ? sanitizeInput($data['flight_api']) : null;
$departure = sanitizeInput($data['departure']);
$arrival = sanitizeInput($data['arrival']);
$date = sanitizeInput($data['date']);
$time = sanitizeInput($data['time']);
$duration = isset($data['duration']) ? (int)$data['duration'] : 0;
$price = (float)$data['price'];
$availableSeats = isset($data['available_seats']) ? (int)$data['available_seats'] : 100;
$airline = isset($data['airline']) ? sanitizeInput($data['airline']) : null;
$departureGate = isset($data['departure_gate']) ? sanitizeInput($data['departure_gate']) : null;
$arrivalGate = isset($data['arrival_gate']) ? sanitizeInput($data['arrival_gate']) : null;
$departureTerminal = isset($data['departure_terminal']) ? sanitizeInput($data['departure_terminal']) : null;
$arrivalTerminal = isset($data['arrival_terminal']) ? sanitizeInput($data['arrival_terminal']) : null;
$status = isset($data['status']) ? sanitizeInput($data['status']) : 'scheduled';

// Connect to database
$conn = connectDB();

// Check if flight already exists
$stmt = $conn->prepare("SELECT id FROM flights WHERE flight_number = ? AND date = ?");
$stmt->bind_param("ss", $flightNumber, $date);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Flight with this number and date already exists');
}

$stmt->close();

// Insert flight
$stmt = $conn->prepare("
    INSERT INTO flights (
        flight_number, flight_api, departure, arrival, date, time, duration, 
        price, available_seats, airline, departure_gate, arrival_gate, 
        departure_terminal, arrival_terminal, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "ssssssiissssss", 
    $flightNumber, $flightApi, $departure, $arrival, $date, $time, $duration, 
    $price, $availableSeats, $airline, $departureGate, $arrivalGate, 
    $departureTerminal, $arrivalTerminal, $status
);
$success = $stmt->execute();

if (!$success) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Failed to create flight: ' . $stmt->error);
}

$flightId = $stmt->insert_id;
$stmt->close();
closeDB($conn);

sendResponse(true, 'Flight created successfully', ['flight_id' => $flightId]);
?>
