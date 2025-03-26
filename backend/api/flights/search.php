<?php
require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../config/cors.php';

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

setApiHeaders();

// Aviation Stack API configuration
define('AVIATION_STACK_API_KEY', 'YOUR_API_KEY'); // Replace with your API key
define('AVIATION_STACK_API_URL', 'https://api.aviationstack.com/v1/flights');

// Check if request method is POST or GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON data for POST request
    $data = json_decode(file_get_contents('php://input'), true);

    // Log received data
    error_log("POST data received: " . json_encode($data));

    // Get parameters from JSON data
    $departure = isset($data['departure']) ? sanitizeInput($data['departure']) : null;
    $destination = isset($data['destination']) ? sanitizeInput($data['destination']) : null;
    $departureDate = isset($data['departureDate']) ? sanitizeInput($data['departureDate']) : null;
    $returnDate = isset($data['returnDate']) ? sanitizeInput($data['returnDate']) : null;
    $passengers = isset($data['passengers']) ? (int)$data['passengers'] : 1;
    $class = isset($data['class']) ? sanitizeInput($data['class']) : 'economy';
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get parameters from query string for GET request
    $departure = isset($_GET['departure']) ? sanitizeInput($_GET['departure']) : null;
    $destination = isset($_GET['destination']) ? sanitizeInput($_GET['destination']) : null;
    $departureDate = isset($_GET['departureDate']) ? sanitizeInput($_GET['departureDate']) : null;
    $returnDate = isset($_GET['returnDate']) ? sanitizeInput($_GET['returnDate']) : null;
    $passengers = isset($_GET['passengers']) ? (int)$_GET['passengers'] : 1;
    $class = isset($_GET['class']) ? sanitizeInput($_GET['class']) : 'economy';
} else {
    sendResponse(false, 'Invalid request method');
}

// Log search parameters
error_log("Flight search parameters: " . json_encode([
    'departure' => $departure,
    'destination' => $destination,
    'departureDate' => $departureDate,
    'passengers' => $passengers
]));

// Validate required parameters
if (!$departure || !$destination || !$departureDate) {
    // Return all flights if no search parameters are provided
    error_log("No search parameters provided, returning all flights");
    $allFlights = getAllFlightsFromDatabase();

    if (is_array($allFlights) && count($allFlights) > 0) {
        sendResponse(true, 'All flights retrieved successfully', $allFlights);
    } else {
        sendResponse(true, 'No flights found in the database', []);
    }
    exit;
}

// Try to get flights from Aviation Stack API first
$apiFlights = getFlightsFromAPI($departure, $destination, $departureDate);

if ($apiFlights === false || empty($apiFlights)) {
    // If API fails, get flights from database
    error_log("API search failed or returned no results, falling back to database");
    $apiFlights = getFlightsFromDatabase($departure, $destination, $departureDate, $passengers);
}

// Log the number of flights found
error_log("Flights found: " . (is_array($apiFlights) ? count($apiFlights) : 0));

if (is_array($apiFlights) && count($apiFlights) > 0) {
    sendResponse(true, 'Flights retrieved successfully', $apiFlights);
} else {
    // Return an empty array instead of false if no flights found
    sendResponse(true, 'No flights found matching your criteria', []);
}

function getFlightsFromAPI($departure, $destination, $date)
{
    // Skip API call if the API key is the placeholder
    if (AVIATION_STACK_API_KEY === 'YOUR_API_KEY') {
        error_log("Aviation Stack API key is not configured, skipping API call");
        return false;
    }

    // Extract airport codes from departure and destination
    $departureCode = extractAirportCode($departure);
    $arrivalCode = extractAirportCode($destination);

    if (!$departureCode || !$arrivalCode) {
        error_log("Could not extract airport codes from: $departure and $destination");
        return false;
    }

    // Build API URL
    $url = AVIATION_STACK_API_URL . '?' . http_build_query([
        'access_key' => AVIATION_STACK_API_KEY,
        'dep_iata' => $departureCode,
        'arr_iata' => $arrivalCode,
        'flight_date' => $date
    ]);

    // Make API request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        error_log("API request failed with HTTP code: $httpCode");
        return false;
    }

    $data = json_decode($response, true);

    if (!isset($data['data']) || empty($data['data'])) {
        error_log("API returned no data or invalid response");
        return false;
    }

    // Format flights for frontend
    $flights = [];
    foreach ($data['data'] as $flight) {
        $flights[] = [
            'id' => $flight['flight']['number'],
            'airline' => $flight['airline']['name'],
            'flightNumber' => $flight['flight']['number'],
            'departure' => $flight['departure']['airport'],
            'arrival' => $flight['arrival']['airport'],
            'departureTime' => date('h:i A', strtotime($flight['departure']['scheduled'])),
            'arrivalTime' => date('h:i A', strtotime($flight['arrival']['scheduled'])),
            'duration' => calculateDuration($flight['departure']['scheduled'], $flight['arrival']['scheduled']),
            'price' => calculatePrice($flight['departure']['airport'], $flight['arrival']['airport']),
            'stops' => 0,
            'availableSeats' => 100,
            'class' => 'economy'
        ];
    }

    return $flights;
}

