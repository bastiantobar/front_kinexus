<?php
// ============================================================
// login.php — Autenticación nativa PHP para KI-NEXUS
// Compatible con cPanel (Apache + PHP)
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit();
}

// ============================================================
// CREDENCIALES DE ADMINISTRADOR
// Para cambiar la contraseña, genera un nuevo hash con:
//   php -r "echo password_hash('nueva_clave', PASSWORD_BCRYPT);"
// y reemplaza el valor de $passwordHash abajo.
// ============================================================
$adminEmail    = "felipe.reyes@ki-nexus.cl";
$passwordHash  = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // "password" por defecto
// ^^^ CAMBIA ESTO en producción. Ver instrucciones arriba.

// ============================================================
// CLAVE SECRETA JWT — Cámbiala en producción
// ============================================================
define('JWT_SECRET', 'kinexus-jwt-secret-2024-change-me');
define('JWT_EXPIRY_HOURS', 8); // El token expira en 8 horas

// ============================================================
// Leer cuerpo de la petición
// ============================================================
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email y contraseña son requeridos."]);
    exit();
}

$email    = trim($input['email']);
$password = $input['password'];

// ============================================================
// Validar credenciales
// ============================================================
if (strtolower($email) !== strtolower($adminEmail) || !password_verify($password, $passwordHash)) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Credenciales inválidas."]);
    exit();
}

// ============================================================
// Generar token JWT simple (Header.Payload.Signature)
// ============================================================
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

$now     = time();
$expiry  = $now + (JWT_EXPIRY_HOURS * 3600);

$header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
$payload = base64url_encode(json_encode([
    'sub'   => $email,
    'role'  => 'admin',
    'iat'   => $now,
    'exp'   => $expiry
]));

$signature = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
$token     = "$header.$payload.$signature";

// ============================================================
// Respuesta exitosa
// ============================================================
http_response_code(200);
echo json_encode([
    "success" => true,
    "token"   => $token,
    "email"   => $email,
    "role"    => "admin",
    "exp"     => $expiry
]);
?>
