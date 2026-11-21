<?php
// book-reservation.php
// Reservation endpoint: sends emails with ICS calendar invite and updates availability.

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (!empty($_POST['hp_field'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Spam detected']);
    exit;
}

function campo(string $key): string {
    return isset($_POST[$key]) ? strip_tags(trim($_POST[$key])) : '';
}
$name        = campo('name');
$email       = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
$phone       = campo('phone');
$region      = campo('region');
$city        = campo('city'); // comuna
$address     = campo('address');
$description = campo('description'); // motivo de consulta
$date        = campo('date');
$time        = campo('time');

if (!$name || !$email || !$phone || !$date || !$time || !$address || !$description) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Formato de fecha inválido']);
    exit;
}

if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Formato de hora inválido']);
    exit;
}

// Correo que recibe los avisos y desde el que salen las confirmaciones.
// Sigue siendo el de Felipe mientras no exista la casilla contacto@ en el hosting.
// Para cambiarlo: crear contacto@ki-nexus.cl en cPanel y reemplazarlo aquí.
$notifyEmail = 'felipe.reyes@ki-nexus.cl';

// Versiones seguras para insertar en el HTML de los correos
$h = fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
$nameH    = $h($name);
$emailH   = $h($email);
$phoneH   = $h($phone);
$regionH  = $h($region);
$cityH    = $h($city);
$addressH = $h($address);
$fullAddress  = trim("$address, $city, $region", ', ');
$fullAddressH = $h($fullAddress);

// ── Format date/time for display (Chilean locale) ─────────────────────────
$dateObj = new DateTime($date . ' ' . $time, new DateTimeZone('America/Santiago'));
$endObj  = clone $dateObj;
$endObj->modify('+30 minutes');

$monthNames = [1=>'enero',2=>'febrero',3=>'marzo',4=>'abril',5=>'mayo',6=>'junio',
               7=>'julio',8=>'agosto',9=>'septiembre',10=>'octubre',11=>'noviembre',12=>'diciembre'];
$dayNames   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

$displayDate = $dayNames[(int)$dateObj->format('w')] . ', '
             . (int)$dateObj->format('j') . ' de '
             . $monthNames[(int)$dateObj->format('n')] . ' de '
             . $dateObj->format('Y');
$displayTime = $time . ' – ' . $endObj->format('H:i') . ' hrs (Chile)';

// ── Google Calendar event creation URL (para el correo interno) ──────────
$calendarDetails = "Atención a domicilio\nPaciente: $name\nTeléfono: $phone\nCorreo: $email\nDirección: $fullAddress\nMotivo: $description";
$calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    . '&text=' . rawurlencode("Atención a domicilio Ki-Nexus — $name")
    . '&dates=' . $dateObj->format('Ymd\THis') . '/' . $endObj->format('Ymd\THis')
    . '&details=' . rawurlencode($calendarDetails)
    . '&location=' . rawurlencode($fullAddress)
    . '&add=' . rawurlencode($email);

// ── Build ICS calendar invite ──────────────────────────────────────────────
// Escapa texto para ICS (comas, punto y coma y saltos de línea)
$ics = fn(string $v): string => str_replace(["\\", ';', ',', "\r\n", "\n"], ["\\\\", '\;', '\,', '\n', '\n'], $v);
$dtStart  = $dateObj->format('Ymd\THis');
$dtEnd    = $endObj->format('Ymd\THis');
$dtStamp  = (new DateTime('now', new DateTimeZone('UTC')))->format('Ymd\THis\Z');
$uid      = 'kinexus-' . $date . '-' . str_replace(':', '', $time) . '@ki-nexus.cl';
$icsDesc  = 'Atención de kinesiología a domicilio - Ki-Nexus\\nPaciente: ' . $ics($name)
           . '\\nTeléfono: ' . $ics($phone)
           . '\\nDirección: ' . $ics($fullAddress)
           . '\\nMotivo: ' . $ics($description);

