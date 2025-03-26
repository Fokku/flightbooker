<?php
// Direct test of user bookings functionality without including the API endpoint file

require_once 'config/config.php';
require_once 'config/database.php';

echo "Starting direct test of user bookings functionality...\n\n";

// Set up logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/app.log');
error_log("TEST - Starting direct test");

// Mock a user ID for testing
$userId = 4; // This should exist in your database

// Function to safely retrieve values
function getValue($array, $key, $default = null)
{
    return isset($array[$key]) ? $array[$key] : $default;
}

// Connect to the database
$conn = connectDB();
if (!$conn) {
    die("Database connection failed");
}

// Query for user bookings
$query = "
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
";

echo "Running SQL query:\n$query\n\n";
error_log("TEST - SQL Query: " . str_replace("\n", " ", $query));

// Prepare and execute the query
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userId);
$success = $stmt->execute();

if (!$success) {
    echo "Query execution failed: " . $stmt->error . "\n";
    error_log("TEST - Query execution failed: " . $stmt->error);
    exit;
}

$result = $stmt->get_result();
echo "Found " . $result->num_rows . " bookings for user ID: $userId\n\n";
error_log("TEST - Found " . $result->num_rows . " bookings");

// Process results
if ($result->num_rows > 0) {
    echo "BOOKINGS FOUND:\n";
    echo "----------------------------------------\n";

    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $isFlightFound = !empty($row['flight_number']);

        // Print booking details
        echo "Booking ID: " . $row['id'] . "\n";
        echo "Flight ID: " . $row['flight_id'] . "\n";
        echo "Flight Number: " . ($isFlightFound ? $row['flight_number'] : "Unknown") . "\n";
        echo "Airline: " . ($isFlightFound ? $row['airline'] : "Unknown Airline") . "\n";
        echo "Route: " . ($isFlightFound ? $row['departure'] . " to " . $row['arrival'] : "Unknown route") . "\n";
        echo "Date/Time: " . ($isFlightFound ? $row['departure_date'] . " " . $row['departure_time'] : "Unknown date/time") . "\n";
        echo "Passengers: " . $row['passengers'] . "\n";
        echo "Status: " . $row['status'] . "\n";
        echo "Price: $" . $row['total_price'] . "\n";
        echo "Booked on: " . $row['booking_date'] . "\n";
        echo "----------------------------------------\n";

        // Create the data structure like the API would
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

    // Show the JSON that would be returned by the API
    echo "\nAPI JSON RESPONSE:\n";
    echo "----------------------------------------\n";
    echo json_encode(['status' => true, 'message' => 'Bookings retrieved successfully', 'data' => $bookings], JSON_PRETTY_PRINT);
    echo "\n----------------------------------------\n";
} else {
    echo "No bookings found for user ID: $userId\n";
}

// Clean up
$stmt->close();
closeDB($conn);
echo "\nTest completed.\n";
