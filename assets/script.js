$(document).ready(function() {
	var scores = new Array();
	var lowest = 0;
	var fastest = 0;

	load_scores();

	var scrollSpeedMonitor = new ScrollSpeedMonitor(function (speedInPxPerMs, timeStamp, newDirection) {
		$('.last_scrolling_speed').html(speedInPxPerMs.toFixed(5));

		if (speedInPxPerMs > fastest) {
			fastest = speedInPxPerMs.toFixed(5);
			$('.fastest_scroll').html(fastest);
			$.post( "controller.php", { action: 'fastest_scroll', score: fastest, token: ajax_token }, function(data) {
				var new_token = readCookie('ajax_token');
				if (new_token) {
					ajax_token = new_token;
				}
			});
			if (fastest > 0 && (fastest > lowest || scores.length < 10)) {
				$('.submit_loading').slideUp();
				$('.submit_success').slideUp();
				$('.submit_error').slideUp();
				$('.new_record').slideDown();
			}
		}
	});

	$('#submit_form').click(function() {
		if ($('.submit_form_wrapper').hasClass('expanded')) {
			var name = $('#name').val();
			var score = fastest;

			if (!name) {
				alert('Please enter your name to submit your score.');
			} else {
				reset_new_record();
				$('.submit_loading').slideDown();
				$.post( "controller.php", { action: 'submit_score', name: name, score: score, token: ajax_token }, function(data) {
					var new_token = readCookie('ajax_token');
					if (new_token) {
						ajax_token = new_token;
					}

					$('.submit_loading').slideUp();
					if (data == 'success') {
						$('.submit_success').slideDown();
						load_scores();
					} else {
						$('.submit_error').slideDown();
					}
				});
			}
		} else {
			$(this).html('Submit score');
			$('.submit_form_wrapper').animate({
				width: $('.submit_form').width(),
			}).addClass('expanded');
			$('#name').focus();
			$('#cancel_submit').html('Cancel');
		}
	});

	$('#cancel_submit').click(function() {
		reset_new_record();
	});

	function reset_new_record() {
		$('#submit_form').html('Yes!');
		$('.submit_form_wrapper').animate({
			width: '0px',
		});
		$('.new_record').slideUp();

		if ($('.submit_form_wrapper').hasClass('expanded')) {
			$(this).html('No...');
			$('.submit_form_wrapper').removeClass('expanded');
		}
	}

	function load_scores() {
		$('.scores').html('<img src="images/loader.gif" width="20" height="20" /> Loading...');
		$.post( "controller.php", { action: 'load_scores', token: ajax_token }, function(data) {
			var new_token = readCookie('ajax_token');
			if (new_token) {
				ajax_token = new_token;
			}
			
			var obj = $.parseJSON(data);

			if (obj.length > 0) {
				var content = new Array();
				content['left'] = '<table class="player_scores left">';
				content['right'] = '';
				var position = 1;
				var leftright = 'left';

				if (obj.length > 5) {
					content['right'] = '<table class="player_scores right">';
				}

				for (var i in obj) {
					if (obj[i].score != undefined && obj[i].name != undefined) {
						var parsed_score = parseFloat(obj[i].score);

						scores.push(parsed_score);

						if (position <= 5) {
							leftright = 'left';
						} else {
							leftright = 'right';
						}

						content[ leftright ] += '<tr>';
						content[ leftright ] += '<td class="player_position">' + position + '</td>';
						content[ leftright ] += '<td class="player_name">' + obj[i].name + '</td>';
						content[ leftright ] += '<td class="player_score">' + parsed_score.toFixed(5) + '</td>';
						content[ leftright ] += '</tr>';

						position++;
					}
				}

				content['left'] += '</table>';

				if (obj.length > 5) {
					content['right'] += '</table>';
				}

				$('.scores').html(content['left'] + content['right']);

				lowest = Math.min.apply(Math, scores);
			} else {
				$('.scores').html('There are no scores yet.')
			}
		});
	}

	function readCookie(name)	{
		var cookiename = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(cookiename) == 0) return c.substring(cookiename.length,c.length);
		}
		return false;
	}
});