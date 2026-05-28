<?php

$recipient = 'softgrainaudioform@gmail.com';
$sender = 'no-reply@softgrainaudio.com';
$maxFiles = 5;
$maxTotalBytes = 25 * 1024 * 1024;
$allowedExtensions = array('mp3', 'wav', 'aiff', 'aif', 'm4a', 'mp4', 'mov', 'jpg', 'jpeg', 'png', 'pdf', 'txt', 'doc', 'docx');
$isAjax = strtolower(isset($_SERVER['HTTP_X_REQUESTED_WITH']) ? $_SERVER['HTTP_X_REQUESTED_WITH'] : '') === 'xmlhttprequest';
$smtpConfigPath = __DIR__ . DIRECTORY_SEPARATOR . 'smtp-config.php';
$smtpConfig = file_exists($smtpConfigPath) ? include($smtpConfigPath) : null;

ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . DIRECTORY_SEPARATOR . 'php-error.log');
ini_set('display_errors', '0');
error_reporting(E_ALL);

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
        header('HTTP/1.1 400 Bad Request');
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => false, 'message' => $message));
        exit;
    }

    header('Location: thanks.html?status=error&message=' . rawurlencode($message));
    exit;
}

function delivery_error_response($requestId, $detail)
{
    $message = 'Your request was stored with ID ' . $requestId . ', but the email delivery did not complete. ' . $detail;
    fail_response($message);
}

register_shutdown_function(function () {
    $error = error_get_last();

    if (!$error) {
        return;
    }

    $fatalTypes = array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR);

    if (!in_array($error['type'], $fatalTypes, true)) {
        return;
    }

    $line = '[' . date('c') . '] Fatal error: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line'] . "\n";
    file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . 'php-error.log', $line, FILE_APPEND);
});

function success_response($requestId, $emailStatus)
{
    global $isAjax;

    $redirect = 'thanks.html?status=ok&id=' . rawurlencode($requestId) . '&email=' . rawurlencode($emailStatus);

    if ($isAjax) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(array('ok' => true, 'redirect' => $redirect));
        exit;
    }

    header('Location: ' . $redirect);
    exit;
}

function smtp_read($socket)
{
    $response = '';

    while (!feof($socket)) {
        $line = fgets($socket, 515);
        $response .= $line;

        if (strlen($line) < 4 || substr($line, 3, 1) === ' ') {
            break;
        }
    }

    return $response;
}

function smtp_command($socket, $command, $expected)
{
    if ($command !== null) {
        fwrite($socket, $command . "\r\n");
    }

    $response = smtp_read($socket);
    $code = (int) substr($response, 0, 3);

    if (!in_array($code, (array) $expected, true)) {
        return array(false, trim($response));
    }

    return array(true, trim($response));
}

function encode_header($value)
{
    return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function email_address($email, $name)
{
    $email = clean_text($email);
    $name = clean_text($name);

    if ($name === '') {
        return '<' . $email . '>';
    }

    return encode_header($name) . ' <' . $email . '>';
}

function build_email_message($to, $subject, $body, $fromEmail, $fromName, $replyToEmail, $replyToName, $attachments)
{
    $boundary = 'softgrain_' . md5(uniqid('', true));
    $headers = array(
        'From: ' . email_address($fromEmail, $fromName),
        'To: ' . $to,
        'Subject: ' . encode_header($subject),
        'Reply-To: ' . email_address($replyToEmail, $replyToName),
        'MIME-Version: 1.0',
    );

    if (!count($attachments)) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        return implode("\r\n", $headers) . "\r\n\r\n" . $body;
    }

    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $message = implode("\r\n", $headers) . "\r\n\r\n";
    $message .= '--' . $boundary . "\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $message .= $body . "\r\n\r\n";

    foreach ($attachments as $attachment) {
        if (!isset($attachment['path']) || !is_file($attachment['path'])) {
            continue;
        }

        $fileName = isset($attachment['name']) ? $attachment['name'] : basename($attachment['path']);
        $fileType = isset($attachment['type']) ? $attachment['type'] : 'application/octet-stream';
        $fileData = chunk_split(base64_encode(file_get_contents($attachment['path'])));

        $message .= '--' . $boundary . "\r\n";
        $message .= 'Content-Type: ' . $fileType . '; name="' . addslashes($fileName) . '"' . "\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n";
        $message .= 'Content-Disposition: attachment; filename="' . addslashes($fileName) . '"' . "\r\n\r\n";
        $message .= $fileData . "\r\n";
    }

    $message .= '--' . $boundary . "--\r\n";

    return $message;
}

