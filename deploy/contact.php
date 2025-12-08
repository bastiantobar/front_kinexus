<?php
// contact.php
// Simple contact endpoint to receive POST from the Angular frontend
// Usage: upload this file to the public root (e.g. public_html/contact.php) on your cPanel hosting.

header('Content-Type: application/json; charset=utf-8');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([ 'success' => false, 'message' => 'Method not allowed' ]);
    exit;
}

// Basic honeypot anti-spam (field not present in form, optional)
if (!empty($_POST['hp_field'])) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Spam detected' ]);
    exit;
}

// Get and sanitize inputs
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
$phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Faltan datos requeridos' ]);
    exit;
}

$to = 'felipe.reyes@ki-nexus.cl'; // destination address
$subject = 'Consulta desde web - Kinexus';

$body = "Nuevo mensaje desde el formulario de contacto:\n\n";
$body .= "Nombre: $name\n";
$body .= "Email: $email\n";
$body .= "Teléfono: $phone\n\n";
$body .= "Mensaje:\n$message\n";

$headers = [];
$headers[] = 'From: ' . $name . ' <' . $email . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

// If running on localhost (development), write to a log file instead of sending email
$isLocal = in_array(@$_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1']);
if ($isLocal) {
    $logFile = __DIR__ . '/contact.log';
    $entry = '[' . date('c') . '] ' . json_encode([ 'name' => $name, 'email' => $email, 'phone' => $phone, 'message' => $message ]) . "\n";
    @file_put_contents($logFile, $entry, FILE_APPEND);
    echo json_encode([ 'success' => true, 'message' => 'Modo desarrollo: la consulta fue registrada en contact.log' ]);
    exit;
}

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([ 'success' => true, 'message' => 'Tu consulta fue enviada correctamente.' ]);
} else {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'message' => 'Ocurrió un error al enviar el correo.' ]);
}

?>