function getFlightsFromDatabase($departure, $destination, $date, $passengers)
{
    $conn = connectDB();

    if (!$conn) {
        error_log("Database connection failed");
        return [];
    }

    try {
        // Extract the city name without airport code for better matching
        $departureCityOnly = preg_replace('/\s*\([A-Z]{3}\)$/', '', $departure);
        $destinationCityOnly = preg_replace('/\s*\([A-Z]{3}\)$/', '', $destination);

        error_log("Searching for flights from '$departureCityOnly' to '$destinationCityOnly' on date '$date'");

        // First, let's check if we have any flights in the database
        $checkQuery = "SELECT COUNT(*) as count FROM flights";
        $checkResult = $conn->query($checkQuery);
        $countRow = $checkResult->fetch_assoc();
        error_log("Total flights in database: " . $countRow['count']);

        // Get a sample flight to check the format
        $sampleQuery = "SELECT departure, arrival FROM flights LIMIT 1";
        $sampleResult = $conn->query($sampleQuery);
        if ($sampleRow = $sampleResult->fetch_assoc()) {
            error_log("Sample flight format - Departure: " . $sampleRow['departure'] . ", Arrival: " . $sampleRow['arrival']);
        }

        // Build the main query
        $query = "SELECT * FROM flights WHERE 1=1";
        $params = [];
        $types = "";

        // Add departure condition
        if ($departureCityOnly) {
            $query .= " AND (departure LIKE ? OR departure LIKE ?)";
            $params[] = "%$departureCityOnly%";
            $params[] = "%($departureCityOnly)%";
            $types .= "ss";
        }

        // Add destination condition
        if ($destinationCityOnly) {
            $query .= " AND (arrival LIKE ? OR arrival LIKE ?)";
            $params[] = "%$destinationCityOnly%";
            $params[] = "%($destinationCityOnly)%";
            $types .= "ss";
        }

        // Add date condition
        if ($date) {
            $query .= " AND date = ?";
            $params[] = $date;
            $types .= "s";
        }

        // Add available seats condition
        $query .= " AND available_seats >= ?";
        $params[] = $passengers;
        $types .= "i";

        // Order by time
        $query .= " ORDER BY time ASC";

        error_log("Final SQL Query: " . $query);
        error_log("Query Parameters: " . json_encode($params));

        // Prepare and execute query
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            return [];
        }

        if ($types && count($params) > 0) {
            $stmt->bind_param($types, ...$params);
        }

        $execResult = $stmt->execute();
        if (!$execResult) {
            error_log("Execute failed: " . $stmt->error);
            $stmt->close();
            return [];
        }

        $result = $stmt->get_result();
        error_log("Query returned " . $result->num_rows . " rows");

        // Format flights for frontend
        $flights = [];
        while ($row = $result->fetch_assoc()) {
            $flights[] = formatFlightData($row);
        }

        $stmt->close();
        closeDB($conn);

        error_log("Formatted " . count($flights) . " flights for frontend");
        return $flights;
    } catch (Exception $e) {
        error_log("Error in getFlightsFromDatabase: " . $e->getMessage());
        if (isset($conn) && $conn) {
            closeDB($conn);
        }
        return [];
    }
}

function formatFlightData($row)
{
    // Calculate duration string
    $duration_str = floor($row['duration'] / 60) . 'h ' . ($row['duration'] % 60) . 'm';

    // Calculate arrival time by adding duration to departure time
    $departureTime = strtotime($row['time']);
    $arrivalTime = $departureTime + ($row['duration'] * 60);

    // Format flight data
    return [
        'id' => $row['id'],
        'airline' => $row['airline'],
        'flightNumber' => $row['flight_number'],
        'departure' => $row['departure'],
        'arrival' => $row['arrival'],
        'departureTime' => date('h:i A', $departureTime),
        'arrivalTime' => date('h:i A', $arrivalTime),
        'duration' => $duration_str,
        'price' => (float)$row['price'],
        'stops' => 0,
        'availableSeats' => (int)$row['available_seats'],
        'class' => 'economy'
    ];
}

function extractAirportCode($location)
{
    // Extract airport code from location string (e.g., "New York (JFK)" -> "JFK")
    if (preg_match('/\(([A-Z]{3})\)/', $location, $matches)) {
        error_log("Extracted airport code: " . $matches[1] . " from: " . $location);
        return $matches[1];
    }

    error_log("No airport code found in: " . $location);
    // If no airport code found, handle the search differently by returning
    // null to fall back to database search
    return null;
}

function calculateDuration($departure, $arrival)
{
    $departureTime = strtotime($departure);
    $arrivalTime = strtotime($arrival);
    $duration = $arrivalTime - $departureTime;

    $hours = floor($duration / 3600);
    $minutes = floor(($duration % 3600) / 60);

    return $hours . 'h ' . $minutes . 'm';
}

function calculatePrice($departure, $arrival)
{
    // Simple price calculation based on route
    $basePrice = 100;
    $distance = calculateDistance($departure, $arrival);
    return $basePrice + ($distance * 0.1); // $0.10 per mile
}

function calculateDistance($departure, $arrival)
{
    // This is a simplified distance calculation
    // In a real application, you would use actual airport coordinates
    return 500; // Default distance
}

// Add a new function to get all flights from the database
function getAllFlightsFromDatabase()
{
    $conn = connectDB();

    if (!$conn) {
        error_log("Database connection failed");
        return [];
    }

    try {
        // Get all flights ordered by date and time
        $query = "SELECT * FROM flights ORDER BY date ASC, time ASC LIMIT 30";

        error_log("Getting all flights with query: " . $query);

        $result = $conn->query($query);

        if (!$result) {
            error_log("Query failed: " . $conn->error);
            closeDB($conn);
            return [];
        }

        error_log("Query returned " . $result->num_rows . " rows");

        // Format flights for frontend
        $flights = [];
        while ($row = $result->fetch_assoc()) {
            $flights[] = formatFlightData($row);
        }

        closeDB($conn);

        error_log("Formatted " . count($flights) . " flights for frontend");
        return $flights;
    } catch (Exception $e) {
        error_log("Error in getAllFlightsFromDatabase: " . $e->getMessage());
        if (isset($conn) && $conn) {
            closeDB($conn);
        }
        return [];
    }
}
