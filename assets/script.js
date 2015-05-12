$(document).ready(function() {
	var scores = new Array();
	var lowest = 0;
	var fastest = 0;
	var timerId = 0;
	var scroller_height = $('body').height();

	load_scores();

	var scrollSpeedMonitor = new ScrollSpeedMonitor(function (speedInPxPerMs, timeStamp, newDirection) {
		if ($('body')[0].scrollHeight != scroller_height) {
			alert('Please don\'t mess with the scroll height.');
			return;
		}

		$('.last_scrolling_speed').html(speedInPxPerMs.toFixed(5));

		if (speedInPxPerMs > fastest) {
			fastest = speedInPxPerMs.toFixed(5);
			$('.fastest_scroll').html(fastest);
			$.post( "controller.php", { action: 'fastest_scroll', score: fastest, token: ajax_token, scroller_height: $('body')[0].scrollHeight }, function(data) {
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
				var time = Date.now();
				createCookie('scroller_yoloswag', time);

				$.post( "controller.php", { action: 'submit_score', name: name, score: score, token: ajax_token, time: time, scroller_height: $('body').height() }, function(data) {
					var new_token = readCookie('ajax_token');
					if (new_token) {
						ajax_token = new_token;
					}

					$('.submit_loading').slideUp();
					if (data == 'success') {
						$('.submit_success').slideDown();
						load_scores();
						timerId = setTimeout(function() { $('.submit_success').slideUp(); clearTimeout(timerId); }, 3000);
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
				content['left'] += '<tr>';
				content['left'] += '<th class="player_position">#</th>';
				content['left'] += '<th class="player_name">Name</th>';
				content['left'] += '<th class="player_score">Scroll speed (px/ms)</th>';
				content['left'] += '</tr>';

				content['right'] = '';
				var position = 1;
				var leftright = 'left';

				if (obj.length > 5) {
					content['right'] = '<table class="player_scores right">';
					content['right'] += '<tr>';
					content['right'] += '<th class="player_position">#</th>';
					content['right'] += '<th class="player_name">Name</th>';
					content['right'] += '<th class="player_score">Scroll speed (px/ms)</th>';
					content['right'] += '</tr>';				}

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

	function createCookie(name,value) {
    var expires = Date.now() + 10000;
    document.cookie = name+"="+value+"; expires="+expires+"; path=/";
	}
});