<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

function relay_json(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

function relay_clean_line(string $value, int $limit = 300): string {
  $value = str_replace(["\r", "\n"], ' ', $value);
  $value = trim($value);
  if (strlen($value) > $limit) {
    $value = substr($value, 0, $limit);
  }
  return $value;
}

function relay_clean_body(string $value, int $limit = 30000): string {
  $value = str_replace(["\r\n", "\r"], "\n", $value);
  $value = trim($value);
  if (strlen($value) > $limit) {
    $value = substr($value, 0, $limit);
  }
  return $value;
}

function relay_get_secret(): string {
  $envSecret = getenv('PHP_MAIL_RELAY_SECRET') ?: getenv('MAIL_RELAY_SECRET');
  if (is_string($envSecret) && trim($envSecret) !== '') {
    return trim($envSecret);
  }

  $secretFiles = [
    __DIR__ . '/../mail-relay-secret.php',
    __DIR__ . '/mail-relay-secret.php',
  ];

  foreach ($secretFiles as $file) {
    if (is_file($file)) {
      $value = require $file;
      if (is_string($value) && trim($value) !== '') {
        return trim($value);
      }
    }
  }

  return '';
}

function relay_parse_name_email(string $from): array {
  $from = relay_clean_line($from, 240);

  if (preg_match('/^(.*)<([^>]+)>$/', $from, $matches)) {
    $name = relay_clean_line(trim($matches[1], " \t\"'"), 120);
    $email = relay_clean_line($matches[2], 120);
    return [$name, $email];
  }

  return ['Bouut Music', $from];
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
  relay_json(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$expectedSecret = relay_get_secret();
$providedSecret = $_SERVER['HTTP_X_BOUUT_MAIL_SECRET'] ?? '';

if ($expectedSecret === '' || !hash_equals($expectedSecret, (string) $providedSecret)) {
  relay_json(403, ['ok' => false, 'error' => 'forbidden']);
}

$rawBody = file_get_contents('php://input');
$payload = json_decode(is_string($rawBody) ? $rawBody : '', true);

if (!is_array($payload)) {
  relay_json(400, ['ok' => false, 'error' => 'invalid_json']);
}

$toValue = $payload['to'] ?? [];
$toList = is_array($toValue) ? $toValue : [$toValue];
$recipients = [];

foreach ($toList as $recipient) {
  $email = relay_clean_line((string) $recipient, 180);
  if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $recipients[$email] = $email;
  }
}

$recipients = array_values($recipients);

if (count($recipients) < 1 || count($recipients) > 10) {
  relay_json(400, ['ok' => false, 'error' => 'invalid_recipient_count']);
}

$subject = relay_clean_line((string) ($payload['subject'] ?? ''), 240);
$text = relay_clean_body((string) ($payload['text'] ?? ''));
$html = relay_clean_body((string) ($payload['html'] ?? ''));
$body = $html !== '' ? $html : $text;

if ($subject === '' || $body === '') {
  relay_json(400, ['ok' => false, 'error' => 'missing_subject_or_body']);
}

$defaultFrom = getenv('PHP_MAIL_RELAY_FROM') ?: 'Bouut Music <support@bouutmusic.com>';
$fromValue = is_string($payload['from'] ?? null) && trim((string) $payload['from']) !== ''
  ? (string) $payload['from']
  : (string) $defaultFrom;
[$fromName, $fromEmail] = relay_parse_name_email($fromValue);

if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
  $fromName = 'Bouut Music';
  $fromEmail = 'support@bouutmusic.com';
}

$contentType = $html !== '' ? 'text/html' : 'text/plain';
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$encodedFromName = '=?UTF-8?B?' . base64_encode($fromName !== '' ? $fromName : 'Bouut Music') . '?=';
$headers = [
  'MIME-Version: 1.0',
  'Content-Type: ' . $contentType . '; charset=UTF-8',
  'From: ' . $encodedFromName . ' <' . $fromEmail . '>',
  'Reply-To: ' . $fromEmail,
  'X-Mailer: PHP/' . PHP_VERSION,
];

$sentCount = 0;
$failed = [];

foreach ($recipients as $recipient) {
  $sent = @mail(
    $recipient,
    $encodedSubject,
    $body,
    implode("\r\n", $headers),
    '-f' . $fromEmail
  );

  if ($sent) {
    $sentCount++;
  } else {
    $failed[] = $recipient;
  }
}

if ($sentCount < 1) {
  relay_json(502, ['ok' => false, 'error' => 'mail_send_failed', 'failed' => $failed]);
}

relay_json(200, [
  'ok' => true,
  'sent' => $sentCount,
  'failed' => $failed,
  'id' => bin2hex(random_bytes(8)),
]);
?>
