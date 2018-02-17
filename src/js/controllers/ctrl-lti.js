/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('ltiCtrl', function($scope, $sce, widgetSrv) {
	const REFRESH_FAKE_DELAY_MS = 500;
	const CHANGE_SECTION_FADE_DELAY_MS = 250;

	let selectedWidget = null;
	let widgetsLoaded = false;

	$scope.strHeader = 'Select a Widget:';
	$scope.query = {};

	if ((typeof system !== 'undefined' && system !== null) && (system !== '')) {
		$scope.strHeader = `Select a Widget for use in ${system}:`;
	}

	$scope.calloutRefreshLink = () => $scope.showRefreshArrow = true;

	const loadWidgets = function(fakeDelay) {
		if ((fakeDelay == null)) {
			fakeDelay = 1;
		}

		return setTimeout(() =>
			widgetSrv.getWidgets().then(function(widgets) {
				if (widgets != null ? widgets.halt : undefined) {
					return;
				}
				if (!widgets) {
					widgets = [];
				}

				widgetsLoaded = true;

				const len = widgets.length;
				const curWidget = null;

				for (let widget of Array.from(widgets)) {
					widget.img = Materia.Image.iconUrl(widget.widget.dir, 60);
					widget.preview_url = BASE_URL + 'preview/' + widget.id;
					widget.edit_url = BASE_URL + 'my-widgets/#' + widget.id;
				}

				$scope.widgets = widgets;
				return $scope.$apply();
			})
		
		, fakeDelay);
	};

	$scope.highlight = function(widget) {
		for (let w of Array.from($scope.widgets)) {
			w.selected = false;
		}
		return widget.selected = true;
	};

	$scope.embedWidget = widget => selectWidget(widget);

	var selectWidget = function(widget) {
		if (__guard__(selectedWidget != null ? selectedWidget.state : undefined, x => x.state) === 'pending') {
			return;
		}

		selectedWidget = widget;
		selectedWidget.state = 'pending';

		widget.img = Materia.Image.iconUrl(widget.widget.dir, 60);
		$scope.selectedWidget = widget;

		return setDisplayState('progress');
	};

	const finishProgressBarAndSetLocation = function() {
		$('.progress-container').addClass('success');
		$('.progress-container').find('span').html('Success!');
		$('.progressbar').progressbar('value', 100);
		return setTimeout(function() {
			announceChoice();

			if (typeof RETURN_URL !== 'undefined' && RETURN_URL !== null) {
				return window.location = RETURN_URL + '?embed_type=basic_lti&url=' + encodeURI(selectedWidget.embed_url);
			}
		}
		, 1000);
	};

	var setDisplayState = function(newSection) {
		$scope.section = newSection;
		return setTimeout(function() {
			$('body')
				.removeClass('selectWidget')
				.removeClass('widgetSelected')
				.removeClass('progress')
				.addClass(newSection);

			if (newSection === 'selectWidget') {
				if (selectedWidget != null) {
					$('.cancel-button').show();
				}

				if (!widgetsLoaded) {
					loadWidgets();
				}

				return $('#select-widget').fadeIn(CHANGE_SECTION_FADE_DELAY_MS);
			} else if (newSection === 'progress') {
				$('.progressbar').progressbar();
				return startProgressBar();
			}
		}
		, 0);
	};

	const getRandInt = (min, max) => Math.floor(Math.random() * ((max - min) + 1)) + min;

	var startProgressBar = function() {
		// create a random number of progress bar stops
		const availStops = [1,2,3,4,5,6,7,8,9];
		const stops = {tick: 0};

		const len = getRandInt(3, 5);
		for (let i = 0, end = len, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
			stops[availStops.splice(getRandInt(0, availStops.length), 1)] = true;
		}

		var intervalId = setInterval(function() {
			stops.tick++;
			if (stops[stops.tick] != null) {
				$('.progressbar').progressbar('value', stops.tick * 10);
			}

			if (stops.tick >= 10) {
				clearInterval(intervalId);
				return finishProgressBarAndSetLocation();
			}
		}
		, 200);

		return $(document).on('keyup', function(event) {
			if (event.keyCode === 16) { // shift
				$scope.easterMode = true;
				return $scope.$apply();
			}
		});
	};

	const getAvailabilityStr = function(startDate, endDate) {
		const availability = widgetSrv.convertAvailibilityDates(startDate, endDate);

		if ((endDate < 0) && (startDate < 0)) {
			return 'Anytime';
		} else if ((startDate < 0) && (endDate > 0)) {
			return `Open until ${availability.end.date} at ${availability.end.time}`;
		} else if ((startDate > 0) && (endDate < 0)) {
			return `Anytime after ${availability.start.date} at ${availability.start.time}`;
		} else {
			return `From ${availability.start.date} at ${availability.start.time} until ${availability.end.date} at  ${availability.end.time}`;
		}
	};

	var announceChoice = function() {
		const widgetData = $scope.selectedWidget;
		delete widgetData.element;
		delete widgetData.searchCache;

		// the host system can listen for this postMessage "message" event:
		if (JSON.stringify) {
			if(parent.postMessage) {
				return parent.postMessage(JSON.stringify(widgetData), '*');
			}
		}
	};

	$scope.refreshListing = function() {
		$scope.showRefreshArrow = false;
		return loadWidgets(REFRESH_FAKE_DELAY_MS);
	};

	return setDisplayState('selectWidget');
});


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}