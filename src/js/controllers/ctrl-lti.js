const app = angular.module('materia')
app.controller('ltiCtrl', function(Please, $interval, $timeout, $scope, $sce, widgetSrv) {
	const REFRESH_FAKE_DELAY_MS = 500
	const CHANGE_SECTION_FADE_DELAY_MS = 250
	let selectedWidget = null
	let widgetsLoaded = false

	const _calloutRefreshLink = () => {
		$scope.showRefreshArrow = true
	}

	const loadWidgets = function(fakeDelay) {
		if (fakeDelay == null) {
			fakeDelay = 1
		}

		$timeout(
			() =>
				widgetSrv.getWidgets().then(widgets => {
					if (widgets != null ? widgets.halt : undefined) {
						return
					}
					if (!widgets) {
						widgets = []
					}

					widgetsLoaded = true

					const len = widgets.length
					const curWidget = null

					for (let widget of Array.from(widgets)) {
						widget.img = Materia.Image.iconUrl(widget.widget.dir, 60)
						widget.preview_url = BASE_URL + 'preview/' + widget.id
						widget.edit_url = BASE_URL + 'my-widgets/#' + widget.id
					}

					$scope.widgets = widgets
					Please.$apply()
				}),

			fakeDelay
		)
	}

	const _highlight = function(widget) {
		for (let w of Array.from($scope.widgets)) {
			w.selected = false
		}
		widget.selected = true
	}

	const _embedWidget = widget => {
		if (selectedWidget && selectedWidget.state && selectedWidget.state === 'pending') {
			return
		}

		selectedWidget = widget
		selectedWidget.state = 'pending'

		widget.img = Materia.Image.iconUrl(widget.widget.dir, 60)
		$scope.selectedWidget = widget

		setDisplayState('progress')
	}

	const finishProgressBarAndSetLocation = () => {
		$('.progress-container').addClass('success')
		$('.progress-container')
			.find('span')
			.html('Success!')
		$('.progressbar').progressbar('value', 100)
		$timeout(() => {
			announceChoice()

			if (typeof RETURN_URL !== 'undefined' && RETURN_URL !== null) {
				window.location =
					RETURN_URL + '?embed_type=basic_lti&url=' + encodeURI(selectedWidget.embed_url)
			}
		}, 1000)
	}

	const setDisplayState = newSection => {
		$scope.section = newSection
		$timeout(() => {
			$('body')
				.removeClass('selectWidget')
				.removeClass('widgetSelected')
				.removeClass('progress')
				.addClass(newSection)

			if (newSection === 'selectWidget') {
				if (selectedWidget != null) {
					$('.cancel-button').show()
				}

				if (!widgetsLoaded) {
					loadWidgets()
				}

				$('#select-widget').fadeIn(CHANGE_SECTION_FADE_DELAY_MS)
			} else if (newSection === 'progress') {
				$('.progressbar').progressbar()
				startProgressBar()
			}
		}, 0)
	}

	const getRandInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

	const startProgressBar = () => {
		// create a random number of progress bar stops
		const availStops = [1, 2, 3, 4, 5, 6, 7, 8, 9]
		const stops = { tick: 0 }
		const len = getRandInt(3, 5)

		for (let i = 0, end = len, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
			stops[availStops.splice(getRandInt(0, availStops.length), 1)] = true
		}

		var intervalId = $interval(() => {
			stops.tick++
			if (stops[stops.tick] != null) {
				$('.progressbar').progressbar('value', stops.tick * 10)
			}

			if (stops.tick >= 10) {
				$interval.cancel(intervalId)
				finishProgressBarAndSetLocation()
			}
		}, 200)

		$(document).on('keyup', event => {
			if (event.keyCode === 16) {
				// shift
				$scope.easterMode = true
				Please.$apply()
			}
		})
	}

	const getAvailabilityStr = (startDate, endDate) => {
		const availability = widgetSrv.convertAvailibilityDates(startDate, endDate)

		if (endDate < 0 && startDate < 0) {
			return 'Anytime'
		} else if (startDate < 0 && endDate > 0) {
			return `Open until ${availability.end.date} at ${availability.end.time}`
		} else if (startDate > 0 && endDate < 0) {
			return `Anytime after ${availability.start.date} at ${availability.start.time}`
		} else {
			return `From ${availability.start.date} at ${availability.start.time} until ${
				availability.end.date
			} at  ${availability.end.time}`
		}
	}

	const announceChoice = () => {
		const widgetData = $scope.selectedWidget
		delete widgetData.element
		delete widgetData.searchCache

		// the host system can listen for this postMessage "message" event:
		if (JSON.stringify && parent.postMessage) {
			parent.postMessage(JSON.stringify(widgetData), '*')
		}
	}

	const _refreshListing = () => {
		$scope.showRefreshArrow = false
		loadWidgets(REFRESH_FAKE_DELAY_MS)
	}

	// expose to scope

	$scope.strHeader = system ? `Select a Widget for use in ${system}:` : 'Select a Widget:'
	$scope.query = {}
	$scope.refreshListing = _refreshListing
	$scope.highlight = _highlight
	$scope.embedWidget = _embedWidget
	$scope.calloutRefreshLink = _calloutRefreshLink

	// initialize

	setDisplayState('selectWidget')
})
