<?php
require_once 'config/config.php';
require_once 'config/database.php';

echo "Testing database connection and bookings data...\n\n";

// Connect to database
$conn = connectDB();

if (!$conn) {
    die("Database connection failed. Please check your configuration.\n");
}

echo "Database connection successful\n\n";

// Check bookings table
echo "BOOKINGS TABLE STRUCTURE:\n";
$result = $conn->query("DESCRIBE bookings");
if ($result) {
    echo "Column | Type\n";
    echo "------------------------\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
} else {
    echo "Error describing bookings table: " . $conn->error . "\n";
}

echo "\n\nBOOKINGS DATA (limited to 5 rows):\n";
$result = $conn->query("SELECT * FROM bookings LIMIT 5");
if ($result) {
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "Booking ID: " . $row['id'] . "\n";
            echo "User ID: " . $row['user_id'] . "\n";
            echo "Flight ID: " . $row['flight_id'] . "\n";
            echo "Status: " . $row['status'] . "\n";
            echo "Passengers: " . $row['passengers'] . "\n";
            echo "Total Price: " . $row['total_price'] . "\n";
            echo "Booking Date: " . $row['booking_date'] . "\n";
            echo "------------------------\n";
        }
    } else {
        echo "No bookings found in the database.\n";
    }
} else {
    echo "Error fetching bookings: " . $conn->error . "\n";
}

// Check flights table
echo "\n\nFLIGHTS TABLE STRUCTURE:\n";
$result = $conn->query("DESCRIBE flights");
if ($result) {
    echo "Column | Type\n";
    echo "------------------------\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
} else {
    echo "Error describing flights table: " . $conn->error . "\n";
}

echo "\n\nFLIGHTS DATA (limited to 5 rows):\n";
$result = $conn->query("SELECT * FROM flights LIMIT 5");
if ($result) {
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo "Flight ID: " . $row['id'] . "\n";
            echo "Flight Number: " . $row['flight_number'] . "\n";
            echo "Airline: " . $row['airline'] . "\n";
            echo "Departure: " . $row['departure'] . "\n";
            echo "Arrival: " . $row['arrival'] . "\n";
            echo "Date: " . $row['date'] . "\n";
            echo "Time: " . $row['time'] . "\n";
            echo "------------------------\n";
        }
    } else {
        echo "No flights found in the database.\n";
    }
} else {
    echo "Error fetching flights: " . $conn->error . "\n";
}

// Close connection
closeDB($conn);
echo "Done.\n";
