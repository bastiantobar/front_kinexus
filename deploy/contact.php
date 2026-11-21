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
function campo(string $key): string {
    return isset($_POST[$key]) ? strip_tags(trim($_POST[$key])) : '';
}
$name    = campo('name');
$company = campo('company');
$role    = campo('role');
$email   = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
$phone   = campo('phone');
$workers = campo('workers');
$service = campo('service'); // opcional: viene del botón "Cotizar" de un servicio
$message = campo('message');

if (!$name || !$company || !$email || !$phone) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Faltan datos requeridos' ]);
    exit;
}

// Correo que recibe los avisos y desde el que salen las confirmaciones.
// Sigue siendo el de Felipe mientras no exista la casilla contacto@ en el hosting.
// Para cambiarlo: crear contacto@ki-nexus.cl en cPanel y reemplazarlo aquí.
$notifyEmail = 'felipe.reyes@ki-nexus.cl';

// Versiones seguras para insertar en el HTML de los correos
$h = fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$nameH    = $h($name);
$companyH = $h($company);
$roleH    = $h($role);
$emailH   = $h($email);
$phoneH   = $h($phone);
$workersH = $workers !== '' ? $h($workers) : '—';

// ── Inline image (footer for client confirmation) ──────────────────────────
$imagePath = __DIR__ . '/design.png';
$imageData = file_exists($imagePath) ? base64_encode(file_get_contents($imagePath)) : '';
$imageCid  = 'kinexus-footer-' . md5($imagePath) . '@ki-nexus.cl';

// ══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR: construye y envía un email HTML + texto con imagen inline
// ══════════════════════════════════════════════════════════════════════════════
function sendHtmlMail(string $to, string $fromEmail, string $replyTo,
                      string $subject, string $htmlBody, string $textBody,
                      string $imageData = '', string $imageCid = ''): bool
{
    $mixedBoundary = 'mixed_' . md5(uniqid());
    $altBoundary   = 'alt_'   . md5(uniqid());

    $headers   = [];
    $headers[] = 'From: Ki-Nexus <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $replyTo;
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

    $subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return mail($to, $subject, $body, implode("\r\n", $headers));
}

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 1 — Notificación interna (sin footer)
// ══════════════════════════════════════════════════════════════════════════════
$serviceRowInternal = $service
    ? '<tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Servicio de interés:</strong> ' . $h($service) . '</td></tr>'
    : '';

$messageHtml = $message !== '' ? nl2br($h($message)) : '<em style="color:#999;">Sin mensaje</em>';

$internalHtml = <<<HTML
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
              <span style="color:#ffffff;font-size:13px;margin-left:10px;opacity:.7;">Nueva solicitud de cotización</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 20px;color:#0a0a0a;font-size:18px;">📬 Datos de la empresa</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Nombre:</strong> {$nameH}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Empresa:</strong> {$companyH}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Cargo:</strong> {$roleH}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Correo:</strong> <a href="mailto:{$emailH}" style="color:#7fc742;">{$emailH}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Teléfono:</strong> {$phoneH}
                  </td>
                </tr>
                <tr>
                  <td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">
                    <strong>Trabajadores (aprox.):</strong> {$workersH}
                  </td>
                </tr>
                {$serviceRowInternal}
              </table>

              <hr style="border:none;border-top:1px solid #ececec;margin:24px 0;">

              <p style="margin:0 0 8px;color:#0a0a0a;font-size:15px;font-weight:700;">Cómo podemos ayudar:</p>
              <p style="margin:0;color:#444;font-size:15px;line-height:1.8;background:#f9f9f9;padding:14px 16px;border-radius:6px;">{$messageHtml}</p>
              <p style="margin:20px 0 0;color:#888;font-size:13px;">Responde este correo para escribirle directamente al cliente.</p>
            </td>
          </tr>

          <!-- Footer mínimo -->
          <tr>
            <td style="background:#f4f4f4;padding:14px 30px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">Este mensaje fue generado automáticamente desde el formulario de cotización de ki-nexus.cl</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$internalText  = "Nueva solicitud de cotización:\n\n";
