<?php
// Privacy-first beta analytics. This endpoint deliberately stores only the
// allow-listed event envelope; it never reads cookies, IPs, profile or form data.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
function analytics_reply(int $status, array $body): void { http_response_code($status); echo json_encode($body); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { header('Allow: POST'); analytics_reply(405, ['error' => 'Niedozwolona metoda.']); }
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) analytics_reply(415, ['error' => 'Nieprawidłowy format.']);
$raw = file_get_contents('php://input', false, null, 0, 50001);
if ($raw === false || strlen($raw) > 50000) analytics_reply(413, ['error' => 'Zbyt duże żądanie.']);
$payload = json_decode($raw, true);
$events = is_array($payload) ? ($payload['events'] ?? null) : null;
if (!is_array($events) || count($events) < 1 || count($events) > 100) analytics_reply(400, ['error' => 'Nieprawidłowe zdarzenia.']);
$names = ['app_open','today_view','training_picker_view','training_start','training_complete','training_abandon','recommendation_view','recommendation_click','weakness_view','adventure_view','adventure_start','mental_view','mental_start','physical_view','physical_start','rules_view','tactics_view','history_view','feedback_open','feedback_submit','summary_view','weekly_challenge_view','personal_best_view','recommended_training_start','recommended_training_complete','manual_training_start','match_mode_start','mental_module_start','physical_module_start','precision_shooting_start'];
$modules = ['training','adventure','mental','physical','rules','tactics','feedback'];
$sources = ['recommendation','manual','adventure'];
$valid = [];
foreach ($events as $event) {
    if (!is_array($event) || array_diff(array_keys($event), ['eventName','timestamp','clientId','appVersion','currentScreen','deviceType','optionalContext'])) analytics_reply(400, ['error' => 'Niedozwolone pole.']);
    foreach (['eventName','timestamp','clientId','appVersion','currentScreen','deviceType'] as $field) if (!isset($event[$field]) || !is_string($event[$field])) analytics_reply(400, ['error' => 'Nieprawidłowe zdarzenie.']);
    if (!in_array($event['eventName'], $names, true) || !preg_match('/^[a-f0-9-]{36}$/i', $event['clientId']) || !in_array($event['deviceType'], ['mobile','tablet','desktop'], true) || strlen($event['timestamp']) > 35 || strlen($event['appVersion']) > 30 || strlen($event['currentScreen']) > 100) analytics_reply(400, ['error' => 'Nieprawidłowe zdarzenie.']);
    if (isset($event['optionalContext'])) {
        if (!is_array($event['optionalContext']) || array_diff(array_keys($event['optionalContext']), ['module','source'])) analytics_reply(400, ['error' => 'Niedozwolony kontekst.']);
        if (isset($event['optionalContext']['module']) && (!is_string($event['optionalContext']['module']) || !in_array($event['optionalContext']['module'], $modules, true))) analytics_reply(400, ['error' => 'Niedozwolony kontekst.']);
        if (isset($event['optionalContext']['source']) && (!is_string($event['optionalContext']['source']) || !in_array($event['optionalContext']['source'], $sources, true))) analytics_reply(400, ['error' => 'Niedozwolony kontekst.']);
    }
    $valid[] = json_encode($event, JSON_UNESCAPED_SLASHES) . "\n";
}
// Set JEDNA_KULA_ANALYTICS_DIR outside the web root in production. The default
// is also outside public/ for the standard deployment layout.
$directory = getenv('JEDNA_KULA_ANALYTICS_DIR') ?: dirname(__DIR__, 2) . '/private-analytics';
if (!is_dir($directory) && !@mkdir($directory, 0700, true)) analytics_reply(503, ['error' => 'Analityka jest chwilowo niedostępna.']);
$file = $directory . '/events.ndjson';
$handle = @fopen($file, 'ab');
if (!$handle || !flock($handle, LOCK_EX)) analytics_reply(503, ['error' => 'Analityka jest chwilowo niedostępna.']);
$written = fwrite($handle, implode('', $valid)); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
if ($written === false) analytics_reply(503, ['error' => 'Analityka jest chwilowo niedostępna.']);
analytics_reply(202, ['ok' => true]);
