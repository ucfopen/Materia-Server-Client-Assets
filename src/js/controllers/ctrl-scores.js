// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('scorePageController', function($scope, widgetSrv, scoreSrv) {

	// attempts is an array of attempts, [0] is the newest
	const attempt_dates = [];
	const details = [];

	// current attempt is the index of the attempt (the 1st attempt is attempts.length)
	let currentAttempt = null;
	let widgetInstance = null;
	$scope.guestAccess = false;
	let attemptsLeft = 0;

	let single_id = null;
	let isEmbedded = false;
	let isPreview = false;

	let _graphData = [];

	const COMPARE_TEXT_CLOSE = "Close Graph";
	const COMPARE_TEXT_OPEN = "Compare With Class";
	$scope.classRankText = COMPARE_TEXT_OPEN;

	isPreview = /\/preview\//i.test(document.URL);

	// @TODO @IE8 This method of checking for isEmbedded is hacky, but
	// IE8 didn't like "window.self == window.top" (which also might be
	// problematic with weird plugins that put the page in an iframe).
	// This should work pretty well but if we ever decide to change the
	// scores embed URL this will need to be modified!

	isEmbedded = window.location.href.toLowerCase().indexOf('/scores/embed/') !== -1;

	// We don't want users who click the 'View more details' link via an LTI to play again, since at that point
	// the play will no longer be connected to the LTI details.
	// This is a cheap way to hide the button:
	let hidePlayAgain = document.URL.indexOf('details=1') > -1;
	single_id  = window.location.hash.split('single-')[1];
	const widget_id  = document.URL.match( /^[\.\w\/:]+\/([a-z0-9]+)/i )[1];

	// this is only actually set to something when coming from the profile page
	let play_id    = window.location.hash.split('play-')[1];

	// when the url has changes, reload the questions
	$(window).bind('hashchange', () => getScoreDetails());

	$scope.prevMouseOver = () => $scope.prevAttemptClass = "open";
	$scope.prevMouseOut = () => $scope.prevAttemptClass = "";
	$scope.prevClick = () => $scope.prevAttemptClass = "open";
	$scope.attemptClick = function() {
		if (isMobile.any()) {
			return $scope.prevAttemptClass = "";
		}
	};

	$scope.isPreview = isPreview;
	$scope.isEmbedded = isEmbedded;

	const displayScoreData = (inst_id, play_id) =>
		widgetSrv.getWidget(inst_id)
			.then( function(widgetInstances) {
				widgetInstance = widgetInstances[0];
				$scope.guestAccess = widgetInstance.guest_access;
				return getInstanceScores(inst_id);
			}).then( function() {
				displayAttempts(play_id);
				return displayWidgetInstance();
			}).fail(function() {})
	;
				// Failed!?!?

	var getInstanceScores = function(inst_id) {
		const dfd = $.Deferred();
		if (isPreview || single_id) {
			$scope.attempts = [{'id': -1, 'created_at' : 0, 'percent' : 0}];
			dfd.resolve(); // skip, preview doesn't support this
		} else if (!widgetInstance.guest_access) {
			// Want to get all of the scores for a user if the widget doesn't
			// support guests.
			const send_token = (typeof LAUNCH_TOKEN !== 'undefined' && LAUNCH_TOKEN !== null) ? LAUNCH_TOKEN : play_id;
			scoreSrv.getWidgetInstanceScores(inst_id, send_token, function(result) {
				populateScores(result.scores);
				attemptsLeft = result.attempts_left;
				return dfd.resolve();
			});
		} else {
			// Only want score corresponding to play_id if guest widget
			scoreSrv.getGuestWidgetInstanceScores(inst_id, play_id, function(scores) {
				populateScores(scores);
				return dfd.resolve();
			});
		}
		return dfd.promise();
	};

	var populateScores = function(scores) {
		const dfd = $.Deferred();
		if ((scores === null) || (scores.length < 1)) {
			if (single_id) {
				single_id = null;
				displayScoreData(widget_id, play_id);
			} else {
				//load up an error screen of some sort
				$scope.restricted = true;
				$scope.show = true;
				$scope.$apply();
				dfd.reject('No scores for this widget');
			}
			return;
		}
		// Round scores
		for (let attemptScore of Array.from(scores)) {
			attemptScore.roundedPercent = String(parseFloat(attemptScore.percent).toFixed(2));
		}
		$scope.attempts = scores;
		$scope.attempt = scores[0];
		return $scope.$apply();
	};

	var getScoreDetails = function() {
		if (isPreview) {
			currentAttempt = 1;
			scoreSrv.getWidgetInstancePlayScores(null, widgetInstance.id, displayDetails);
		} else if (single_id) {
			scoreSrv.getWidgetInstancePlayScores(single_id, null, displayDetails);
		} else {
			// get the current attempt from the url
			const hash = getAttemptNumberFromHash();
			if (currentAttempt === hash) { return; }
			currentAttempt = hash;
			play_id = $scope.attempts[$scope.attempts.length - currentAttempt]['id'];

			// display existing data or get more from the server
			if (details[$scope.attempts.length - currentAttempt] != null) {
				displayDetails(details[$scope.attempts.length - currentAttempt]);
			} else {
				scoreSrv.getWidgetInstancePlayScores(play_id, null, displayDetails);
			}
		}

		return $scope.$apply();
	};

	var displayWidgetInstance = function() {
		// Build the data for the overview section, prep for display through Underscore
		const widget = {
			title : widgetInstance.name,
			dates : attempt_dates
		};

		// show play again button?
		if (!single_id && ((widgetInstance.attempts <= 0) || (parseInt(attemptsLeft) > 0) || isPreview)) {
			const prefix = (() => { switch (false) {
				case !isEmbedded: return '/embed/';
				case !isPreview: return '/preview/';
				default: return '/play/';
			} })();

			widget.href = prefix+widgetInstance.id + '/' + widgetInstance.clean_name;
			if (typeof LAUNCH_TOKEN !== 'undefined' && LAUNCH_TOKEN !== null) { widget.href += `?token=${LAUNCH_TOKEN}`; }
			$scope.attemptsLeft = attemptsLeft;
		} else {
			// if there are no attempts left, hide play again
			hidePlayAgain = true;
		}

		// Modify display of several elements after HTML is outputted
		const lengthRange = Math.floor(widgetInstance.name.length / 10);
		let textSize    = parseInt($('article.container header > h1').css('font-size'));
		let paddingSize = parseInt($('article.container header > h1').css('padding-top'));

		switch(lengthRange) {
			case 0: case 1: case 2:
				textSize    -= 4;
				paddingSize += 4;
				break;
			case 3:
				textSize    -= 8;
				paddingSize += 8;
				break;
			default:
				textSize    -= 12;
				paddingSize += 12;
		}

		$scope.headerStyle = {
			'font-size': textSize,
			'padding-top': paddingSize
		};

		$scope.hidePlayAgain = hidePlayAgain;
		$scope.hidePreviousAttempts = single_id;
		$scope.widget = widget;
		return $scope.$apply();
	};

	var displayAttempts = function(play_id) {
		if (isPreview) {
			currentAttempt = 1;
			return getScoreDetails();
		} else {
			if ($scope.attempts instanceof Array && ($scope.attempts.length > 0)) {
				let matchedAttempt = false;
				for (let i = 0, end = $scope.attempts.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
					const d = new Date($scope.attempts[i].created_at * 1000);

					// attempt_dates is used to populate the overview data in displayWidgetInstance, it's just assembled here.
					attempt_dates[i] = (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();

					if (play_id === $scope.attempts[i].id) { matchedAttempt = $scope.attempts.length - i; }
				}

				if (isPreview) {
					return window.location.hash = `#attempt-${1}`;
				// we only want to do this if there's more than one attempt. Otherwise it's a guest widget
				// or the score is being viewed by an instructor, so we don't want to get rid of the playid
				// in the hash
				} else if ((matchedAttempt !== false) && ($scope.attempts.length > 1)) {
					// changing the hash will call getScoreDetails()
					window.location.hash = `#attempt-${matchedAttempt}`;
					return getScoreDetails();
				} else if (getAttemptNumberFromHash() === undefined) {
					return window.location.hash = `#attempt-${$scope.attempts.length}`;
				} else {
					return getScoreDetails();
				}
			}
		}
	};

	// Uses jPlot to create the bargraph
	$scope.toggleClassRankGraph = function() {
		// toggle button text
		if ($scope.graphShown) {
			$scope.classRankText = COMPARE_TEXT_OPEN;
			$scope.graphShown = false;
		} else {
			$scope.graphShown = true;
			$scope.classRankText = COMPARE_TEXT_CLOSE;
		}

		// toggle graph visibility
		$('section.score-graph').slideToggle();

		// return if graph already built
		if (_graphData.length > 0) { return; }

		// return if preview
		if (isPreview) { return; }

		// Dynamically load jqplot libraries at run time
		const jqplotBase = '//cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.0/';
		return $LAB.script(`${jqplotBase}jquery.jqplot.min.js`)
		.wait()
		.script(`${jqplotBase}plugins/jqplot.barRenderer.min.js`)
		.script(`${jqplotBase}plugins/jqplot.canvasTextRenderer.min.js`)
		.script(`${jqplotBase}plugins/jqplot.canvasAxisTickRenderer.min.js`)
		.script(`${jqplotBase}plugins/jqplot.categoryAxisRenderer.min.js`)
		.script(`${jqplotBase}plugins/jqplot.cursor.min.js`)
		.script(`${jqplotBase}plugins/jqplot.highlighter.min.js`)
		.wait(() =>

			// ========== BUILD THE GRAPH =============
			Materia.Coms.Json.send('score_summary_get', [widgetInstance.id], function(data) {

				// add up all semesters data into one dataset
				_graphData = [
					['0-9%',    0],
					['10-19%',  0],
					['20-29%',  0],
					['30-39%',  0],
					['40-49%',  0],
					['50-59%',  0],
					['60-69%',  0],
					['70-79%',  0],
					['80-89%',  0],
					['90-100%', 0]
				];

				for (let d of Array.from(data)) {
					for (let n = 0; n < _graphData.length; n++) {
						const bracket = _graphData[n];
						bracket[1] += d.distribution[n];
					}
				}

				// setup options
				const jqOptions = {
					animate: true,
					animateReplot: true,
					series: [{
							renderer:$.jqplot.BarRenderer,
							shadow: false,
							color: '#1e91e1',
							rendererOptions: {
								animation: {
									speed: 500
								}
							}
						}
					],
					seriesDefaults: {
						showMarker:false,
						pointLabels: {
							show: true,
							formatString:'%.0f',
							color: '#000'
						}
					},
					title: {
						text: "Compare Your Score With Everyone Else's",
						fontFamily: 'Lato, Lucida Grande, Arial, sans'
					},
					axesDefaults: {
						tickRenderer: $.jqplot.CanvasAxisTickRenderer,
						tickOptions: {
							angle: 0,
							fontSize: '8pt',
							color: '#000'
						}
					},
					axes: {
						xaxis: {
							renderer: $.jqplot.CategoryAxisRenderer,
							label:'Score Percent'
						},
						yaxis: {
							tickOptions:{formatString:'%.1f', angle: 45},
							label:'Number of Scores',
							labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
							color: '#000'
						}
					},
					cursor: {show: false},
					grid:{shadow: false}
				};

				// light the fuse
				return $.jqplot('graph', [_graphData], jqOptions);
			})
		);
	};

	var displayDetails = function(results) {
		let score;
		$scope.show = true;

		if (!results) {
			const widget_data =
				{href : `/preview/${widgetInstance.id}/${widgetInstance.clean_name}`};

			$scope.expired = true;
			$scope.$apply();
			return;
		}

		details[$scope.attempts.length - currentAttempt] = results;
		const deets = results[0];

		if (!deets) { return; }

		// Round the score for display
		deets.overview.score = Math.round(deets.overview.score);
		for (var tableItem of Array.from(deets.overview.table)) {
			if (tableItem.value.constructor === String) { tableItem.value = parseFloat(tableItem.value); }
			tableItem.value = tableItem.value.toFixed(2);
		}

		for (tableItem of Array.from(deets.details[0].table)) {
			score = parseFloat(tableItem.score);
			if ((score !== 0) && (score !== 100)) {
				tableItem.score = score.toFixed(2);
			}
		}

		setTimeout(() => addCircleToDetailTable(deets.details)
		, 10);

		sendPostMessage(deets.overview.score);
		$scope.overview = deets.overview;
		$scope.dates = attempt_dates;
		$scope.details = deets.details;
		$scope.attempt_num = currentAttempt;
		const referrerUrl = $scope.overview.referrer_url;
		const playTime = $scope.overview.created_at;
		if (($scope.overview.auth === "lti") && referrerUrl && (referrerUrl.indexOf(`/scores/${widgetInstance.id}`) === -1)) {
			$scope.playAgainUrl = referrerUrl;
		} else {
			$scope.playAgainUrl = $scope.widget.href;
		}
		return $scope.$apply();
	};

	var addCircleToDetailTable = detail =>
		(() => {
			const result = [];
			for (var i = 0, end = detail.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
				if (detail[i] != null) {
					result.push((() => {
						const result1 = [];
						for (let j = 0, end1 = detail[i].table.length, asc1 = 0 <= end1; asc1 ? j < end1 : j > end1; asc1 ? j++ : j--) {
							const { table } = detail[i];
							let greyMode = false;
							const index = j+1;
							const canvas_id = `question-${i+1}-${index}`;
							const percent = table[j].score / 100;
							switch (table[j].graphic) {
								case 'modifier':
									greyMode = table[j].score === 0;
									result1.push(Materia.Scores.Scoregraphics.drawModifierCircle(canvas_id, index, percent, greyMode));
									break;
								case 'final':
									result1.push(Materia.Scores.Scoregraphics.drawFinalScoreCircle(canvas_id, index, percent));
									break;
								case 'score':
									greyMode = table[j].score === -1;
									result1.push(Materia.Scores.Scoregraphics.drawScoreCircle(canvas_id, index, percent, greyMode));
									break;
								default:
									result1.push(undefined);
							}
						}
						return result1;
					})());
				} else {
					result.push(undefined);
				}
			}
			return result;
		})()
	;

	var sendPostMessage = function(score) {
		if (parent.postMessage && JSON.stringify) {
			return parent.postMessage(JSON.stringify({
				type: 'materiaScoreRecorded',
				widget: widgetInstance,
				score
			}), '*');
		}
	};

	var getAttemptNumberFromHash = function() {
		const hashStr = window.location.hash.split('-')[1];
		if ((hashStr != null) && !isNaN(hashStr)) { return hashStr; }
		return $scope.attempts.length;
	};

	// this was originally called in document.ready, but there's no reason to not put it in init
	return displayScoreData(widget_id, play_id);
});