$internalText .= "Nombre:       $name\n";
$internalText .= "Empresa:      $company\n";
$internalText .= "Cargo:        $role\n";
$internalText .= "Correo:       $email\n";
$internalText .= "Teléfono:     $phone\n";
$internalText .= "Trabajadores: $workers\n";
if ($service) $internalText .= "Servicio:     $service\n";
$internalText .= "\nCómo podemos ayudar:\n$message\n";

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 2 — Confirmación al cliente (con footer design.png)
// ══════════════════════════════════════════════════════════════════════════════
$serviceRowClient = $service
    ? '<p style="margin:4px 0;color:#555;font-size:15px;">Servicio de interés: <strong>' . $h($service) . '</strong></p>'
    : '';

$clientHtml = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:10px 10px 0 0;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.20);">

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
                ¡Gracias por contactarnos, {$nameH}!
              </h1>
              <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7;">
                Hemos recibido tu solicitud de cotización. Nos pondremos en contacto contigo a la brevedad con una propuesta para tu empresa.
              </p>

              <!-- Resumen -->
              <div style="background:#f9f9f9;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;color:#0a0a0a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumen de tu solicitud</p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Nombre: <strong>{$nameH}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Empresa: <strong>{$companyH}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Correo: <strong>{$emailH}</strong></p>
                {$serviceRowClient}
              </div>

              <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                Si tienes alguna duda urgente, puedes contactarnos directamente a través de WhatsApp o al número que aparece a continuación.
              </p>
            </td>
          </tr>


        </table>
      </td>
    </tr>
  </table>

  <!-- Footer image full-bleed: #0a0a0a coincide con los bordes izq/der de design.png -->
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#0a0a0a;margin:0 auto;">
    <tr>
      <td align="center" style="padding:0;line-height:0;background:#0a0a0a;">
        <img src="cid:{$imageCid}"
             alt="Ki-Nexus | Felipe Reyes Montecinos - Fundador"
             width="600"
             style="display:block;width:100%;max-width:600px;border:0;">
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$clientText  = "¡Gracias por contactarnos, $name!\n\n";
$clientText .= "Hemos recibido tu solicitud de cotización para $company y nos pondremos en contacto contigo a la brevedad.\n\n";
if ($service) $clientText .= "Servicio de interés: $service\n\n";
$clientText .= "--\n";
$clientText .= "Felipe Reyes Montecinos | Fundador\n";
$clientText .= "Ki-Nexus · Movimiento que nos une\n";
$clientText .= "+569 63691898 | contacto@ki-nexus.cl";

// ── Modo desarrollo: solo log ──────────────────────────────────────────────
$isLocal = in_array(@$_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1']);
if ($isLocal) {
    $logFile = __DIR__ . '/contact.log';
    $entry = '[' . date('c') . '] ' . json_encode([
        'name' => $name, 'company' => $company, 'role' => $role, 'email' => $email,
        'phone' => $phone, 'workers' => $workers, 'service' => $service, 'message' => $message
    ]) . "\n";
    @file_put_contents($logFile, $entry, FILE_APPEND);
    echo json_encode([ 'success' => true, 'message' => 'Modo desarrollo: la consulta fue registrada en contact.log' ]);
    exit;
}

// ── Enviar ambos correos ───────────────────────────────────────────────────
// Aviso interno: al responder, la respuesta va directo al cliente.
$sentInternal = sendHtmlMail(
    $notifyEmail, $notifyEmail, $email,
    'Cotización empresa: ' . $company . ' | Ki-Nexus',
    $internalHtml, $internalText
);

// Confirmación al cliente: al responder, llega al correo de avisos.
$sentClient = sendHtmlMail(
    $email, $notifyEmail, $notifyEmail,
    '¡Recibimos tu solicitud de cotización! - Ki-Nexus',
    $clientHtml, $clientText,
    $imageData, $imageCid
);

if ($sentInternal) {
    echo json_encode([ 'success' => true, 'message' => 'Tu solicitud de cotización fue enviada correctamente. Te enviamos una copia a tu correo.' ]);
} else {
    http_response_code(500);
    echo json_encode([ 'success' => false, 'message' => 'Ocurrió un error al enviar el correo.' ]);
}
?>
