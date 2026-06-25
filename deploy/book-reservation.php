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

$company     = isset($_POST['company'])     ? strip_tags(trim($_POST['company']))                       : '';
$email       = isset($_POST['email'])       ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : false;
$region      = isset($_POST['region'])      ? strip_tags(trim($_POST['region']))                       : '';
$city        = isset($_POST['city'])        ? strip_tags(trim($_POST['city']))                         : '';
$address     = isset($_POST['address'])     ? strip_tags(trim($_POST['address']))                      : '';
$description = isset($_POST['description']) ? strip_tags(trim($_POST['description']))                  : '';
$date        = isset($_POST['date'])        ? strip_tags(trim($_POST['date']))                         : '';
$time        = isset($_POST['time'])        ? strip_tags(trim($_POST['time']))                         : '';

if (!$company || !$email || !$date || !$time || !$address || !$description) {
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

$felipeEmail = 'felipe.reyes@ki-nexus.cl';

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

// ── Google Calendar event creation URL (for Felipe's email) ───────────────
$calendarDetails = "Empresa: $company\nEmail: $email\nDirección: $address, $city, $region\nDescripción: $description\n\nPasos: Editar evento → Agregar videoconferencia → Guardar y enviar invitación al cliente.";
$calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    . '&text=' . rawurlencode("Diagnóstico Ki-Nexus — $company")
    . '&dates=' . $dateObj->format('Ymd\THis') . '/' . $endObj->format('Ymd\THis')
    . '&details=' . rawurlencode($calendarDetails)
    . '&location=' . rawurlencode("$address, $city, $region")
    . '&add=' . rawurlencode($email);

// ── Build ICS calendar invite ──────────────────────────────────────────────
$dtStart  = $dateObj->format('Ymd\THis');
$dtEnd    = $endObj->format('Ymd\THis');
$dtStamp  = (new DateTime('now', new DateTimeZone('UTC')))->format('Ymd\THis\Z');
$uid      = 'kinexus-' . $date . '-' . str_replace(':', '', $time) . '@ki-nexus.cl';
$icsDesc  = 'Diagnóstico presencial Ki-Nexus\\nEmpresa: ' . $company
           . '\\nDirección: ' . $address . ', ' . $city . ', ' . $region
           . '\\nDescripción: ' . $description
           . '\\n\\nFelipe enviará el link de Google Meet antes de la reunión.';

$icsContent  = "BEGIN:VCALENDAR\r\n";
$icsContent .= "VERSION:2.0\r\n";
$icsContent .= "PRODID:-//Ki-Nexus//Booking//ES\r\n";
$icsContent .= "METHOD:REQUEST\r\n";
$icsContent .= "BEGIN:VEVENT\r\n";
$icsContent .= "UID:$uid\r\n";
$icsContent .= "DTSTAMP:$dtStamp\r\n";
$icsContent .= "DTSTART;TZID=America/Santiago:$dtStart\r\n";
$icsContent .= "DTEND;TZID=America/Santiago:$dtEnd\r\n";
$icsContent .= "SUMMARY:Diagnóstico Ki-Nexus — $company\r\n";
$icsContent .= "DESCRIPTION:$icsDesc\r\n";
$icsContent .= "LOCATION:$address, $city, $region\r\n";
$icsContent .= "ORGANIZER;CN=Ki-Nexus:mailto:$felipeEmail\r\n";
$icsContent .= "ATTENDEE;CN=$company;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:$email\r\n";
$icsContent .= "ATTENDEE;CN=Felipe Reyes;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:$felipeEmail\r\n";
$icsContent .= "BEGIN:VALARM\r\n";
$icsContent .= "TRIGGER:-PT30M\r\n";
$icsContent .= "ACTION:DISPLAY\r\n";
$icsContent .= "DESCRIPTION:Recordatorio: Diagnóstico Ki-Nexus en 30 minutos\r\n";
$icsContent .= "END:VALARM\r\n";
$icsContent .= "END:VEVENT\r\n";
$icsContent .= "END:VCALENDAR\r\n";

$icsBase64   = base64_encode($icsContent);
$icsFilename = 'diagnostico-kinexus-' . $date . '.ics';

// ── Inline image for client email ─────────────────────────────────────────
$imagePath = __DIR__ . '/design.png';
$imageData = file_exists($imagePath) ? base64_encode(file_get_contents($imagePath)) : '';
$imageCid  = 'kinexus-footer-' . md5($imagePath) . '@ki-nexus.cl';

// ══════════════════════════════════════════════════════════════════════════════
// SEND FUNCTION — HTML + plain text + ICS attachment + optional inline image
// ══════════════════════════════════════════════════════════════════════════════
function sendReservationMail(
    string $to, string $fromName, string $fromEmail,
    string $subject, string $htmlBody, string $textBody,
    string $icsBase64, string $icsFilename,
    string $imageData = '', string $imageCid = ''
): bool {
    $mixedBoundary = 'mixed_' . md5(uniqid());
    $altBoundary   = 'alt_'   . md5(uniqid());

    $headers   = [];
    $headers[] = 'From: Ki-Nexus <' . $fromEmail . '>';
    $headers[] = 'Reply-To: ' . $fromName . ' <' . $fromEmail . '>';
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

    return mail($to, $subject, $body, implode("\r\n", $headers));
}

// ── Helpers for optional fields in email ──────────────────────────────────
$descRowFelipe = '<tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;">'
               . '<strong>Descripción:</strong><br>' . nl2br(htmlspecialchars($description)) . '</td></tr>';

$descRowClient = '<p style="margin:4px 0;color:#555;font-size:15px;">Descripción: <strong>'
               . htmlspecialchars($description) . '</strong></p>';

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 1 — Notificación interna a Felipe
// ══════════════════════════════════════════════════════════════════════════════
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
          <tr>
            <td style="background:#0a0a0a;padding:20px 30px;">
              <span style="color:#7fc742;font-size:22px;font-weight:700;letter-spacing:1px;">KI-NEXUS</span>
              <span style="color:#ffffff;font-size:13px;margin-left:10px;opacity:.7;">Nueva reserva de diagnóstico presencial</span>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 20px;color:#0a0a0a;font-size:18px;">📅 Datos de la reserva</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Empresa:</strong> {$company}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Email:</strong> <a href="mailto:{$email}" style="color:#7fc742;">{$email}</a></td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Región:</strong> {$region}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Ciudad:</strong> {$city}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Dirección:</strong> {$address}</td></tr>
                {$descRowFelipe}
                <tr><td style="padding:7px 0;color:#555;font-size:15px;border-bottom:1px solid #f0f0f0;"><strong>Fecha:</strong> {$displayDate}</td></tr>
                <tr><td style="padding:7px 0;color:#555;font-size:15px;"><strong>Hora:</strong> {$displayTime}</td></tr>
              </table>
              <div style="margin-top:24px;text-align:center;">
                <a href="{$calendarUrl}"
                   style="display:inline-block;background:#7fc742;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;letter-spacing:.5px;">
                  📅 Crear evento en Google Calendar
                </a>
                <p style="margin:12px 0 0;color:#666;font-size:12px;line-height:1.5;">Al abrir el evento, haz clic en <strong>Agregar videoconferencia</strong> para generar el link de Google Meet y enviárselo automáticamente al cliente.</p>
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

$felipeText  = "Nueva reserva de diagnóstico presencial:\n\n";
$felipeText .= "Empresa:     $company\n";
$felipeText .= "Email:       $email\n";
$felipeText .= "Región:      $region\n";
$felipeText .= "Ciudad:      $city\n";
$felipeText .= "Dirección:   $address\n";
$felipeText .= "Descripción: $description\n";
$felipeText .= "Fecha:       $displayDate\n";
$felipeText .= "Hora:        $displayTime\n\n";
$felipeText .= "Crear evento en Google Calendar: $calendarUrl\n";

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL 2 — Confirmación al cliente
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
                ¡Tu diagnóstico ha sido agendado, {$company}!
              </h1>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                Hemos confirmado tu reserva para un diagnóstico presencial con Felipe Reyes de Ki-Nexus. A continuación encontrarás el resumen y el enlace para unirte a la reunión por Google Meet.
              </p>
              <div style="background:#f9f9f9;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 10px;color:#0a0a0a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resumen de tu reserva</p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Empresa: <strong>{$company}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Fecha: <strong>{$displayDate}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Hora: <strong>{$displayTime}</strong></p>
                <p style="margin:4px 0;color:#555;font-size:15px;">Dirección: <strong>{$address}, {$city}, {$region}</strong></p>
                {$descRowClient}
              </div>
              <div style="background:#f0f7e8;border-left:4px solid #7fc742;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;color:#0a0a0a;font-size:14px;font-weight:700;">🎥 ¿Cómo será la reunión?</p>
                <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
                  Felipe te enviará el link de <strong>Google Meet</strong> por correo antes de la reunión, una vez que confirme la agenda desde su calendario.
                </p>
              </div>
              <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                Hemos adjuntado una invitación de calendario (.ics) a este correo para que puedas reservar el horario en Google Calendar, Outlook o Apple Calendar. Si tienes alguna consulta, escríbenos a <a href="mailto:felipe.reyes@ki-nexus.cl" style="color:#7fc742;">felipe.reyes@ki-nexus.cl</a>.
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

$clientText  = "¡Tu diagnóstico ha sido agendado, $company!\n\n";
$clientText .= "Hemos confirmado tu reserva para un diagnóstico presencial con Felipe Reyes.\n\n";
$clientText .= "Detalles:\n";
$clientText .= "Fecha:       $displayDate\n";
$clientText .= "Hora:        $displayTime\n";
$clientText .= "Dirección:   $address, $city, $region\n";
$clientText .= "Descripción: $description\n\n";
$clientText .= "Felipe te enviará el link de Google Meet por correo antes de la reunión.\n";
$clientText .= "Se adjunta una invitación de calendario (.ics) a este correo.\n\n";
$clientText .= "--\n";
$clientText .= "Felipe Reyes Montecinos | Fundador\n";
$clientText .= "Ki-Nexus · Movimiento que nos une\n";
$clientText .= "+569 63691898 | felipe.reyes@ki-nexus.cl";

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
        'company' => $company, 'email' => $email, 'region' => $region, 'city' => $city,
        'address' => $address, 'description' => $description, 'date' => $date, 'time' => $time,
        'calendarUrl' => $calendarUrl,
    ]) . "\n";
    @file_put_contents(__DIR__ . '/reservations.log', $entry, FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Modo desarrollo: reserva registrada en reservations.log']);
    exit;
}

// ── Send both emails ──────────────────────────────────────────────────────
$sentFelipe = sendReservationMail(
    $felipeEmail, 'Ki-Nexus', $felipeEmail,
    'Nueva reserva presencial — ' . $company . ' | Ki-Nexus',
    $felipeHtml, $felipeText,
    $icsBase64, $icsFilename
);

$sentClient = sendReservationMail(
    $email, 'Ki-Nexus', $felipeEmail,
    'Confirmación de diagnóstico — Ki-Nexus',
    $clientHtml, $clientText,
    $icsBase64, $icsFilename,
    $imageData, $imageCid
);

if ($sentFelipe) {
    echo json_encode(['success' => true, 'message' => 'Reserva confirmada. Revisa tu correo — Felipe te enviará el link de Google Meet antes de la reunión.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocurrió un error al confirmar la reserva.']);
}
?>