function send_with_smtp($config, $to, $subject, $body, $replyToEmail, $replyToName, $attachments)
{
    $host = isset($config['host']) ? trim($config['host']) : '';
    $port = isset($config['port']) ? (int) $config['port'] : 587;
    $secure = isset($config['secure']) ? strtolower(trim($config['secure'])) : 'tls';
    $username = isset($config['username']) ? trim($config['username']) : '';
    $password = isset($config['password']) ? preg_replace('/\s+/', '', (string) $config['password']) : '';
    $fromEmail = isset($config['from_email']) ? trim($config['from_email']) : $username;
    $fromName = isset($config['from_name']) ? trim($config['from_name']) : 'Softgrain Audio';

    if ($host === '' || $username === '' || $password === '' || $password === 'PASTE_APP_PASSWORD_HERE' || $fromEmail === '') {
        return array(false, 'SMTP config is incomplete.');
    }

    $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $errorNumber = 0;
    $errorString = '';
    $socket = @stream_socket_client($remote, $errorNumber, $errorString, 30);

    if (!$socket) {
        return array(false, 'SMTP connection failed: ' . $errorString);
    }

    stream_set_timeout($socket, 30);

    $result = smtp_command($socket, null, 220);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP greeting failed: ' . $result[1]);
    }

    $serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'softgrainaudio.com';
    $result = smtp_command($socket, 'EHLO ' . $serverName, 250);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP EHLO failed: ' . $result[1]);
    }

    if ($secure === 'tls') {
        $result = smtp_command($socket, 'STARTTLS', 220);
        if (!$result[0]) {
            fclose($socket);
            return array(false, 'SMTP STARTTLS failed: ' . $result[1]);
        }

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return array(false, 'SMTP TLS negotiation failed.');
        }

        $result = smtp_command($socket, 'EHLO ' . $serverName, 250);
        if (!$result[0]) {
            fclose($socket);
            return array(false, 'SMTP EHLO after TLS failed: ' . $result[1]);
        }
    }

    $result = smtp_command($socket, 'AUTH LOGIN', 334);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP AUTH failed: ' . $result[1]);
    }

    $result = smtp_command($socket, base64_encode($username), 334);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP username rejected: ' . $result[1]);
    }

    $result = smtp_command($socket, base64_encode($password), 235);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP password rejected: ' . $result[1]);
    }

    $result = smtp_command($socket, 'MAIL FROM:<' . $fromEmail . '>', 250);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP sender rejected: ' . $result[1]);
    }

    $result = smtp_command($socket, 'RCPT TO:<' . $to . '>', array(250, 251));
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP recipient rejected: ' . $result[1]);
    }

    $result = smtp_command($socket, 'DATA', 354);
    if (!$result[0]) {
        fclose($socket);
        return array(false, 'SMTP DATA rejected: ' . $result[1]);
    }

    $rawMessage = build_email_message($to, $subject, $body, $fromEmail, $fromName, $replyToEmail, $replyToName, $attachments);
    $rawMessage = str_replace("\r\n.", "\r\n..", $rawMessage);
    fwrite($socket, $rawMessage . "\r\n.\r\n");

    $response = smtp_read($socket);
    $code = (int) substr($response, 0, 3);

    smtp_command($socket, 'QUIT', 221);
    fclose($socket);

    if ($code !== 250) {
        return array(false, 'SMTP message rejected: ' . trim($response));
    }

    return array(true, 'sent');
}

function send_email($to, $subject, $body, $replyToEmail, $replyToName, $attachments)
{
    global $smtpConfig, $sender;

    if (!is_array($smtpConfig)) {
        return array(false, 'smtp', 'Missing smtp-config.php on the hosting.');
    }

    if (is_array($smtpConfig)) {
        $result = send_with_smtp($smtpConfig, $to, $subject, $body, $replyToEmail, $replyToName, $attachments);
        return array($result[0], 'smtp', $result[1]);
    }
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
    count($storedFiles) ? 'Note: files are stored on the hosting and are not attached to this email to avoid delivery limits.' : '',
));

file_put_contents($requestDir . DIRECTORY_SEPARATOR . 'submission.txt', $plainMessage . "\n");

$internalResult = send_email($recipient, $subject, $plainMessage, $email, $name, array());
$sent = $internalResult[0];

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
$autoResult = send_email($email, $autoSubject, $autoMessage, $recipient, 'Softgrain Audio', array());
$autoSent = $autoResult[0];
$emailStatus = ($sent && $autoSent && $internalResult[1] === 'smtp' && $autoResult[1] === 'smtp') ? 'sent' : 'recorded';

file_put_contents(
    $requestDir . DIRECTORY_SEPARATOR . 'submission.txt',
    "\nInternal notification sent: " . ($sent ? 'yes' : 'no') .
        "\nInternal method: " . $internalResult[1] .
        "\nInternal detail: " . $internalResult[2] .
        "\nAutoresponder sent: " . ($autoSent ? 'yes' : 'no') .
        "\nAutoresponder method: " . $autoResult[1] .
        "\nAutoresponder detail: " . $autoResult[2] . "\n",
    FILE_APPEND
);

if ($emailStatus !== 'sent') {
    $deliveryDetail = 'Please configure authenticated SMTP on the hosting and try again.';

    if (!$sent && $internalResult[1] === 'smtp') {
        $deliveryDetail = 'SMTP detail: ' . $internalResult[2];
    } elseif (!$autoSent && $autoResult[1] === 'smtp') {
        $deliveryDetail = 'SMTP detail: ' . $autoResult[2];
    }

    delivery_error_response($requestId, $deliveryDetail);
}

success_response($requestId, $emailStatus);
