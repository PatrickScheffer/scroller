<?php
require_once('config.php');
require_once('lib/global.php');
?>

<!doctype>
<html>
<head>
	<title>Scroller</title>

	<script language="javascript">
		var ajax_token = "<?php print ajax_token(TRUE);?>";
	</script>

	<script language="javascript" src="assets/jquery-1.11.2.min.js"></script>
	<script language="javascript" src="assets/scrollspeedmonitor.js"></script>
	<link rel="stylesheet" type="text/css" href="assets/style.css" />
	<script language="javascript" src="assets/script.js"></script>
</head>
<body>

<div class="message">
	<h2>Statistics</h2>
	<table>
	  <tr>
	    <td>Last scrolling speed:</td><td class="speed"><span class="last_scrolling_speed">0.00000</span> px/ms.</td>
	  </tr>
	  <tr>
			<td>Your fastest scroll:</td><td class="speed"><span class="fastest_scroll">0.00000</span> px/ms.</td>
		</tr>
	</table>
</div>

<div class="second_bar">
	<h1>Scroller</h1>
	<p class="intro">Test your scrolling skills and compete against other players. Scroll as fast as you can (up or down) and reach the top of the table!</p>
</div>

<div class="new_record second_bar">
	<div class="text"><strong>Congratulations!</strong> You have reached the top 10! Do you want to submit your score?</div>
	<button type="button" id="submit_form" class="btn submit">Yes!</button>
	<button type="button" id="cancel_submit" class="btn cancel">No...</button>

	<div class="submit_form_wrapper">
		<div class="submit_form">
			<label for="name">Name:</label> <input type="text" id="name" />
		</div>
	</div>
</div>

<div class="submit_loading second_bar"><img src="images/loader.gif" width="20" height="20" /> Loading...</div>
<div class="submit_success second_bar">Your score has been submitted!</div>
<div class="submit_error second_bar">Something went wrong while submitting your score. Please try again.</div>

<div class="scoretable">
	<h2>Scoretable</h2>
	<div class="scores"></div>
</div>

<div class="scroller"></div>

</body>
</html>