<?php
// contact.php
// Contact endpoint to receive POST from the Angular frontend.
// Usage: upload this file (and design.png) to the public root (e.g. public_html/) on your cPanel hosting.

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
$name    = isset($_POST['name'])    ? strip_tags(trim($_POST['name']))                              : '';
$email   = isset($_POST['email'])   ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL)      : false;
$phone   = isset($_POST['phone'])   ? strip_tags(trim($_POST['phone']))                             : '';
$service = isset($_POST['service']) ? strip_tags(trim($_POST['service']))                           : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message']))                           : '';

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Faltan datos requeridos' ]);
    exit;
}

$to      = 'felipe.reyes@ki-nexus.cl';
$subject = 'Consulta desde web - Ki-Nexus';

// ── Inline image (footer) ──────────────────────────────────────────────────
$imagePath = __DIR__ . '/design.png';
$imageData = file_exists($imagePath) ? base64_encode(file_get_contents($imagePath)) : '';
$imageCid  = 'kinexus-footer-' . md5($imagePath) . '@ki-nexus.cl';

// ── HTML body ──────────────────────────────────────────────────────────────
$serviceRow = $service
    ? '<tr><td style="padding:6px 0;color:#555;font-family:Arial,sans-serif;font-size:15px;"><strong>Servicio:</strong> ' . htmlspecialchars($service) . '</td></tr>'
    : '';

$messageHtml = nl2br(htmlspecialchars($message));

$htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10);">

          <!-- Header bar -->
          <tr>
            <td style="background:#0a0a0a;padding:20px 30px;">
              <span style="color:#7fc742;font-size:22px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="color:#ffffff;font-size:13px;margin-left:10px;opacity:.7;">Movimiento que nos une</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 30px 20px;">
              <h2 style="margin:0 0 20px;color:#0a0a0a;font-size:20px;">📬 Nueva consulta desde el sitio web</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#555;font-size:15px;"><strong>Nombre:</strong> {$name}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#555;font-size:15px;"><strong>Email:</strong> <a href="mailto:{$email}" style="color:#7fc742;">{$email}</a></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#555;font-size:15px;"><strong>Teléfono:</strong> {$phone}</td>
                </tr>
                {$serviceRow}
              </table>

              <hr style="border:none;border-top:1px solid #ececec;margin:20px 0;">

              <p style="margin:0 0 8px;color:#0a0a0a;font-size:15px;font-weight:700;">Mensaje:</p>
              <p style="margin:0;color:#444;font-size:15px;line-height:1.7;">{$messageHtml}</p>
            </td>
          </tr>

          <!-- Footer image -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="cid:{$imageCid}" alt="Ki-Nexus | Felipe Reyes Montecinos - Fundador"
                   width="600" style="display:block;width:100%;border:0;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

// ── Plain-text fallback ────────────────────────────────────────────────────
$textBody  = "Nuevo mensaje desde el formulario de contacto:\n\n";
$textBody .= "Nombre:    $name\n";
$textBody .= "Email:     $email\n";
$textBody .= "Teléfono:  $phone\n";
if ($service) $textBody .= "Servicio:  $service\n";
$textBody .= "\nMensaje:\n$message\n\n";
$textBody .= "--\nFelipe Reyes Montecinos | Fundador\nKi-Nexus · Movimiento que nos une\n+569 63691898 | felipe.reyes@ki-nexus.cl";

// ── MIME boundaries ────────────────────────────────────────────────────────
$mixedBoundary    = 'mixed_'    . md5(uniqid());
$altBoundary      = 'alt_'      . md5(uniqid());

// ── Headers ───────────────────────────────────────────────────────────────
$headers   = [];
$headers[] = 'From: ' . $name . ' <' . $email . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"';

// ── Body ──────────────────────────────────────────────────────────────────
$body  = "--{$mixedBoundary}\r\n";
$body .= "Content-Type: multipart/alternative; boundary=\"{$altBoundary}\"\r\n\r\n";

// Plain text part
$body .= "--{$altBoundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
$body .= quoted_printable_encode($textBody) . "\r\n";

// HTML part
$body .= "--{$altBoundary}\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
$body .= quoted_printable_encode($htmlBody) . "\r\n";

$body .= "--{$altBoundary}--\r\n";

// Inline image attachment (only if file exists)
if ($imageData) {
    $body .= "--{$mixedBoundary}\r\n";
    $body .= "Content-Type: image/png; name=\"design.png\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: inline; filename=\"design.png\"\r\n";
    $body .= "Content-ID: <{$imageCid}>\r\n\r\n";
    $body .= chunk_split($imageData) . "\r\n";
}

$body .= "--{$mixedBoundary}--";

// ── Send / log ─────────────────────────────────────────────────────────────
$isLocal = in_array(@$_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1']);
if ($isLocal) {
    $logFile = __DIR__ . '/contact.log';
    $entry = '[' . date('c') . '] ' . json_encode([
        'name' => $name, 'email' => $email, 'phone' => $phone,
        'service' => $service, 'message' => $message
    ]) . "\n";
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