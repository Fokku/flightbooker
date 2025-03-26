<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

// Connect to database
$conn = connectDB();

if (!$conn) {
    die("Database connection failed. Please check your configuration.\n");
}

echo "Starting database schema update...\n";

// Load the SQL from update_schema.sql
$sql = file_get_contents(__DIR__ . '/update_schema.sql');
if (!$sql) {
    die("Could not read the update_schema.sql file.\n");
}

// Run each query in the SQL file
// Split SQL script on semicolons
$sqlQueries = explode(';', $sql);

// Execute each query
foreach ($sqlQueries as $query) {
    // Skip empty queries
    if (trim($query) == '') {
        continue;
    }

    echo "Executing query: " . substr(trim($query), 0, 80) . "...\n";

    if ($conn->query($query) === TRUE) {
        echo "Query executed successfully.\n";
    } else {
        echo "Error executing query: " . $conn->error . "\n";
    }
}

echo "Database schema update completed.\n";

// Close connection
closeDB($conn);
echo "Done.\n";
