
<?php
require_once '../../../config/config.php';
require_once '../../../config/database.php';
require_once '../../../includes/auth.php';

setApiHeaders();

// Check if request method is PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    sendResponse(false, 'Invalid request method');
}

// Check if user is admin
if (!Auth::isAdmin()) {
    sendResponse(false, 'Unauthorized - Admin access required');
}

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['id'])) {
    sendResponse(false, 'Flight ID is required');
}

$id = (int)$data['id'];
$flightNumber = isset($data['flight_number']) ? sanitizeInput($data['flight_number']) : null;
$flightApi = isset($data['flight_api']) ? sanitizeInput($data['flight_api']) : null;
$departure = isset($data['departure']) ? sanitizeInput($data['departure']) : null;
$arrival = isset($data['arrival']) ? sanitizeInput($data['arrival']) : null;
$date = isset($data['date']) ? sanitizeInput($data['date']) : null;
$time = isset($data['time']) ? sanitizeInput($data['time']) : null;
$duration = isset($data['duration']) ? (int)$data['duration'] : null;
$price = isset($data['price']) ? (float)$data['price'] : null;
$availableSeats = isset($data['available_seats']) ? (int)$data['available_seats'] : null;
$airline = isset($data['airline']) ? sanitizeInput($data['airline']) : null;
$departureGate = isset($data['departure_gate']) ? sanitizeInput($data['departure_gate']) : null;
$arrivalGate = isset($data['arrival_gate']) ? sanitizeInput($data['arrival_gate']) : null;
$departureTerminal = isset($data['departure_terminal']) ? sanitizeInput($data['departure_terminal']) : null;
$arrivalTerminal = isset($data['arrival_terminal']) ? sanitizeInput($data['arrival_terminal']) : null;
$status = isset($data['status']) ? sanitizeInput($data['status']) : null;

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

// Build update query
$updates = [];
$params = [];
$types = "";

if ($flightNumber !== null) {
    $updates[] = "flight_number = ?";
    $params[] = $flightNumber;
    $types .= "s";
}

if ($flightApi !== null) {
    $updates[] = "flight_api = ?";
    $params[] = $flightApi;
    $types .= "s";
}

if ($departure !== null) {
    $updates[] = "departure = ?";
    $params[] = $departure;
    $types .= "s";
}

if ($arrival !== null) {
    $updates[] = "arrival = ?";
    $params[] = $arrival;
    $types .= "s";
}

if ($date !== null) {
    $updates[] = "date = ?";
    $params[] = $date;
    $types .= "s";
}

if ($time !== null) {
    $updates[] = "time = ?";
    $params[] = $time;
    $types .= "s";
}

if ($duration !== null) {
    $updates[] = "duration = ?";
    $params[] = $duration;
    $types .= "i";
}

if ($price !== null) {
    $updates[] = "price = ?";
    $params[] = $price;
    $types .= "d";
}

if ($availableSeats !== null) {
    $updates[] = "available_seats = ?";
    $params[] = $availableSeats;
    $types .= "i";
}

if ($airline !== null) {
    $updates[] = "airline = ?";
    $params[] = $airline;
    $types .= "s";
}

if ($departureGate !== null) {
    $updates[] = "departure_gate = ?";
    $params[] = $departureGate;
    $types .= "s";
}

if ($arrivalGate !== null) {
    $updates[] = "arrival_gate = ?";
    $params[] = $arrivalGate;
    $types .= "s";
}

if ($departureTerminal !== null) {
    $updates[] = "departure_terminal = ?";
    $params[] = $departureTerminal;
    $types .= "s";
}

if ($arrivalTerminal !== null) {
    $updates[] = "arrival_terminal = ?";
    $params[] = $arrivalTerminal;
    $types .= "s";
}

if ($status !== null) {
    $updates[] = "status = ?";
    $params[] = $status;
    $types .= "s";
}

if (empty($updates)) {
    closeDB($conn);
    sendResponse(false, 'No fields to update');
}

// Add ID to params
$params[] = $id;
$types .= "i";

// Update flight
$query = "UPDATE flights SET " . implode(", ", $updates) . " WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);
$success = $stmt->execute();

$stmt->close();
closeDB($conn);

if ($success) {
    sendResponse(true, 'Flight updated successfully');
} else {
    sendResponse(false, 'Failed to update flight');
}
?>