$icsContent  = "BEGIN:VCALENDAR\r\n";
$icsContent .= "VERSION:2.0\r\n";
$icsContent .= "PRODID:-//Ki-Nexus//Booking//ES\r\n";
$icsContent .= "METHOD:REQUEST\r\n";
$icsContent .= "BEGIN:VEVENT\r\n";
$icsContent .= "UID:$uid\r\n";
$icsContent .= "DTSTAMP:$dtStamp\r\n";
$icsContent .= "DTSTART;TZID=America/Santiago:$dtStart\r\n";
$icsContent .= "DTEND;TZID=America/Santiago:$dtEnd\r\n";
$icsContent .= "SUMMARY:Atención a domicilio Ki-Nexus — " . $ics($name) . "\r\n";
$icsContent .= "DESCRIPTION:$icsDesc\r\n";
$icsContent .= "LOCATION:" . $ics($fullAddress) . "\r\n";
$icsContent .= "ORGANIZER;CN=Ki-Nexus:mailto:$notifyEmail\r\n";
$icsContent .= "ATTENDEE;CN=\"" . str_replace(['"', "\r", "\n"], '', $name) . "\";ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:$email\r\n";
$icsContent .= "ATTENDEE;CN=Ki-Nexus;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:$notifyEmail\r\n";
$icsContent .= "BEGIN:VALARM\r\n";
$icsContent .= "TRIGGER:-PT30M\r\n";
$icsContent .= "ACTION:DISPLAY\r\n";
$icsContent .= "DESCRIPTION:Recordatorio: atención a domicilio Ki-Nexus en 30 minutos\r\n";
$icsContent .= "END:VALARM\r\n";
$icsContent .= "END:VEVENT\r\n";
$icsContent .= "END:VCALENDAR\r\n";

$icsBase64   = base64_encode($icsContent);
$icsFilename = 'atencion-domicilio-kinexus-' . $date . '.ics';

// ── Inline image for client email ─────────────────────────────────────────
$imagePath = __DIR__ . '/design.png';
$imageData = file_exists($imagePath) ? base64_encode(file_get_contents($imagePath)) : '';
$imageCid  = 'kinexus-footer-' . md5($imagePath) . '@ki-nexus.cl';

