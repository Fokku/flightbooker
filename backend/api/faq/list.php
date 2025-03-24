
<?php
require_once '../../config/config.php';
require_once '../../config/database.php';

setApiHeaders();

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(false, 'Invalid request method');
}

// Connect to database
$conn = connectDB();

// Get FAQs
$stmt = $conn->prepare("SELECT * FROM faq ORDER BY display_order ASC");
$stmt->execute();
$result = $stmt->get_result();

$faqs = [];
while ($row = $result->fetch_assoc()) {
    $faqs[] = $row;
}

$stmt->close();
closeDB($conn);

sendResponse(true, 'FAQs retrieved successfully', $faqs);
?>
