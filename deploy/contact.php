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

// Basic honeypot anti-spam
if (!empty($_POST['hp_field'])) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Spam detected' ]);
    exit;
}

// Get and sanitize inputs
$name    = isset($_POST['name'])    ? strip_tags(trim($_POST['name']))                         : '';
$email   = isset($_POST['email'])   ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
$phone   = isset($_POST['phone'])   ? strip_tags(trim($_POST['phone']))                        : '';
$service = isset($_POST['service']) ? strip_tags(trim($_POST['service']))                      : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message']))                      : '';

if (!$name || !$email) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Faltan datos requeridos' ]);
    exit;
}

$felipeEmail = 'felipe.reyes@ki-nexus.cl';

// ── Inline image (footer for client confirmation) ──────────────────────────
$imagePath = __DIR__ . '/design.png';
$imageData = file_exists($imagePath) ? base64_encode(file_get_contents($imagePath)) : '';
$imageCid  = 'kinexus-footer-' . md5($imagePath) . '@ki-nexus.cl';

// ══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: construye y envía un email HTML + texto con imagen inline
// ══════════════════════════════════════════════════════════════════════════════
function sendHtmlMail(string $to, string $fromName, string $fromEmail,
                      string $subject, string $htmlBody, string $textBody,
                      string $imageData = '', string $imageCid = ''): bool
{
    $mixedBoundary = 'mixed_' . md5(uniqid());
    $altBoundary   = 'alt_'   . md5(uniqid());

    $headers   = [];
    $headers[] = 'From: Ki-Nexus <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $fromName . ' <' . $fromEmail . '>';
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"';

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

    // Inline image (optional)
    if ($imageData && $imageCid) {
        $body .= "--{$mixedBoundary}\r\n";
        $body .= "Content-Type: image/png; name=\"design.png\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n";
        $body .= "Content-Disposition: inline; filename=\"design.png\"\r\n";
        $body .= "Content-ID: <{$imageCid}>\r\n\r\n";
        $body .= chunk_split($imageData) . "\r\n";
    }

    $body .= "--{$mixedBoundary}--";

    return mail($to, $subject, $body, implode("\r\n", $headers));
}

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 1 — Notificación interna a Felipe (sin footer)
// ══════════════════════════════════════════════════════════════════════════════
$serviceRowFelipe = $service
    ? '<tr><td style="padding:6px 0;color:#555;font-size:15px;"><strong>Servicio de interés:</strong> ' . htmlspecialchars($service) . '</td></tr>'
    : '';

$messageHtml = nl2br(htmlspecialchars($message));

$felipeHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0a;padding:20px 30px;">
              <span style="color:#7fc742;font-size:22px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="color:#ffffff;font-size:13px;margin-left:10px;opacity:.7;">Nueva consulta desde el sitio web</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 20px;color:#0a0a0a;font-size:18px;">📬 Datos del cliente</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Nombre:</strong> {$name}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Email:</strong> <a href="mailto:{$email}" style="color:#7fc742;">{$email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Teléfono:</strong> {$phone}
                  </td>
                </tr>
                {$serviceRowFelipe}
              </table>

              <hr style="border:none;border-top:1px solid #ececec;margin:24px 0;">

              <p style="margin:0 0 8px;color:#0a0a0a;font-size:15px;font-weight:700;">Mensaje:</p>
              <p style="margin:0;color:#444;font-size:15px;line-height:1.8;background:#f9f9f9;padding:14px 16px;border-radius:6px;">{$messageHtml}</p>
            </td>
          </tr>

          <!-- Footer mínimo -->
          <tr>
            <td style="background:#f4f4f4;padding:14px 30px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">Este mensaje fue generado automáticamente desde el formulario de contacto de ki-nexus.cl</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$felipeText  = "Nueva consulta desde el formulario de contacto:\n\n";
$felipeText .= "Nombre:   $name\n";
$felipeText .= "Email:    $email\n";
$felipeText .= "Teléfono: $phone\n";
if ($service) $felipeText .= "Servicio: $service\n";
$felipeText .= "\nMensaje:\n$message\n";

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 2 — Confirmación al cliente (con footer design.png)
// ══════════════════════════════════════════════════════════════════════════════
$serviceRowClient = $service
    ? '<p style="margin:4px 0;color:#555;font-size:15px;">Servicio de interés: <strong>' . htmlspecialchars($service) . '</strong></p>'
    : '';

$clientHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.10);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0a;padding:24px 30px;">
              <span style="color:#7fc742;font-size:24px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="display:block;color:#ffffff;font-size:12px;margin-top:4px;opacity:.6;letter-spacing:2px;">MOVIMIENTO QUE NOS UNE</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 30px 28px;">
              <h1 style="margin:0 0 12px;color:#0a0a0a;font-size:22px;font-weight:700;">
                ¡Gracias por contactarnos, {$name}!
              </h1>
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
                Hemos recibido tu consulta correctamente. Nos pondremos en contacto contigo a la brevedad para entregarte más información.
              </p>

              <!-- Resumen -->
              <div style="background:#f9f9f9;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;color:#0a0a0a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumen de tu consulta</p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Nombre: <strong>{$name}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Email: <strong>{$email}</strong></p>
                {$serviceRowClient}
              </div>

              <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                Si tienes alguna duda urgente, puedes contactarnos directamente a través de WhatsApp o al número que aparece a continuación.
              </p>
            </td>
          </tr>

          <!-- Footer image — tarjeta de Felipe -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="cid:{$imageCid}"
                   alt="Ki-Nexus | Felipe Reyes Montecinos - Fundador"
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

$clientText  = "¡Gracias por contactarnos, $name!\n\n";
$clientText .= "Hemos recibido tu consulta y nos pondremos en contacto contigo a la brevedad.\n\n";
if ($service) $clientText .= "Servicio de interés: $service\n\n";
$clientText .= "--\n";
$clientText .= "Felipe Reyes Montecinos | Fundador\n";
$clientText .= "Ki-Nexus · Movimiento que nos une\n";
$clientText .= "+569 63691898 | felipe.reyes@ki-nexus.cl";

// ── Modo desarrollo: solo log ──────────────────────────────────────────────
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

// ── Enviar ambos correos ───────────────────────────────────────────────────
$sentFelipe = sendHtmlMail(
    $felipeEmail,
    $name, $felipeEmail,
    'Consulta desde web - Ki-Nexus',
    $felipeHtml, $felipeText
    // Sin imagen
);

$sentClient = sendHtmlMail(
    $email,
    'Ki-Nexus', $felipeEmail,
    '¡Gracias por contactarnos! - Ki-Nexus',
    $clientHtml, $clientText,
    $imageData, $imageCid  // Con footer
);

if ($sentFelipe) {
    echo json_encode([ 'success' => true, 'message' => 'Tu consulta fue enviada correctamente.' ]);
} else {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'message' => 'Ocurrió un error al enviar el correo.' ]);
}
?>