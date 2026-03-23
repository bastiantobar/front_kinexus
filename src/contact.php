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
    
    $service = isset($_POST['service']) ? strip_tags(trim($_POST['service'])) : '';
    $region = isset($_POST['region']) ? strip_tags(trim($_POST['region'])) : '';
    $company = isset($_POST['company']) ? strip_tags(trim($_POST['company'])) : '';
    $role = isset($_POST['role']) ? strip_tags(trim($_POST['role'])) : '';
    $branches = isset($_POST['branches']) ? strip_tags(trim($_POST['branches'])) : '';
    $workers = isset($_POST['workers']) ? strip_tags(trim($_POST['workers'])) : '';
    $message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

    // Validaciones básicas
    if (empty($name) || empty($email) || empty($phone) || empty($service) || empty($region) || empty($company) || empty($role) || empty($branches) || empty($workers)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Por favor, completa todos los campos obligatorios."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El correo electrónico proporcionado no es válido."]);
        exit;
    }

    // Configuración del correo
    $recipient = "felipe.reyes@ki-nexus.cl";
    $subject = "Ha ingresado una cotización de: $company";

    // Contenido del email
    $email_content = "Has recibido una nueva cotización desde el sitio web de Kinexus.\n\n";
    $email_content .= "========================\n";
    $email_content .= "DETALLES DEL CLIENTE\n";
    $email_content .= "========================\n";
    $email_content .= "Nombre: $name\n";
    $email_content .= "Empresa: $company\n";
    $email_content .= "Cargo: $role\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Teléfono: $phone\n";
    $email_content .= "Región: $region\n\n";
    
    $email_content .= "========================\n";
    $email_content .= "DETALLES DEL SERVICIO\n";
    $email_content .= "========================\n";
    $email_content .= "Servicio de interés: $service\n";
    $email_content .= "Número de sucursales: $branches\n";
    $email_content .= "Número de beneficiarios / trabajadores: $workers\n\n";

    if (!empty($message)) {
        $email_content .= "========================\n";
        $email_content .= "MENSAJE / CÓMO PODEMOS AYUDAR\n";
        $email_content .= "========================\n";
        $email_content .= "$message\n\n";
    }

    // Cabeceras del email
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Enviar el correo
    if (mail($recipient, $subject, $email_content, $email_headers)) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Gracias por cotizar con nosotros, la propuesta llegará a tu correo en las próximas 72 horas."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Ocurrió un error en el servidor al intentar enviar el mensaje."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
}
?>
