<?php
/**
 * API Backend Centralizada para Gestor de Reservas Aula ATECA
 * IES Agustín de Betancourt
 * 
 * Gestiona la sincronización segura y atómica entre todos los dispositivos del centro.
 */

// Headers de seguridad y tipo de contenido
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

// Control de CORS: Permitir exclusivamente solicitudes del mismo origen
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
if (!empty($origin)) {
    $parsedOrigin = parse_url($origin, PHP_URL_HOST);
    if ($parsedOrigin === $host || $parsedOrigin === 'localhost' || $parsedOrigin === '127.0.0.1') {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Ateca-Token');
    }
}

// Manejo de peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Token de seguridad interno para llamadas
define('ATECA_SECURITY_TOKEN', 'ateca_iesb_sec_2026_9d');

// Verificar token en operaciones de escritura
function verifySecurity() {
    $clientToken = $_SERVER['HTTP_X_ATECA_TOKEN'] ?? '';
    if ($clientToken !== ATECA_SECURITY_TOKEN) {
        // Permitir si la llamada procede del mismo host con cookie/sesión válida
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $refHost = parse_url($referer, PHP_URL_HOST);
        $currentHost = $_SERVER['HTTP_HOST'] ?? '';
        if (empty($refHost) || $refHost !== $currentHost) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Acceso no autorizado (Token o Referer inválido)']);
            exit;
        }
    }
}

// Directorio y archivo de almacenamiento seguro
$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/store.json';
$authCodesFile = $dataDir . '/auth_codes.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

