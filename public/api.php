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

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
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

// Determinación de la acción solicitada
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Si no viene por parámetro, verificar JSON payload
if (empty($action)) {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $parsedInput = json_decode($rawInput, true);
        if (is_array($parsedInput) && isset($parsedInput['action'])) {
            $action = $parsedInput['action'];
            $requestData = $parsedInput;
        }
    }
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

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
        break;
}
