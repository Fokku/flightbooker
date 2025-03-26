<?php
// Database configuration
define('DB_HOST', '127.0.0.1'); // Using IP instead of localhost
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'flight_booking');

// Create database connection
function connectDB()
{
    try {
        error_log("Connecting to database: host=" . DB_HOST . ", user=" . DB_USER . ", database=" . DB_NAME);

        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        // Check connection
        if ($conn->connect_error) {
            error_log("Database connection failed: " . $conn->connect_error);
            error_log("Connection info: host=" . DB_HOST . ", user=" . DB_USER . ", database=" . DB_NAME);
            return false;
        }

        // For debugging, log successful connection
        error_log("Database connection successful");

        // Set timezone to UTC for consistent time handling
        $conn->query("SET time_zone = '+00:00'");

        // Enable error reporting on all SQL queries
        $conn->query("SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO'");

        return $conn;
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        return false;
    }
}

// Close database connection
function closeDB($conn)
{
    if ($conn) {
        $conn->close();
    }
}

// Function to safely execute a query with error logging
function safeQuery($conn, $query, $params = [], $types = "")
{
    try {
        if (!$conn) {
            error_log("Cannot execute query: Database connection is null");
            return false;
        }

        error_log("Executing query: " . $query);
        if (count($params) > 0) {
            error_log("Query parameters: " . json_encode($params));
        }

        $stmt = $conn->prepare($query);
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            return false;
        }

        if ($types && count($params) > 0) {
            $stmt->bind_param($types, ...$params);
        }

        $success = $stmt->execute();
        if (!$success) {
            error_log("Execute failed: " . $stmt->error);
            $stmt->close();
            return false;
        }

        $result = $stmt->get_result();
        $stmt->close();

        return $result;
    } catch (Exception $e) {
        error_log("Query execution error: " . $e->getMessage());
        return false;
    }
}
