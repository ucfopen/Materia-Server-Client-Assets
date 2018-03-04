const app = angular.module('materia')
app.controller('scorePageController', function(Please, $scope, $q, $timeout, widgetSrv, scoreSrv) {
	const COMPARE_TEXT_CLOSE = 'Close Graph'
	const COMPARE_TEXT_OPEN = 'Compare With Class'
	// attempts is an array of attempts, [0] is the newest
	const attempt_dates = []
	const details = []
	// current attempt is the index of the attempt (the 1st attempt is attempts.length)
	let currentAttempt = null
	let widgetInstance = null
	let attemptsLeft = 0
	let single_id = window.location.hash.split('single-')[1]
	// @TODO @IE8 This method of checking for isEmbedded is hacky, but
	// IE8 didn't like "window.self == window.top" (which also might be
	// problematic with weird plugins that put the page in an iframe).
	// This should work pretty well but if we ever decide to change the
	// scores embed URL this will need to be modified!
	let isEmbedded = window.location.href.toLowerCase().indexOf('/scores/embed/') !== -1
	let isPreview = /\/preview\//i.test(document.URL)
	let _graphData = []

	// We don't want users who click the 'View more details' link via an LTI to play again, since at that point
	// the play will no longer be connected to the LTI details.
	// This is a cheap way to hide the button:
	let hidePlayAgain = document.URL.indexOf('details=1') > -1
	const widget_id = document.URL.match(/^[\.\w\/:]+\/([a-z0-9]+)/i)[1]

	// this is only actually set to something when coming from the profile page
	let play_id = window.location.hash.split('play-')[1]

	const _displayScoreData = (inst_id, play_id) =>
		widgetSrv
			.getWidget(inst_id)
			.then(instance => {
				widgetInstance = instance
				$scope.guestAccess = widgetInstance.guest_access
				return inst_id
			})
			.then(_getInstanceScores)
			.then(() => {
				_displayAttempts(play_id)
				_displayWidgetInstance()
			})
			.catch(() => {})

	const _getInstanceScores = inst_id => {
		const dfd = $q.defer()
		if (isPreview || single_id) {
			$scope.attempts = [{ id: -1, created_at: 0, percent: 0 }]
			dfd.resolve() // skip, preview doesn't support this
		} else if (!widgetInstance.guest_access) {
			// Want to get all of the scores for a user if the widget doesn't
			// support guests.
			const send_token =
				typeof LAUNCH_TOKEN !== 'undefined' && LAUNCH_TOKEN !== null ? LAUNCH_TOKEN : play_id
			scoreSrv.getWidgetInstanceScores(inst_id, send_token, result => {
				_populateScores(result.scores)
				attemptsLeft = result.attempts_left
				dfd.resolve()
			})
		} else {
			// Only want score corresponding to play_id if guest widget
			scoreSrv.getGuestWidgetInstanceScores(inst_id, play_id, scores => {
				_populateScores(scores)
				dfd.resolve()
			})
		}
		return dfd.promise
	}

	const _populateScores = scores => {
		if (scores === null || scores.length < 1) {
			if (single_id) {
				single_id = null
				_displayScoreData(widget_id, play_id)
			} else {
				//load up an error screen of some sort
				$scope.restricted = true
				$scope.show = true
				Please.$apply()
			}
			return
		}
		// Round scores
		for (let attemptScore of Array.from(scores)) {
			attemptScore.roundedPercent = String(parseFloat(attemptScore.percent).toFixed(2))
		}
		$scope.attempts = scores
		$scope.attempt = scores[0]
		Please.$apply()
	}

	const _getScoreDetails = () => {
		if (isPreview) {
			currentAttempt = 1
			scoreSrv.getWidgetInstancePlayScores(null, widgetInstance.id, _displayDetails)
		} else if (single_id) {
			scoreSrv.getWidgetInstancePlayScores(single_id, null, _displayDetails)
		} else {
			// get the current attempt from the url
			const hash = getAttemptNumberFromHash()
			if (currentAttempt === hash) {
				return
			}
			currentAttempt = hash
			play_id = $scope.attempts[$scope.attempts.length - currentAttempt]['id']

			// display existing data or get more from the server
			if (details[$scope.attempts.length - currentAttempt] != null) {
				_displayDetails(details[$scope.attempts.length - currentAttempt])
			} else {
				scoreSrv.getWidgetInstancePlayScores(play_id, null, _displayDetails)
			}
		}

		Please.$apply()
	}

	const _displayWidgetInstance = () => {
		// Build the data for the overview section, prep for display through Underscore
		const widget = {
			title: widgetInstance.name,
			dates: attempt_dates
		}

		// show play again button?
		if (!single_id && (widgetInstance.attempts <= 0 || parseInt(attemptsLeft) > 0 || isPreview)) {
			const prefix = (() => {
				switch (false) {
					case !isEmbedded:
						return '/embed/'
					case !isPreview:
						return '/preview/'
					default:
						return '/play/'
				}
			})()

			widget.href = prefix + widgetInstance.id + '/' + widgetInstance.clean_name
			if (typeof LAUNCH_TOKEN !== 'undefined' && LAUNCH_TOKEN !== null) {
				widget.href += `?token=${LAUNCH_TOKEN}`
			}
			$scope.attemptsLeft = attemptsLeft
		} else {
			// if there are no attempts left, hide play again
			hidePlayAgain = true
		}

		// Modify display of several elements after HTML is outputted
		const lengthRange = Math.floor(widgetInstance.name.length / 10)
		let textSize = parseInt(document.querySelector('article.container header > h1').style.fontSize)
		let paddingSize = parseInt(
			document.querySelector('article.container header > h1').style.paddingTop
		)

		switch (lengthRange) {
			case 0:
			case 1:
			case 2:
				textSize -= 4
				paddingSize += 4
				break
			case 3:
				textSize -= 8
				paddingSize += 8
				break
			default:
				textSize -= 12
				paddingSize += 12
		}

		$scope.headerStyle = {
			'font-size': textSize,
			'padding-top': paddingSize
		}

		$scope.hidePlayAgain = hidePlayAgain
		$scope.hidePreviousAttempts = single_id
		$scope.widget = widget
		Please.$apply()
	}

	const _displayAttempts = play_id => {
		if (isPreview) {
			currentAttempt = 1
			return _getScoreDetails()
		} else {
			if ($scope.attempts instanceof Array && $scope.attempts.length > 0) {
				let matchedAttempt = false
				$scope.attempts.forEach((a, i) => {
					const d = new Date(a.created_at * 1000)

					// attempt_dates is used to populate the overview data in displayWidgetInstance, it's just assembled here.
					attempt_dates[i] = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()

					if (play_id === a.id) {
						matchedAttempt = $scope.attempts.length - i
					}
				})

				if (isPreview) {
					window.location.hash = `#attempt-${1}`
					// we only want to do this if there's more than one attempt. Otherwise it's a guest widget
					// or the score is being viewed by an instructor, so we don't want to get rid of the playid
					// in the hash
				} else if (matchedAttempt !== false && $scope.attempts.length > 1) {
					// changing the hash will call _getScoreDetails()
					window.location.hash = `#attempt-${matchedAttempt}`
					_getScoreDetails()
				} else if (getAttemptNumberFromHash() === undefined) {
					window.location.hash = `#attempt-${$scope.attempts.length}`
				} else {
					_getScoreDetails()
				}
			}
		}
	}

	// Uses jPlot to create the bargraph
	const _toggleClassRankGraph = function() {
		let graph = document.querySelector('section.score-graph')
		// toggle button text
		if ($scope.graphShown) {
			$scope.classRankText = COMPARE_TEXT_OPEN
			$scope.graphShown = false
			graph.classList.remove('open')
		} else {
			$scope.graphShown = true
			$scope.classRankText = COMPARE_TEXT_CLOSE
			graph.classList.add('open')
		}

		// return if graph already built
		if (_graphData.length > 0) {
			return
		}

		// return if preview
		if (isPreview) {
			return
		}

		// Dynamically load jqplot libraries at run time
		const cdnBase = '//cdnjs.cloudflare.com/ajax/libs/'
		return $LAB
			.script(`${cdnBase}jquery/1.8.1/jquery.min.js`)
			.wait()
			.script(`${cdnBase}jqPlot/1.0.0/jquery.jqplot.min.js`)
			.wait()
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.barRenderer.min.js`)
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.canvasTextRenderer.min.js`)
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.canvasAxisTickRenderer.min.js`)
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.categoryAxisRenderer.min.js`)
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.cursor.min.js`)
			.script(`${cdnBase}jqPlot/1.0.0/plugins/jqplot.highlighter.min.js`)
			.wait(() =>
				// ========== BUILD THE GRAPH =============
				Materia.Coms.Json.send('score_summary_get', [widgetInstance.id]).then(data => {
					// add up all semesters data into one dataset
					_graphData = [
						['0-9%', 0],
						['10-19%', 0],
						['20-29%', 0],
						['30-39%', 0],
						['40-49%', 0],
						['50-59%', 0],
						['60-69%', 0],
						['70-79%', 0],
						['80-89%', 0],
						['90-100%', 0]
					]

					for (let d of Array.from(data)) {
						for (let n = 0; n < _graphData.length; n++) {
							const bracket = _graphData[n]
							bracket[1] += d.distribution[n]
						}
					}

					// setup options
					const jqOptions = {
						animate: true,
						animateReplot: true,
						series: [
							{
								renderer: $.jqplot.BarRenderer,
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
							showMarker: false,
							pointLabels: {
								show: true,
								formatString: '%.0f',
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
								label: 'Score Percent'
							},
							yaxis: {
								tickOptions: { formatString: '%.1f', angle: 45 },
								label: 'Number of Scores',
								labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
								color: '#000'
							}
						},
						cursor: { show: false },
						grid: { shadow: false }
					}

					// light the fuse
					$.jqplot('graph', [_graphData], jqOptions)
				})
			)
	}

	const _displayDetails = function(results) {
		let score
		$scope.show = true

		if (!results) {
			const widget_data = { href: `/preview/${widgetInstance.id}/${widgetInstance.clean_name}` }

			$scope.expired = true
			Please.$apply()
			return
		}

		details[$scope.attempts.length - currentAttempt] = results
		const deets = results[0]

		if (!deets) {
			return
		}

		// Round the score for display
		deets.overview.score = Math.round(deets.overview.score)
		for (var tableItem of Array.from(deets.overview.table)) {
			if (tableItem.value.constructor === String) {
				tableItem.value = parseFloat(tableItem.value)
			}
			tableItem.value = tableItem.value.toFixed(2)
		}

		for (tableItem of Array.from(deets.details[0].table)) {
			score = parseFloat(tableItem.score)
			if (score !== 0 && score !== 100) {
				tableItem.score = score.toFixed(2)
			}
		}

		$timeout(() => _addCircleToDetailTable(deets.details), 10)

		sendPostMessage(deets.overview.score)
		$scope.overview = deets.overview
		$scope.dates = attempt_dates
		$scope.details = deets.details
		$scope.attempt_num = currentAttempt
		const referrerUrl = $scope.overview.referrer_url
		const playTime = $scope.overview.created_at
		if (
			$scope.overview.auth === 'lti' &&
			referrerUrl &&
			referrerUrl.indexOf(`/scores/${widgetInstance.id}`) === -1
		) {
			$scope.playAgainUrl = referrerUrl
		} else {
			$scope.playAgainUrl = $scope.widget.href
		}
		Please.$apply()
	}

	const _addCircleToDetailTable = detail => {
		detail.forEach((item, i) => {
			if (item.table && item.table.length) {
				item.table.forEach((table, j) => {
					let greyMode = false
					const index = j + 1
					const canvas_id = `question-${i + 1}-${index}`
					const percent = table.score / 100
					switch (table.graphic) {
						case 'modifier':
							greyMode = table.score === 0
							Materia.Scores.Scoregraphics.drawModifierCircle(canvas_id, index, percent, greyMode)
							break
						case 'final':
							Materia.Scores.Scoregraphics.drawFinalScoreCircle(canvas_id, index, percent)
							break
						case 'score':
							greyMode = table.score === -1
							Materia.Scores.Scoregraphics.drawScoreCircle(canvas_id, index, percent, greyMode)
							break
					}
				})
			}
		})
	}

	const sendPostMessage = score => {
		if (parent.postMessage && JSON.stringify) {
			parent.postMessage(
				JSON.stringify({
					type: 'materiaScoreRecorded',
					widget: widgetInstance,
					score
				}),
				'*'
			)
		}
	}

	const getAttemptNumberFromHash = () => {
		const hashStr = window.location.hash.split('-')[1]
		if (hashStr != null && !isNaN(hashStr)) {
			return hashStr
		}
		return $scope.attempts.length
	}

	// expose on scope

	$scope.guestAccess = false
	$scope.classRankText = COMPARE_TEXT_OPEN
	$scope.prevMouseOver = () => ($scope.prevAttemptClass = 'open')
	$scope.prevMouseOut = () => ($scope.prevAttemptClass = '')
	$scope.prevClick = () => ($scope.prevAttemptClass = 'open')
	$scope.attemptClick = function() {
		if (isMobile.any()) {
			$scope.prevAttemptClass = ''
		}
	}

	$scope.isPreview = isPreview
	$scope.isEmbedded = isEmbedded
	$scope.toggleClassRankGraph = _toggleClassRankGraph

	// Initialize

	// when the url has changes, reload the questions
	window.addEventListener('hashchange', _getScoreDetails)

	// this was originally called in document.ready, but there's no reason to not put it in init
	_displayScoreData(widget_id, play_id)
})