// ══════════════════════════════════════════════════════════════════════════════
// SEND FUNCTION — HTML + plain text + ICS attachment + optional inline image
// ══════════════════════════════════════════════════════════════════════════════
function sendReservationMail(
    string $to, string $fromEmail, string $replyTo,
    string $subject, string $htmlBody, string $textBody,
    string $icsBase64, string $icsFilename,
    string $imageData = '', string $imageCid = ''
): bool {
    $mixedBoundary = 'mixed_' . md5(uniqid());
    $altBoundary   = 'alt_'   . md5(uniqid());

    $headers   = [];
    $headers[] = 'From: Ki-Nexus <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $replyTo;
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"';

    $body  = "--{$mixedBoundary}\r\n";
    $body .= "Content-Type: multipart/alternative; boundary=\"{$altBoundary}\"\r\n\r\n";

    $body .= "--{$altBoundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
    $body .= quoted_printable_encode($textBody) . "\r\n";

    $body .= "--{$altBoundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: quoted-printable\r\n\r\n";
    $body .= quoted_printable_encode($htmlBody) . "\r\n";

    $body .= "--{$altBoundary}--\r\n";

    // ICS attachment
    $body .= "--{$mixedBoundary}\r\n";
    $body .= "Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name=\"{$icsFilename}\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"{$icsFilename}\"\r\n\r\n";
    $body .= chunk_split($icsBase64) . "\r\n";

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

$descriptionH = nl2br($h($description));

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 1 — Notificación interna
// ══════════════════════════════════════════════════════════════════════════════
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
          <tr>
            <td style="background:#0a0a0a;padding:20px 30px;">
              <span style="color:#7fc742;font-size:22px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="color:#ffffff;font-size:13px;margin-left:10px;opacity:.7;">Nueva reserva de atención a domicilio</span>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 20px;color:#0a0a0a;font-size:18px;">🏠 Datos de la reserva</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Nombre:</strong> {$nameH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Correo:</strong> <a href="mailto:{$emailH}" style="color:#7fc742;">{$emailH}</a></td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Teléfono:</strong> {$phoneH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Región:</strong> {$regionH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Comuna:</strong> {$cityH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Dirección:</strong> {$addressH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Motivo de consulta:</strong> <br>{$descriptionH}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Fecha:</strong> {$displayDate}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;"><strong>Hora:</strong> {$displayTime}</td></tr>
              </table>
              <div style="margin-top:24px;text-align:center;">
                <a href="{$calendarUrl}"
                   style="display:inline-block;background:#7fc742;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;letter-spacing:.5px;">
                  📅 Crear evento en Google Calendar
                </a>
                <p style="margin:12px 0 0;color:#666;font-size:12px;line-height:1.5;">Responde este correo para escribirle directamente al paciente.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f4;padding:14px 30px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">Reserva generada automáticamente desde el formulario de ki-nexus.cl</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$internalText  = "Nueva reserva de atención a domicilio:\n\n";
$internalText .= "Nombre:    $name\n";
$internalText .= "Correo:    $email\n";
$internalText .= "Teléfono:  $phone\n";
$internalText .= "Región:    $region\n";
$internalText .= "Comuna:    $city\n";
$internalText .= "Dirección: $address\n";
$internalText .= "Motivo:    $description\n";
$internalText .= "Fecha:     $displayDate\n";
$internalText .= "Hora:      $displayTime\n\n";
$internalText .= "Crear evento en Google Calendar: $calendarUrl\n";

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 2 — Confirmación al paciente
// ══════════════════════════════════════════════════════════════════════════════
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
          <tr>
            <td style="background:#0a0a0a;padding:24px 30px;">
              <span style="color:#7fc742;font-size:24px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="display:block;color:#ffffff;font-size:12px;margin-top:4px;opacity:.6;letter-spacing:2px;">MOVIMIENTO QUE NOS UNE</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 30px 28px;">
              <h1 style="margin:0 0 12px;color:#0a0a0a;font-size:22px;font-weight:700;">
                ¡Tu atención a domicilio quedó agendada, {$nameH}!
              </h1>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                Recibimos tu reserva. Un kinesiólogo de Ki-Nexus irá a tu domicilio en la fecha y hora indicadas.
              </p>
              <div style="background:#f9f9f9;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 10px;color:#0a0a0a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumen de tu reserva</p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Fecha: <strong>{$displayDate}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Hora: <strong>{$displayTime}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Dirección: <strong>{$fullAddressH}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Teléfono: <strong>{$phoneH}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Motivo de consulta: <strong>{$descriptionH}</strong></p>
              </div>
              <div style="background:#f0f7e8;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;color:#0a0a0a;font-size:14px;font-weight:700;">🏠 ¿Qué sigue?</p>
                <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
                  Te contactaremos por teléfono o correo para confirmar la visita. Si necesitas cambiar la hora, responde este correo.
                </p>
              </div>
              <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                Adjuntamos una invitación de calendario (.ics) para que guardes la hora en Google Calendar, Outlook o Apple Calendar. Si tienes alguna consulta, escríbenos a <a href="mailto:contacto@ki-nexus.cl" style="color:#7fc742;">contacto@ki-nexus.cl</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;margin:0 auto;">
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

$clientText  = "¡Tu atención a domicilio quedó agendada, $name!\n\n";
$clientText .= "Un kinesiólogo de Ki-Nexus irá a tu domicilio en la fecha y hora indicadas.\n\n";
$clientText .= "Detalles:\n";
$clientText .= "Fecha:     $displayDate\n";
$clientText .= "Hora:      $displayTime\n";
$clientText .= "Dirección: $fullAddress\n";
$clientText .= "Motivo:    $description\n\n";
$clientText .= "Te contactaremos para confirmar la visita. Se adjunta una invitación de calendario (.ics).\n\n";
$clientText .= "--\n";
$clientText .= "Felipe Reyes Montecinos | Fundador\n";
$clientText .= "Ki-Nexus · Movimiento que nos une\n";
$clientText .= "+569 63691898 | contacto@ki-nexus.cl";

// ── Update availability.json (same file used by availability.php / dashboard) ──
$availabilityFile = __DIR__ . '/assets/availability.json';
if (file_exists($availabilityFile)) {
    $avail = json_decode(file_get_contents($availabilityFile), true) ?? [];
    if (isset($avail[$date]) && is_array($avail[$date])) {
        $avail[$date] = array_values(array_filter($avail[$date], fn($slot) => $slot !== $time));
        if (empty($avail[$date])) {
            unset($avail[$date]);
        }
        file_put_contents($availabilityFile, json_encode($avail, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}

// ── Dev mode: log only ────────────────────────────────────────────────────
$isLocal = in_array(@$_SERVER['SERVER_NAME'], ['localhost', '127.0.0.1']);
if ($isLocal) {
    $entry = '[' . date('c') . '] ' . json_encode([
        'name' => $name, 'email' => $email, 'phone' => $phone, 'region' => $region, 'city' => $city,
        'address' => $address, 'description' => $description, 'date' => $date, 'time' => $time,
        'calendarUrl' => $calendarUrl,
    ]) . "\n";
    @file_put_contents(__DIR__ . '/reservations.log', $entry, FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Modo desarrollo: reserva registrada en reservations.log']);
    exit;
}

// ── Send both emails ──────────────────────────────────────────────────────
// Aviso interno: al responder, la respuesta va directo al paciente.
$sentInternal = sendReservationMail(
    $notifyEmail, $notifyEmail, $email,
    'Nueva reserva a domicilio: ' . $name . ' | Ki-Nexus',
    $internalHtml, $internalText,
    $icsBase64, $icsFilename
);

// Confirmación al paciente: al responder, llega al correo de avisos.
$sentClient = sendReservationMail(
    $email, $notifyEmail, $notifyEmail,
    'Confirmación de atención a domicilio - Ki-Nexus',
    $clientHtml, $clientText,
    $icsBase64, $icsFilename,
    $imageData, $imageCid
);

if ($sentInternal) {
    echo json_encode(['success' => true, 'message' => 'Reserva recibida. Te enviamos la confirmación a tu correo y te contactaremos para confirmar la visita.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error al confirmar la reserva.']);
}
?>
