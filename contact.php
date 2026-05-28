<?php

$recipient = 'softgrainaudioform@gmail.com';
$sender = 'no-reply@softgrainaudio.com';
$maxFiles = 5;
$maxTotalBytes = 25 * 1024 * 1024;
$allowedExtensions = array('mp3', 'wav', 'aiff', 'aif', 'm4a', 'mp4', 'mov', 'jpg', 'jpeg', 'png', 'pdf', 'txt', 'doc', 'docx');
$isAjax = strtolower(isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '') === 'xmlhttprequest';

function clean_text($value)
{
    return trim(str_replace(array("\r", "\n"), ' ', (string) $value));
}

function make_request_id()
{
    if (function_exists('random_bytes')) {
        return date('Ymd-His') . '-' . bin2hex(random_bytes(4));
    }

    if (function_exists('openssl_random_pseudo_bytes')) {
        return date('Ymd-His') . '-' . bin2hex(openssl_random_pseudo_bytes(4));
    }

    return date('Ymd-His') . '-' . substr(md5(uniqid('', true)), 0, 8);
}

function size_to_bytes($value)
{
    $value = trim((string) $value);
    $unit = strtolower(substr($value, -1));
    $number = (float) $value;

    switch ($unit) {
        case 'g':
            $number *= 1024;
        case 'm':
            $number *= 1024;
        case 'k':
            $number *= 1024;
    }

    return (int) $number;
}

function fail_response($message)
{
    global $isAjax;

    if ($isAjax) {
        http_response_code(400);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => false, 'message' => $message));
        exit;
    }

    header('Location: thanks.html?status=error&message=' . rawurlencode($message));
    exit;
}

function success_response($requestId)
{
    global $isAjax;

    $redirect = 'thanks.html?status=ok&id=' . rawurlencode($requestId);

    if ($isAjax) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => true, 'redirect' => $redirect));
        exit;
    }

    header('Location: ' . $redirect);
    exit;
}

if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail_response('Invalid request.');
}

$postMaxBytes = size_to_bytes(ini_get('post_max_size'));
$contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;

if ($postMaxBytes > 0 && $contentLength > $postMaxBytes) {
    fail_response('The upload is larger than the server limit. Please try a smaller file or increase post_max_size on the hosting.');
}

$name = clean_text(isset($_POST['name']) ? $_POST['name'] : '');
$country = clean_text(isset($_POST['country']) ? $_POST['country'] : '');
$emailValue = isset($_POST['email']) ? $_POST['email'] : '';
$email = filter_var($emailValue, FILTER_VALIDATE_EMAIL);
$message = trim(isset($_POST['message']) ? $_POST['message'] : '');
$language = clean_text(isset($_POST['language']) ? $_POST['language'] : 'en');

if ($name === '' || $country === '' || !$email || $message === '') {
    fail_response('Please complete all required fields.');
}

$files = isset($_FILES['referenceFiles']) ? $_FILES['referenceFiles'] : null;
$attachments = array();
$totalBytes = 0;
$requestId = make_request_id();
$storageRoot = __DIR__ . DIRECTORY_SEPARATOR . 'private_submissions';
$requestDir = $storageRoot . DIRECTORY_SEPARATOR . $requestId;

if ($files && is_array($files['name'])) {
    $fileCount = 0;

    foreach ($files['name'] as $fileName) {
        if ($fileName !== '') {
            $fileCount++;
        }
    }

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

        $attachments[] = array(
            'tmp_name' => $files['tmp_name'][$index],
            'name' => $fileName,
            'type' => isset($files['type'][$index]) && $files['type'][$index] ? $files['type'][$index] : 'application/octet-stream',
            'size' => $fileSize,
        );
    }
}

if (!is_dir($storageRoot) && !mkdir($storageRoot, 0755, true)) {
    fail_response('The request could not be stored. Please try again later.');
}

if (!is_dir($requestDir) && !mkdir($requestDir, 0755, true)) {
    fail_response('The request could not be stored. Please try again later.');
}

$storedFiles = array();

foreach ($attachments as $attachment) {
    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $attachment['name']);
    $destination = $requestDir . DIRECTORY_SEPARATOR . $safeName;

    if (!move_uploaded_file($attachment['tmp_name'], $destination)) {
        fail_response('One of the reference files could not be stored.');
    }

    $storedFiles[] = $safeName;
}

$subject = 'Softgrain Audio request - ' . $name;
$referenceText = count($storedFiles) ? implode(', ', $storedFiles) : 'none';

$plainMessage = implode("\n", array(
    'Request ID: ' . $requestId,
    'Name: ' . $name,
    'Country: ' . $country,
    'Email: ' . $email,
    'Language: ' . strtoupper($language),
    '',
    'Project / consultation:',
    $message,
    '',
    'Reference files uploaded: ' . $referenceText,
    'Server folder: private_submissions/' . $requestId,
));

file_put_contents($requestDir . DIRECTORY_SEPARATOR . 'submission.txt', $plainMessage . "\n");

$headers = array(
    'From: Softgrain Audio <' . $sender . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
);

$sent = function_exists('mail')
    ? @mail($recipient, $subject, $plainMessage, implode("\r\n", $headers), '-f ' . $sender)
    : false;

if (!$sent) {
    file_put_contents($requestDir . DIRECTORY_SEPARATOR . 'submission.txt', "\nInternal notification sent: no\n", FILE_APPEND);
}

$isSpanish = strtolower($language) === 'es';
$autoSubject = $isSpanish ? 'Softgrain Audio recibió tu mensaje' : 'Softgrain Audio received your message';
$autoMessage = $isSpanish
    ? implode("\n", array(
        'Hola ' . $name . ',',
        '',
        'Gracias por contactar a Softgrain Audio.',
        'Recibimos tu mensaje correctamente y lo vamos a revisar a la brevedad.',
        '',
        'ID de pedido: ' . $requestId,
        '',
        'Si enviaste archivos de referencia, también quedaron asociados a tu pedido.',
        '',
        'Saludos,',
        'Softgrain Audio',
    ))
    : implode("\n", array(
        'Hi ' . $name . ',',
        '',
        'Thanks for contacting Softgrain Audio.',
        'We received your message correctly and will review it shortly.',
        '',
        'Request ID: ' . $requestId,
        '',
        'If you uploaded reference files, they were also associated with your request.',
        '',
        'Best,',
        'Softgrain Audio',
    ));
$autoHeaders = array(
    'From: Softgrain Audio <' . $sender . '>',
    'Reply-To: Softgrain Audio <' . $recipient . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
);
$autoSent = function_exists('mail')
    ? @mail($email, $autoSubject, $autoMessage, implode("\r\n", $autoHeaders), '-f ' . $sender)
    : false;

file_put_contents(
    $requestDir . DIRECTORY_SEPARATOR . 'submission.txt',
    "\nInternal notification sent: " . ($sent ? 'yes' : 'no') . "\nAutoresponder sent: " . ($autoSent ? 'yes' : 'no') . "\n",
    FILE_APPEND
);

success_response($requestId);
