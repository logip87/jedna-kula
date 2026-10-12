<?php
// Small same-origin contact endpoint. No profile, training history or IPs in email.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
function reply(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    reply(405, ['error' => 'Niedozwolona metoda.']);
}
if ($method === 'POST' && ($_SERVER['HTTP_ORIGIN'] ?? '') !== 'https://jednakula.progtest.pl') {
    reply(403, ['error' => 'Otwórz formularz w aplikacji Jedna Kula i spróbuj ponownie.']);
}
session_name('jednakula_feedback');
session_set_cookie_params(['lifetime' => 0, 'path' => '/api/', 'secure' => true, 'httponly' => true, 'samesite' => 'Strict']);
if (!session_start()) reply(503, ['error' => 'Formularz jest chwilowo niedostępny. Spróbuj ponownie.']);
if (!isset($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
if ($method === 'GET') reply(200, ['csrf' => $_SESSION['csrf']]);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) reply(415, ['error' => 'Nieprawidłowy format zgłoszenia.']);
$raw = file_get_contents('php://input', false, null, 0, 20001);
if ($raw === false || strlen($raw) > 20000) reply(413, ['error' => 'Zgłoszenie jest za długie.']);
$data = json_decode($raw, true);
if (!is_array($data)) reply(400, ['error' => 'Nieprawidłowe zgłoszenie.']);
foreach (['kind', 'message', 'email', 'website', 'csrf'] as $field) {
    if (!isset($data[$field]) || !is_string($data[$field])) reply(400, ['error' => 'Uzupełnij formularz i spróbuj ponownie.']);
}
if (!hash_equals($_SESSION['csrf'], $data['csrf'])) reply(403, ['error' => 'Odśwież formularz i spróbuj ponownie.']);
if ($data['website'] !== '') reply(400, ['error' => 'Nie udało się przyjąć zgłoszenia.']);
if (!in_array($data['kind'], ['idea', 'problem'], true)) reply(400, ['error' => 'Wybierz pomysł lub problem.']);
$message = trim($data['message']);
$email = trim($data['email']);
if (preg_match('//u', $message) !== 1 || strpos($message, "\0") !== false) reply(400, ['error' => 'Nieprawidłowa treść zgłoszenia.']);
$length = preg_match_all('/./us', $message);
if ($length < 10 || $length > 5000) reply(400, ['error' => 'Zgłoszenie powinno mieć od 10 do 5000 znaków.']);
if ($email !== '' && (strlen($email) > 254 || preg_match('/[\r\n\0]/', $email) || !filter_var($email, FILTER_VALIDATE_EMAIL))) reply(400, ['error' => 'Podaj poprawny adres e-mail albo pozostaw pole puste.']);
$now = time();
$recent = array_values(array_filter($_SESSION['sent'] ?? [], static function ($t) use ($now) { return is_int($t) && $t > $now - 900; }));
if (count($recent) >= 3) reply(429, ['error' => 'Wysłano już kilka zgłoszeń. Spróbuj ponownie za 15 minut.']);
// Shared abuse limit contains timestamps only, and is outside the public website.
$limit = @fopen(sys_get_temp_dir() . '/jednakula-feedback-limit-v1.json', 'c+');
if (!$limit || !flock($limit, LOCK_EX)) reply(503, ['error' => 'Formularz jest chwilowo niedostępny. Spróbuj ponownie.']);
$timestamps = json_decode(stream_get_contents($limit), true);
$timestamps = array_values(array_filter(is_array($timestamps) ? $timestamps : [], static function ($t) use ($now) { return is_int($t) && $t > $now - 3600; }));
if (count($timestamps) >= 50) {
    flock($limit, LOCK_UN);
    fclose($limit);
    reply(429, ['error' => 'Formularz obsługuje teraz wiele zgłoszeń. Spróbuj ponownie później.']);
}
$timestamps[] = $now;
ftruncate($limit, 0);
rewind($limit);
$written = fwrite($limit, json_encode($timestamps));
fflush($limit);
flock($limit, LOCK_UN);
fclose($limit);
if ($written === false) reply(503, ['error' => 'Formularz jest chwilowo niedostępny. Spróbuj ponownie.']);
$_SESSION['sent'] = array_merge($recent, [$now]);
session_write_close();
$kind = $data['kind'] === 'problem' ? 'Problem' : 'Pomysł';
$subject = '=?UTF-8?B?' . base64_encode('Jedna Kula — ' . $kind) . '?=';
$body = "Zgłoszenie z formularza Jedna Kula\n\nRodzaj: " . $kind . "\nE-mail do odpowiedzi: " . ($email !== '' ? $email : 'nie podano') . "\n\n" . $message . "\n";
$headers = [
    'From: Jedna Kula <zgloszenia@jednakula.progtest.pl>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
];
if ($email !== '') $headers[] = 'Reply-To: ' . $email;
if (!function_exists('mail') || !@mail('p.logasz@gmail.com', $subject, chunk_split(base64_encode($body)), implode("\r\n", $headers))) {
    reply(503, ['error' => 'Serwer nie mógł wysłać wiadomości. Treść pozostaje w formularzu — spróbuj ponownie później.']);
}
reply(200, ['ok' => true]);
