<?php
session_start();

$config = array();

// Database configuration.
$config['database'] = array(
	'database_type' => 'mysql',
	'database_name' => 'scroller',
	'server' => 'localhost',
	'username' => 'username',
	'password' => 'password',
	'charset' => 'utf8'
);

// A list of safe domains.
$config['domains'] = array(
	'http://127.0.0.1/scroller/',
);

// Scroller div height.
$config['scroller_height'] = 10000;
