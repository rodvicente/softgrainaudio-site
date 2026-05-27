<?php
declare(strict_types=1);

$recipient = 'softgrainaudioform@gmail.com';
$maxFiles = 5;
$maxTotalBytes = 25 * 1024 * 1024;
$allowedExtensions = ['mp3', 'wav', 'aiff', 'aif', 'm4a', 'mp4', 'mov', 'jpg', 'jpeg', 'png', 'pdf', 'txt', 'doc', 'docx'];

function clean_text(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function fail_response(string $message): void
{
    header('Location: thanks.html?status=error&message=' . rawurlencode($message));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail_response('Invalid request.');
}

$name = clean_text($_POST['name'] ?? '');
$country = clean_text($_POST['country'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
$message = trim($_POST['message'] ?? '');
$language = clean_text($_POST['language'] ?? 'en');

if ($name === '' || $country === '' || !$email || $message === '') {
    fail_response('Please complete all required fields.');
}

$files = $_FILES['referenceFiles'] ?? null;
$attachments = [];
$totalBytes = 0;

if ($files && is_array($files['name'])) {
    $fileCount = count(array_filter($files['name'], fn($fileName) => $fileName !== ''));

    if ($fileCount > $maxFiles) {
        fail_response('Please attach up to 5 files.');
    }

    for ($index = 0; $index < count($files['name']); $index++) {
        if ($files['error'][$index] === UPLOAD_ERR_NO_FILE) {
            continue;
        }

        if ($files['error'][$index] !== UPLOAD_ERR_OK) {
            fail_response('One of the reference files could not be uploaded.');
        }

        $fileName = basename($files['name'][$index]);
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $fileSize = (int) $files['size'][$index];
        $totalBytes += $fileSize;

        if (!in_array($extension, $allowedExtensions, true)) {
            fail_response('One of the reference files has an unsupported format.');
        }

        if ($totalBytes > $maxTotalBytes) {
            fail_response('Reference files can be up to 25 MB total.');
        }

        $attachments[] = [
            'tmp_name' => $files['tmp_name'][$index],
            'name' => $fileName,
            'type' => $files['type'][$index] ?: 'application/octet-stream',
        ];
    }
}

$boundary = 'softgrain-' . bin2hex(random_bytes(16));
$subject = 'Softgrain Audio request - ' . $name;

$plainMessage = implode("\n", [
    'Name: ' . $name,
    'Country: ' . $country,
    'Email: ' . $email,
    'Language: ' . strtoupper($language),
    '',
    'Project / consultation:',
    $message,
    '',
    'Reference files: ' . (count($attachments) ? implode(', ', array_column($attachments, 'name')) : 'none'),
]);

$headers = [
    'From: Softgrain Audio <no-reply@softgrainaudio.com>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
];

$body = '--' . $boundary . "\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $plainMessage . "\r\n";

foreach ($attachments as $attachment) {
    $fileContents = file_get_contents($attachment['tmp_name']);

    if ($fileContents === false) {
        fail_response('One of the reference files could not be read.');
    }

    $body .= '--' . $boundary . "\r\n";
    $body .= 'Content-Type: ' . $attachment['type'] . '; name="' . addslashes($attachment['name']) . '"' . "\r\n";
    $body .= 'Content-Disposition: attachment; filename="' . addslashes($attachment['name']) . '"' . "\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= chunk_split(base64_encode($fileContents)) . "\r\n";
}

$body .= '--' . $boundary . "--\r\n";

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    fail_response('The message could not be sent. Please try again later.');
}

header('Location: thanks.html?status=ok');
exit;