// Cargar y guardar códigos temporales de autenticación (OTP 5 min)
function loadAuthCodes($file) {
    if (!file_exists($file)) return [];
    $fp = @fopen($file, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function saveAuthCodes($file, $data) {
    $content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($content === false) return false;
    $tmpFile = $file . '.tmp.' . uniqid();
    if (@file_put_contents($tmpFile, $content, LOCK_EX) === false) {
        return false;
    }
    if (!@rename($tmpFile, $file)) {
        @unlink($tmpFile);
        return @file_put_contents($file, $content, LOCK_EX) !== false;
    }
    return true;
}

// Función para obtener la plantilla base por defecto
function getDefaultStore() {
    return [
        'config' => [
            'nombre_centro' => 'IES Agustín de Betancourt',
            'nombre_aula' => 'Aula ATECA Innovación',
            'horario_inicio' => '08:00',
            'horario_fin' => '22:30',
            'duracion_minima_reserva' => '30',
            'duracion_maxima_reserva' => '360',
            'email_coordinador' => 'jpacdia@gobiernodecanarias.org',
            'logo_centro' => '/logo_iesb.png',
            'google_sheets_url' => '',
            'google_sheets_doc_url' => ''
        ],
        'usuarios' => [
            [
                'id_usuario' => 'u-1',
                'nombre' => 'José Díaz',
                'email' => 'jpacdia@gobiernodecanarias.org',
                'rol' => 'ADMIN',
                'departamento' => 'Informática',
                'turno' => 'Ambos',
                'activo' => true
            ]
        ],
        'reservas' => [],
        'valoraciones' => [],
        'bloqueos' => [],
        'dias_no_habiles' => [
            ['id' => 'dnh-1', 'fecha_inicio' => '2026-10-12', 'fecha_fin' => '2026-10-12', 'nombre' => 'Fiesta Nacional de España', 'tipo' => 'FESTIVO'],
            ['id' => 'dnh-2', 'fecha_inicio' => '2026-11-01', 'fecha_fin' => '2026-11-01', 'nombre' => 'Todos los Santos', 'tipo' => 'FESTIVO'],
            ['id' => 'dnh-3', 'fecha_inicio' => '2026-11-02', 'fecha_fin' => '2026-11-02', 'nombre' => 'Lunes siguiente a Todos los Santos', 'tipo' => 'FESTIVO'],
            ['id' => 'dnh-4', 'fecha_inicio' => '2026-11-27', 'fecha_fin' => '2026-11-27', 'nombre' => 'Día del Enseñante y del Estudiante', 'tipo' => 'LIBRE_DISPOSICION'],
            ['id' => 'dnh-5', 'fecha_inicio' => '2026-12-06', 'fecha_fin' => '2026-12-08', 'nombre' => 'Puente de la Constitución e Inmaculada', 'tipo' => 'FESTIVO'],
            ['id' => 'dnh-6', 'fecha_inicio' => '2027-05-30', 'fecha_fin' => '2027-05-30', 'nombre' => 'Día de Canarias', 'tipo' => 'FESTIVO']
        ],
        'updated_at' => date('c')
    ];
}

// Cargar datos actuales con bloqueo compartido
function loadStore($dataFile) {
    if (!file_exists($dataFile)) {
        $default = getDefaultStore();
        saveStore($dataFile, $default);
        return $default;
    }

    $fp = fopen($dataFile, 'r');
    if (!$fp) return getDefaultStore();

    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    $json = json_decode($content, true);
    return is_array($json) ? $json : getDefaultStore();
}

// Guardar datos con bloqueo exclusivo y escritura atómica
function saveStore($dataFile, $data) {
    $data['updated_at'] = date('c');
    $content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($content === false) return false;

    $tmpFile = $dataFile . '.tmp.' . uniqid();
    if (file_put_contents($tmpFile, $content, LOCK_EX) === false) {
        return false;
    }

    if (!rename($tmpFile, $dataFile)) {
        @unlink($tmpFile);
        return file_put_contents($dataFile, $content, LOCK_EX) !== false;
    }

    return true;
}

// Determinación de la acción solicitada y lectura del payload
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$rawInput = file_get_contents('php://input');
$requestData = !empty($rawInput) ? json_decode($rawInput, true) : [];
if (!is_array($requestData)) {
    $requestData = [];
}

if (empty($action) && isset($requestData['action'])) {
    $action = $requestData['action'];
}

switch ($action) {
    case 'ping':
        echo json_encode(['success' => true, 'status' => 'online', 'time' => time()]);
        break;

    case 'load':
        $store = loadStore($dataFile);
        echo json_encode(['success' => true, 'data' => $store]);
        break;

    case 'save_all':
        verifySecurity();
        $payload = $requestData['data'] ?? json_decode(file_get_contents('php://input'), true)['data'] ?? null;
        if (!is_array($payload)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
            exit;
        }

        $current = loadStore($dataFile);
        // Mezclar con los campos recibidos
        foreach (['config', 'usuarios', 'reservas', 'valoraciones', 'bloqueos', 'dias_no_habiles'] as $k) {
            if (isset($payload[$k]) && is_array($payload[$k])) {
                $current[$k] = $payload[$k];
            }
        }

        if (saveStore($dataFile, $current)) {
            echo json_encode(['success' => true, 'updated_at' => $current['updated_at']]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al escribir en disco']);
        }
        break;

    case 'save_item':
        verifySecurity();
        $input = $requestData ?? json_decode(file_get_contents('php://input'), true);
        $itemType = $input['item_type'] ?? '';
        $item = $input['item'] ?? null;

        if (!$itemType || !$item) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Faltan parámetros requeridos']);
            exit;
        }

        $store = loadStore($dataFile);

        if ($itemType === 'reserva') {
            $id = $item['id_reserva'] ?? '';
            if ($id) {
                $found = false;
                foreach ($store['reservas'] as &$r) {
                    if ($r['id_reserva'] === $id) {
                        $r = $item;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $store['reservas'][] = $item;
                }
            }
        } elseif ($itemType === 'usuario') {
            $email = strtolower(trim($item['email'] ?? ''));
            if ($email) {
                $found = false;
                foreach ($store['usuarios'] as &$u) {
                    if (strtolower(trim($u['email'] ?? '')) === $email) {
                        $u = $item;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $store['usuarios'][] = $item;
                }
            }
        } elseif ($itemType === 'config') {
            if (is_array($item)) {
                $store['config'] = array_merge($store['config'] ?? [], $item);
            }
        } elseif ($itemType === 'valoracion') {
            $id = $item['id_valoracion'] ?? '';
            if ($id) {
                $found = false;
                foreach ($store['valoraciones'] as &$v) {
                    if ($v['id_valoracion'] === $id) {
                        $v = $item;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $store['valoraciones'][] = $item;
                }
            }
        } elseif ($itemType === 'bloqueo') {
            $id = $item['id_bloqueo'] ?? $item['id'] ?? '';
            if ($id) {
                $found = false;
                foreach ($store['bloqueos'] as &$b) {
                    if (($b['id_bloqueo'] ?? $b['id'] ?? '') === $id) {
                        $b = $item;
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    $store['bloqueos'][] = $item;
                }
            }
        }

        if (saveStore($dataFile, $store)) {
            echo json_encode(['success' => true, 'updated_at' => $store['updated_at']]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al persistir item']);
        }
        break;

    case 'delete_item':
        verifySecurity();
        $input = $requestData ?? json_decode(file_get_contents('php://input'), true);
        $itemType = $input['item_type'] ?? '';
        $id = $input['id'] ?? '';

        if (!$itemType || !$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Faltan parámetros requeridos']);
            exit;
        }

        $store = loadStore($dataFile);

        if ($itemType === 'reserva') {
            if (!isset($store['deleted_reservas']) || !is_array($store['deleted_reservas'])) {
                $store['deleted_reservas'] = [];
            }
            if (!in_array($id, $store['deleted_reservas'])) {
                $store['deleted_reservas'][] = $id;
            }
            $store['reservas'] = array_values(array_filter($store['reservas'], function($r) use ($id) {
                return ($r['id_reserva'] ?? '') !== $id;
            }));
        } elseif ($itemType === 'bloqueo') {
            $store['bloqueos'] = array_values(array_filter($store['bloqueos'], function($b) use ($id) {
                return (($b['id_bloqueo'] ?? $b['id'] ?? '')) !== $id;
            }));
        }

        if (saveStore($dataFile, $store)) {
            echo json_encode(['success' => true, 'updated_at' => $store['updated_at']]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al eliminar']);
        }
        break;

    case 'send_email':
        verifySecurity();
        $input = $requestData ?? json_decode(file_get_contents('php://input'), true);
        $to = filter_var(trim($input['to'] ?? ''), FILTER_VALIDATE_EMAIL);
        $subject = trim($input['subject'] ?? '');
        $htmlBody = $input['htmlBody'] ?? '';
        $textBody = $input['textBody'] ?? strip_tags($htmlBody);

        if (!$to || !$subject || !$htmlBody) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Parámetros de correo incompletos']);
            exit;
        }

        $store = loadStore($dataFile);
        $config = $store['config'] ?? [];
        $coordEmail = $config['email_coordinador'] ?? 'jpacdia@gobiernodecanarias.org';
        $centerName = $config['nombre_centro'] ?? 'IES Agustín de Betancourt';

        // 1. Envío directo desde el servidor Hostinger con PHP mail() en UTF-8
        $fromName = 'Aula ATECA - ' . $centerName;
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <ateca@fpapps.es>',
            'Reply-To: ' . $coordEmail,
            'X-Mailer: PHP/' . phpversion(),
            'X-Priority: 1 (Highest)',
        ];

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $mailSent = @mail($to, $encodedSubject, $htmlBody, implode("\r\n", $headers));

        // 2. Reenvío secundario mediante Google Apps Script si está configurado
        $gsheetUrl = $config['google_sheets_url'] ?? '';
        $gsheetSent = false;
        if (!empty($gsheetUrl) && filter_var($gsheetUrl, FILTER_VALIDATE_URL)) {
            $ch = curl_init($gsheetUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain; charset=utf-8']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'action' => 'sendEmail',
                'to' => $to,
                'subject' => $subject,
                'htmlBody' => $htmlBody,
                'textBody' => $textBody
            ]));
            $resp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($httpCode >= 200 && $httpCode < 400) {
                $gsheetSent = true;
            }
        }

        echo json_encode([
            'success' => $mailSent || $gsheetSent,
            'mail_sent' => $mailSent,
            'gsheet_sent' => $gsheetSent,
            'recipient' => $to,
        ]);
        break;

    case 'request_login_code':
        verifySecurity();
        $email = strtolower(trim($_POST['email'] ?? $requestData['email'] ?? $_GET['email'] ?? ''));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Introduce una dirección de correo válida.']);
            exit;
        }

        if (!str_ends_with($email, '@gobiernodecanarias.org')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Acceso restringido: Debes identificarte con tu cuenta oficial del Gobierno de Canarias (@gobiernodecanarias.org).']);
            exit;
        }

        $store = loadStore($dataFile);
        $usuarios = $store['usuarios'] ?? [];
        $existingUser = null;
        foreach ($usuarios as $u) {
            if (strtolower(trim($u['email'] ?? '')) === $email) {
                $existingUser = $u;
                break;
            }
        }

        if ($existingUser && empty($existingUser['activo'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Tu usuario existe pero se encuentra DESACTIVADO. Contacta con la Coordinación o Administración del centro.']);
            exit;
        }

        // Generar código aleatorio de 6 dígitos
        $code = (string) random_int(100000, 999999);
        $expiresIn = 300; // 5 minutos exactos
        $expiresAt = time() + $expiresIn;

        // Cargar códigos y purgar los vencidos
        $authCodes = loadAuthCodes($authCodesFile);
        $now = time();
        foreach ($authCodes as $k => $item) {
            if (($item['expires_at'] ?? 0) < $now) {
                unset($authCodes[$k]);
            }
        }

        $authCodes[$email] = [
            'code' => $code,
            'expires_at' => $expiresAt,
            'attempts' => 0,
            'created_at' => $now
        ];
        saveAuthCodes($authCodesFile, $authCodes);

        // Preparar plantilla institucional de correo
        $config = $store['config'] ?? [];
        $centerName = $config['nombre_centro'] ?? 'IES Agustín de Betancourt';
        $coordEmail = $config['email_coordinador'] ?? 'jpacdia@gobiernodecanarias.org';

        $subject = '🔐 Código de acceso Gestor ATECA: ' . $code;
        $htmlBody = '<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Código de Acceso</title></head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <div style="max-width:540px;margin:0 auto;background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.4);">
    <div style="background:#0f172a;padding:24px;border-bottom:1px solid #334155;text-align:center;">
      <h1 style="margin:0;font-size:18px;color:#e2e8f0;font-weight:800;letter-spacing:0.5px;">' . htmlspecialchars($centerName) . '</h1>
      <p style="margin:4px 0 0 0;font-size:13px;color:#818cf8;font-weight:600;">Aula ATECA • Gestor de Reservas</p>
    </div>
    <div style="padding:28px 24px;text-align:center;">
      <div style="display:inline-block;padding:6px 14px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.3);border-radius:20px;font-size:12px;color:#a5b4fc;font-weight:700;margin-bottom:16px;">
        Autenticación Oficial Docente (2FA)
      </div>
      <h2 style="margin:0 0 8px 0;font-size:20px;color:#f8fafc;font-weight:700;">Tu Código de Verificación</h2>
      <p style="margin:0 0 24px 0;font-size:13px;color:#94a3b8;line-height:1.5;">
        Introduce el siguiente código en la pantalla de acceso del Gestor ATECA para verificar tu identidad:
      </p>
      
      <div style="background:#0f172a;border:2px dashed #6366f1;border-radius:12px;padding:18px;margin:0 auto 24px auto;max-width:280px;">
        <span style="font-family:\'Courier New\',Courier,monospace;font-size:38px;font-weight:900;letter-spacing:8px;color:#38bdf8;">' . $code . '</span>
      </div>

      <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:12px;margin-bottom:20px;text-align:left;">
        <p style="margin:0;font-size:12px;color:#fcd34d;line-height:1.4;">
          ⏳ <strong>Caducidad estricta:</strong> Este código vence en <strong>5 minutos</strong>. Pasado ese tiempo deberás solicitar uno nuevo.
        </p>
      </div>

      <p style="margin:0;font-size:11px;color:#64748b;line-height:1.4;">
        🔒 Si no has solicitado este acceso, puedes ignorar este mensaje de forma segura. Nadie podrá acceder a tu cuenta sin introducir este código numérico.
      </p>
    </div>
    <div style="background:#0f172a;padding:14px;border-top:1px solid #334155;text-align:center;">
      <p style="margin:0;font-size:10px;color:#64748b;">
        Gestor de Reservas Aula ATECA • ' . htmlspecialchars($centerName) . '
      </p>
    </div>
  </div>
</body>
</html>';
        $textBody = "Tu código de verificación para el Gestor ATECA es: " . $code . "\n\nVálido durante 5 minutos.";

        $fromName = 'Aula ATECA - ' . $centerName;
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <ateca@fpapps.es>',
            'Reply-To: ' . $coordEmail,
            'X-Mailer: PHP/' . phpversion(),
            'X-Priority: 1 (Highest)',
        ];
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $mailSent = @mail($email, $encodedSubject, $htmlBody, implode("\r\n", $headers));

        // Copia a Google Sheets si está configurado
        $gsheetUrl = $config['google_sheets_url'] ?? '';
        $gsheetSent = false;
        if (!empty($gsheetUrl) && filter_var($gsheetUrl, FILTER_VALIDATE_URL)) {
            $ch = curl_init($gsheetUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain; charset=utf-8']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'action' => 'sendEmail',
                'to' => $email,
                'subject' => $subject,
                'htmlBody' => $htmlBody,
                'textBody' => $textBody
            ]));
            $resp = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($httpCode >= 200 && $httpCode < 400) {
                $gsheetSent = true;
            }
        }

        echo json_encode([
            'success' => true,
            'email' => $email,
            'expires_in' => $expiresIn,
            'mail_sent' => $mailSent,
            'gsheet_sent' => $gsheetSent
        ]);
        break;

    case 'verify_login_code':
        verifySecurity();
        $email = strtolower(trim($_POST['email'] ?? $requestData['email'] ?? $_GET['email'] ?? ''));
        $code = trim($_POST['code'] ?? $requestData['code'] ?? $_GET['code'] ?? '');

        if (!$email || !$code) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Debes proporcionar correo y código de verificación.']);
            exit;
        }

        $authCodes = loadAuthCodes($authCodesFile);
        if (!isset($authCodes[$email])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'No hay ningún código activo para este correo. Por favor, solicita uno nuevo.']);
            exit;
        }

        $entry = $authCodes[$email];
        $now = time();

        // Comprobar caducidad de 5 minutos
        if ($now > ($entry['expires_at'] ?? 0)) {
            unset($authCodes[$email]);
            saveAuthCodes($authCodesFile, $authCodes);
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'El código de seguridad ha caducado (venció a los 5 minutos). Solicita uno nuevo.']);
            exit;
        }

        // Comprobar límite de 5 intentos
        if (($entry['attempts'] ?? 0) >= 5) {
            unset($authCodes[$email]);
            saveAuthCodes($authCodesFile, $authCodes);
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Has superado el límite de 5 intentos fallidos. Solicita un nuevo código por seguridad.']);
            exit;
        }

        // Comprobar coincidencia exacta del código
        if ($code !== (string) ($entry['code'] ?? '')) {
            $authCodes[$email]['attempts'] = ($entry['attempts'] ?? 0) + 1;
            saveAuthCodes($authCodesFile, $authCodes);
            $remaining = 5 - $authCodes[$email]['attempts'];
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => "Código incorrecto. Te quedan {$remaining} intentos.",
                'remaining_attempts' => $remaining
            ]);
            exit;
        }

        // Código válido -> Eliminarlo de inmediato para evitar reutilización
        unset($authCodes[$email]);
        saveAuthCodes($authCodesFile, $authCodes);

        // Obtener o registrar usuario en store
        $store = loadStore($dataFile);
        $usuarios = $store['usuarios'] ?? [];
        $targetUser = null;
        foreach ($usuarios as $u) {
            if (strtolower(trim($u['email'] ?? '')) === $email) {
                $targetUser = $u;
                break;
            }
        }

        if (!$targetUser) {
            $nameParts = explode('@', $email)[0];
            $cleanName = ucwords(str_replace('.', ' ', $nameParts));
            $targetUser = [
                'id_usuario' => 'u-' . substr(md5(uniqid($email, true)), 0, 8),
                'nombre' => $cleanName,
                'email' => $email,
                'rol' => 'PROFESOR',
                'departamento' => 'General',
                'turno' => 'Ambos',
                'activo' => true
            ];
            $store['usuarios'][] = $targetUser;
            saveStore($dataFile, $store);
        } else if (empty($targetUser['activo'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Tu usuario existe pero se encuentra DESACTIVADO. Contacta con la Coordinación o Administración del centro.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'user' => $targetUser
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
        break;
}
