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

    // Contenido HTML del email
    $email_content = "
    <!DOCTYPE html>
    <html lang='es'>
    <head>
      <meta charset='UTF-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <style>
        body { font-family: 'Arial', sans-serif; background-color: #f5f8f0; color: #263320; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .header { background: #648C34; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; text-transform: uppercase; }
        .content { padding: 30px; }
        .section-title { color: #4e6e28; font-size: 16px; border-bottom: 2px solid #e8f0de; padding-bottom: 8px; margin-top: 0; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .grid-full { grid-column: 1 / -1; margin-bottom: 15px; }
        .label { font-weight: bold; color: #5e7250; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .value { font-size: 15px; color: #263320; margin: 0; background: #fdfdfd; padding: 10px 14px; border-radius: 6px; border: 1px solid #e8f0de; }
        .message-box { font-size: 15px; color: #263320; margin: 0; background: #f9fbf4; padding: 15px; border-radius: 8px; border: 1px solid #dce8ce; white-space: pre-wrap; line-height: 1.5; }
        .footer { background: #263320; text-align: center; padding: 20px; font-size: 13px; color: #e8f0de; }
      </style>
    </head>
    <body>
      <div class='email-container'>
        <div class='header'>
          <h1>Nueva Cotización - Ki-Nexus</h1>
        </div>
        <div class='content'>
          <h2 class='section-title'>Detalles del Cliente</h2>
          
          <div class='grid-full'>
            <span class='label'>Empresa</span>
            <p class='value'><strong>$company</strong></p>
          </div>
          
          <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom: 30px;'>
            <tr>
              <td width='50%' style='padding-right: 10px; padding-bottom: 15px;'>
                <span class='label'>Nombre Contacto</span>
                <p class='value'>$name</p>
              </td>
              <td width='50%' style='padding-left: 10px; padding-bottom: 15px;'>
                <span class='label'>Cargo</span>
                <p class='value'>$role</p>
              </td>
            </tr>
            <tr>
              <td width='50%' style='padding-right: 10px; padding-bottom: 15px;'>
                <span class='label'>Email</span>
                <p class='value'>$email</p>
              </td>
              <td width='50%' style='padding-left: 10px; padding-bottom: 15px;'>
                <span class='label'>Teléfono</span>
                <p class='value'>$phone</p>
              </td>
            </tr>
            <tr>
              <td colspan='2' style='padding-bottom: 15px;'>
                <span class='label'>Región</span>
                <p class='value'>$region</p>
              </td>
            </tr>
          </table>

          <h2 class='section-title'>Detalles del Servicio</h2>
          
          <div class='grid-full'>
            <span class='label'>Servicio de Interés</span>
            <p class='value' style='border-left: 4px solid #648C34; font-weight: bold;'>$service</p>
          </div>
          
          <table width='100%' cellpadding='0' cellspacing='0' style='margin-bottom: 30px;'>
            <tr>
              <td width='50%' style='padding-right: 10px;'>
                <span class='label'>Número de Sucursales</span>
                <p class='value'>$branches</p>
              </td>
              <td width='50%' style='padding-left: 10px;'>
                <span class='label'>Beneficiarios / Trabajadores</span>
                <p class='value'>$workers</p>
              </td>
            </tr>
          </table>";

    if (!empty($message)) {
        $email_content .= "
          <h2 class='section-title'>Mensaje / Cómo podemos ayudar</h2>
          <div class='message-box'>$message</div>";
    }

    $email_content .= "
        </div>
        <div class='footer'>
          Este correo ha sido generado automáticamente desde el formulario web.
        </div>
      </div>
    </body>
    </html>";

    // Cabeceras del email para HTML
    $email_headers = "From: $name <$email>\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "MIME-Version: 1.0\r\n";
    $email_headers .= "Content-Type: text/html; charset=UTF-8\r\n";

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
