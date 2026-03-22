<?php
// Permitir peticiones CORS si se desarrolla en local/puertos distintos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recolectar datos del formulario
    $name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
    $message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

    // Validaciones básicas
    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Por favor, completa todos los campos obligatorios (Nombre, Email, Mensaje)."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El correo electrónico proporcionado no es válido."]);
        exit;
    }

    // Configuración del correo
    $recipient = "felipe.reyes@ki-nexus.cl";
    $subject = "Nueva consulta web de: $name";

    // Contenido del email
    $email_content = "Has recibido un nuevo mensaje desde el sitio web de Kinexus.\n\n";
    $email_content .= "Detalles del contacto:\n";
    $email_content .= "Nombre: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Teléfono: $phone\n\n";
    $email_content .= "Mensaje:\n$message\n";

    // Cabeceras del email
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Enviar el correo
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Gracias — tu consulta ha sido enviada exitosamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Ocurrió un error en el servidor al intentar enviar el mensaje."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
}
?>
