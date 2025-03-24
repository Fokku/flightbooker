
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

setApiHeaders();

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
}

// Get flight ID
if (!isset($_GET['id'])) {
    sendResponse(false, 'Flight ID is required');
}

$id = (int)$_GET['id'];

// Connect to database
$conn = connectDB();

// Get flight details
$stmt = $conn->prepare("SELECT * FROM flights WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    closeDB($conn);
    sendResponse(false, 'Flight not found');
}

$flight = $result->fetch_assoc();
$stmt->close();
closeDB($conn);

sendResponse(true, 'Flight details retrieved successfully', $flight);
?>
