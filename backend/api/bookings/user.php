<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to the browser
ini_set('log_errors', 1);
ini_set('error_log', dirname(dirname(__DIR__)) . '/logs/app.log');

// Log the start of this request
error_log("Starting user bookings API endpoint");

setApiHeaders();

// Function to safely retrieve a value from array or return default
function getValue($array, $key, $default = null)
{
    return isset($array[$key]) ? $array[$key] : $default;
}

try {
    // Check if request method is GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
        sendResponse(false, 'Invalid request method');
        exit;
    }

    // Check if user is logged in
    if (!Auth::isLoggedIn()) {
        error_log("User not logged in - redirecting to login");
        sendResponse(false, 'Unauthorized', ['redirect' => '/login']);
        exit;
    }

    // Get current user
    $user = Auth::getCurrentUser();
    error_log("Getting bookings for user ID: " . $user['id']);

    // Connect to database
    $conn = connectDB();
    if (!$conn) {
        error_log("Database connection failed");
        sendResponse(false, 'Database connection error');
        exit;
    }

    // Simplified, direct query that works based on testing
    $stmt = $conn->prepare("
        SELECT 
            b.id, 
            b.id as booking_id, 
            b.flight_id, 
            f.flight_number, 
            f.airline,
            f.departure, 
            f.arrival, 
            f.date as departure_date, 
            f.time as departure_time,
            f.time as arrival_time, 
            b.passengers, 
            b.status, 
            b.total_price, 
            b.booking_date
        FROM bookings b
        LEFT JOIN flights f ON CAST(b.flight_id AS UNSIGNED) = f.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
    ");

    // Log the query
    error_log("SQL Query: " . str_replace("\n", " ", "SELECT b.id, b.id as booking_id, b.flight_id, f.flight_number, f.airline, f.departure, f.arrival, f.date as departure_date, f.time as departure_time, f.time as arrival_time, b.passengers, b.status, b.total_price, b.booking_date FROM bookings b LEFT JOIN flights f ON CAST(b.flight_id AS UNSIGNED) = f.id WHERE b.user_id = ?"));
    error_log("User ID parameter: " . $user['id']);

    $stmt->bind_param("i", $user['id']);
    $success = $stmt->execute();

    if (!$success) {
        error_log("SQL execution error: " . $stmt->error);
        sendResponse(false, 'Error retrieving bookings');
        exit;
    }

    $result = $stmt->get_result();
    error_log("Found " . $result->num_rows . " bookings");

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        // Check if flight details were found
        $isFlightFound = !empty($row['flight_number']);

        // Format the data to match the frontend's expected structure
        $bookings[] = [
            'id' => getValue($row, 'id'),
            'booking_id' => getValue($row, 'booking_id'),
            'flight_id' => getValue($row, 'flight_id'),
            'flight_number' => $isFlightFound ? getValue($row, 'flight_number') : 'Unknown',
            'airline' => $isFlightFound ? getValue($row, 'airline') : 'Unknown Airline',
            'departure' => $isFlightFound ? getValue($row, 'departure') : 'Unknown',
            'arrival' => $isFlightFound ? getValue($row, 'arrival') : 'Unknown',
            'departure_date' => $isFlightFound ? getValue($row, 'departure_date') : date('Y-m-d'),
            'departure_time' => $isFlightFound ? getValue($row, 'departure_time') : '00:00:00',
            'arrival_time' => $isFlightFound ? getValue($row, 'arrival_time') : '00:00:00',
            'passengers' => getValue($row, 'passengers', 1),
            'status' => getValue($row, 'status', 'unknown'),
            'total_price' => getValue($row, 'total_price', 0),
            'booking_date' => getValue($row, 'booking_date', date('Y-m-d H:i:s'))
        ];
    }

    $stmt->close();
    closeDB($conn);

    error_log("Successfully retrieved " . count($bookings) . " bookings");
    sendResponse(true, 'Bookings retrieved successfully', $bookings);
} catch (Exception $e) {
    error_log("Exception caught: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendResponse(false, 'An error occurred while retrieving bookings');
}
