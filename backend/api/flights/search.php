
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

setApiHeaders();

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
}

// Get query parameters
$departure = isset($_GET['departure']) ? sanitizeInput($_GET['departure']) : null;
$arrival = isset($_GET['arrival']) ? sanitizeInput($_GET['arrival']) : null;
$date = isset($_GET['date']) ? sanitizeInput($_GET['date']) : null;
$passengers = isset($_GET['passengers']) ? (int)$_GET['passengers'] : 1;

// Connect to database
$conn = connectDB();

// Build query
$query = "SELECT * FROM flights WHERE 1=1";
$params = [];
$types = "";

if ($departure) {
    $query .= " AND departure LIKE ?";
    $departureParam = "%$departure%";
    $params[] = &$departureParam;
    $types .= "s";
}

if ($arrival) {
    $query .= " AND arrival LIKE ?";
    $arrivalParam = "%$arrival%";
    $params[] = &$arrivalParam;
    $types .= "s";
}

if ($date) {
    $query .= " AND date = ?";
    $params[] = &$date;
    $types .= "s";
}

$query .= " AND available_seats >= ?";
$params[] = &$passengers;
$types .= "i";

$query .= " ORDER BY date ASC, time ASC";

// Prepare and execute query
$stmt = $conn->prepare($query);

if ($types && $params) {
    $stmt->bind_param($types, ...$params);
}

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
