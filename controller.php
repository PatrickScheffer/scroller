<?php
require_once('config.php');
require_once('lib/medoo.min.php');
require_once('lib/cipher.class.php');
require_once('lib/global.php');

if (!isset($_SERVER['HTTP_REFERER'])) {
	add_log('AJAX', 'No referer found.');
	exit();
}

if (!in_array($_SERVER['HTTP_REFERER'], $config['domains'])) {
	add_log('AJAX', 'Invalid request: HTTP_REFERER (' . $_SERVER['HTTP_REFERER'] . ') is not one of the specified domains.');
	exit();
}

// Check if the request header is correct.
if (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
	add_log('AJAX', 'Invalid request: HTTP_X_REQUESTED_WITH (' . $_SERVER['HTTP_X_REQUESTED_WITH'] . ') is not xmlhttprequest');
	exit();
}

// Check what action to execute.
switch (post('action')) {
	case 'load_scores':
		print load_scores();
		exit;
		break;

	case 'fastest_scroll':
			$score = post('score');
			if (is_numeric($score) && $score > 0) {
				update_score_session($score);
			}
		break;

	case 'submit_score':
		$name = post('name');
		$score = post('score');

		if (empty($name)) {
			add_log('Score Submit', 'Empty name submitted.');
			print 'error';
			exit;
		}

		if (!verify_score($score)) {
			add_log('Score Submit', 'Unable to verify the submitted score.');
			print 'error';
			exit;
		}

		if (submit_score($name, $score)) {
			unset($_SESSION[md5('scroller_fastest_scroll')]);
			print 'success';
		} else {
			print 'error';
		}
		break;
}

function load_scores() {
	global $config;

		// Connect to the database.
	$db = new medoo($config['database']);
 
	$data = $db->query("SELECT * FROM scroller_scores ORDER BY score DESC LIMIT 10")->fetchAll();

	print json_encode($data);
}

function verify_score($score = 0) {
	global $config;

	if (empty($score) || !isset($_SESSION[md5('scroller_fastest_scroll')])) {
		return FALSE;
	}

	$cipher = new Cipher($config['cipher_key']);

	$decryptedtext = $cipher->decrypt($_SESSION[md5('scroller_fastest_scroll')]);

	if ($decryptedtext == $score) {
		return TRUE;
	}

	return FALSE;
}

function update_score_session($score = 0) {
	global $config;

	if (empty($score)) {
		return;
	}

	$cipher = new Cipher($config['cipher_key']);

	$encryptedtext = $cipher->encrypt($score);

	$_SESSION[md5('scroller_fastest_scroll')] = $encryptedtext;
}

function submit_score($name = '', $score = 0) {
	global $config;

	if (empty($name) || empty($score)) {
		return FALSE;
	}

	// Connect to the database.
	$db = new medoo($config['database']);

	// Insert the new score.
	$db->insert('scroller_scores', array(
		'name' => htmlspecialchars($name, ENT_QUOTES),
		'score' => htmlspecialchars($score, ENT_QUOTES),
		'date' => time(),
	));

	return TRUE;
}
