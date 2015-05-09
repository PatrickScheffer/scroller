<?php
require_once('config.php');
require_once('lib/medoo.min.php');
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

// Check if the ajax tokens match.
if (ajax_token() != post('token')) {
	add_log('AJAX', 'Invalid request: No token match.');
	exit();
}

// Change the ajax token add put it in a cookie so Javascript can read it.
setcookie('ajax_token', ajax_token(TRUE), 0, '/', $_SERVER['HTTP_HOST']);

// Check what action to execute.
switch (post('action')) {
	case 'load_scores':
		print load_scores();
		exit;
		break;

	case 'fastest_scroll':
			$score = post('score');
			$height = post('scroller_height');

			if (is_numeric($score) && $score > 0 && $height == $config['scroller_height']) {
				update_score_session($score);
			}
		break;

	case 'submit_score':
		$name = post('name');
		$score = post('score');
		$height = post('scroller_height');

		if ($height != $config['scroller_height']) {
			add_log('Score Submit', 'Scroller height is altered.');
			print 'error';
			exit;
		}

		if (empty($name)) {
			add_log('Score Submit', 'Empty name submitted.');
			print 'error';
			exit;
		}

		if (!verify_score($score)) {
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
		add_log('Verify', 'No score or session score found.');
		return FALSE;
	}

	if (!isset($_SESSION['user_ip']) || !isset($_SESSION['user_agent']) || $_SESSION['user_ip'] != $_SERVER['REMOTE_ADDR'] || $_SESSION['user_agent'] != $_SERVER['HTTP_USER_AGENT']) {
	  add_log('Verify', 'User IP and agent don\'t match with session.');
	  return FALSE;
	}

	$decryptedtext = base64_decode($_SESSION[md5('scroller_fastest_scroll')]);

	if ($decryptedtext == $score) {
		return TRUE;
	}

	add_log('Verify', 'Score does not match with the session score.');
	return FALSE;
}

function update_score_session($score = 0) {
	global $config;

	if (empty($score)) {
		return FALSE;
	}

	$_SESSION['user_ip'] = $_SERVER['REMOTE_ADDR'];
	$_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
	$_SESSION[md5('scroller_fastest_scroll')] = base64_encode($score);
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
