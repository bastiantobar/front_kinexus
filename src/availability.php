<?php
// Permitir peticiones CORS si se desarrolla en local/puertos distintos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=utf-8');

// Configuración de Seguridad
define('FILE_PATH', 'assets/availability.json');
define('BYPASS_SIGNATURE_VERIFICATION', true); // Cambiar a false en prod si configuras la clave secreta
define('JWT_SECRET_KEY', 'kinexus-secret-key-change-me');

// Función para verificar el token JWT enviado en las cabeceras
function checkAuth() {
    $headers = getallheaders();
    $authHeader = '';
    
    // Buscar la cabecera de Autorización
    foreach ($headers as $key => $value) {
        if (strcasecmp($key, 'Authorization') === 0) {
            $authHeader = $value;
            break;
        }
    }
    
    if (empty($authHeader)) {
        return false;
    }
    
    // Extraer el token
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        // Decodificar el Payload del JWT
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        if (!$payload) {
            return false;
        }
        
        // Verificar Expiración
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false; // Token expirado
        }
        
        // Si no se salta la firma, verificarla usando HMAC SHA256
        if (!BYPASS_SIGNATURE_VERIFICATION) {
            $header = $parts[0];
            $payloadRaw = $parts[1];
            $signature = $parts[2];
            
            $validSignature = hash_hmac('sha256', "$header.$payloadRaw", JWT_SECRET_KEY, true);
            $validSignatureBase64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
            
            if ($signature !== $validSignatureBase64) {
                return false; // Firma inválida
            }
        }
        
        return true;
    }
    
    return false;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Retornar la disponibilidad configurada
    if (file_exists(FILE_PATH)) {
        $data = file_get_contents(FILE_PATH);
        echo $data;
    } else {
        echo json_encode((object)[]);
    }
    exit();
}

if ($method === 'POST') {
    // Verificar autorización
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "No autorizado. Token inválido o expirado."]);
        exit();
    }
    
    // Obtener y decodificar el cuerpo de la petición
    $input = file_get_contents('php://input');
    $jsonData = json_decode($input, true);
    
    if ($jsonData === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Datos JSON inválidos."]);
        exit();
    }
    
    // Asegurarse de que el directorio assets exista
    $dir = dirname(FILE_PATH);
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
    
    // Guardar los datos en el archivo
    if (file_put_contents(FILE_PATH, json_encode($jsonData, JSON_PRETTY_PRINT))) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Disponibilidad guardada correctamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al guardar la disponibilidad en el servidor."]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método no permitido."]);
?>
