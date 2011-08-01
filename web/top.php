<?php

mb_internal_encoding('utf-8');
mb_regex_encoding('utf-8');
header('Content-type: text/html; charset=utf-8');
session_start();

$config = json_decode(file_get_contents('config.json'));
$config->server->httpAddress = "http://{$config->server->address}:{$config->server->port}/";