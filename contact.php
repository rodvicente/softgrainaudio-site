<?php
declare(strict_types=1);

$recipient = 'softgrainaudioform@gmail.com';
$sender = 'no-reply@softgrainaudio.com';
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
$requestId = date('Ymd-His') . '-' . bin2hex(random_bytes(4));
$storageRoot = __DIR__ . DIRECTORY_SEPARATOR . 'private_submissions';
$requestDir = $storageRoot . DIRECTORY_SEPARATOR . $requestId;

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
            'size' => $fileSize,
        ];
    }
}

$subject = 'Softgrain Audio request - ' . $name;

$plainMessage = implode("\n", [
    'Request ID: ' . $requestId,
    'Name: ' . $name,
    'Country: ' . $country,
    'Email: ' . $email,
    'Language: ' . strtoupper($language),
    '',
    'Project / consultation:',
    $message,
    '',
    'Reference files uploaded: ' . (count($attachments) ? implode(', ', array_column($attachments, 'name')) : 'none'),
    'Server folder: private_submissions/' . $requestId,
]);

$storedFiles = [];

if (!is_dir($storageRoot) && !mkdir($storageRoot, 0755, true)) {
    fail_response('The request could not be stored. Please try again later.');
}

if (!is_dir($requestDir) && !mkdir($requestDir, 0755, true)) {
    fail_response('The request could not be stored. Please try again later.');
}

foreach ($attachments as $attachment) {
    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $attachment['name']);
    $destination = $requestDir . DIRECTORY_SEPARATOR . $safeName;

    if (!move_uploaded_file($attachment['tmp_name'], $destination)) {
        fail_response('One of the reference files could not be stored.');
    }

    $storedFiles[] = $safeName;
}

file_put_contents($requestDir . DIRECTORY_SEPARATOR . 'submission.txt', $plainMessage . "\n");

$headers = [
    'From: Softgrain Audio <' . $sender . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = mail($recipient, $subject, $plainMessage, implode("\r\n", $headers), '-f ' . $sender);

if (!$sent) {
    fail_response('The message could not be sent. Please try again later.');
}

header('Location: thanks.html?status=ok&id=' . rawurlencode($requestId));
exit;
