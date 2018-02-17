// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('MyWidgetsController', function($scope, $q, $window, widgetSrv, userServ, selectedWidgetSrv, beardServ, ACCESS, Alert) {
	$scope.alert = Alert;
	$scope.baseUrl = BASE_URL;
	$scope.widgets =
		{widgetList: []};
	$scope.selected = {
		widget: null,
		perms: {},
		scores: {},
		accessLevel: ACCESS.VISIBLE,
		shareable: false,
		editable: true,
		hasScores: false,
		preview: "",
		guestAccess: false,
		embeddedOnly: false
	};
	$scope.perms =
		{collaborators: []};
	$scope.show = {
		collaborationModal: false,
		availabilityModal: false,
		copyModal: false,
		olderScores: false,
		exportModal: false,
		deleteDialog: false,
		embedToggle : false,
		editPublishedWarning: false
	};
	let firstRun = true;

	$scope.SCORE_VIEW_GRAPH = 0;
	$scope.SCORE_VIEW_TABLE = 1;
	$scope.SCORE_VIEW_DATA = 2;
	$scope.selectedScoreView = []; // array of above (i.e. 0 = graph)

	$scope.$on('selectedWidget.update', function(evt) {
		$scope.selected.widget = selectedWidgetSrv.get();
		const sessionCheck = userServ.checkValidSession();
		return sessionCheck.then(function(check) {
			if (check) {
				return setSelectedWidget();
			} else {
				return location.reload(true);
			}
		});
	});

	$scope.$on('widgetList.update', evt => updateWidgets(widgetSrv.getWidgets()));

	$scope.$on('widgetAvailability.update', function(evt) {
		$scope.selected.widget = selectedWidgetSrv.get();
		populateAvailability($scope.selected.widget.open_at, $scope.selected.widget.close_at);
		return populateAttempts($scope.selected.widget.attempts);
	});

	$scope.$on('collaborators.update', () => countCollaborators());

	$scope.$on('user.update', evt => $scope.user = userServ.get());

	var updateWidgets = function(data) {
		Materia.Set.Throbber.stopSpin('.courses');

		if (!data) {
			$scope.widgets.widgetList = [];
			$scope.$apply();
		} else if (data.then != null) {
			data.then(updateWidgets);
		} else {
			angular.forEach(data, function(widget, key) {
				widget.icon = Materia.Image.iconUrl(widget.widget.dir, 60);
				return widget.beard = beardServ.getRandomBeard();
			});

			$scope.$apply(() => $scope.widgets.widgetList = data.sort((a,b) => b.created_at - a.created_at));
		}
		if (firstRun) {
			widgetSrv.selectWidgetFromHashUrl();
			return firstRun = false;
		}
	};

	// Populate the widget list
	// This was originally part of prepare(), but is prepare really necessary now?
	const deferredWidgets = widgetSrv.getWidgets();
	deferredWidgets.then(updateWidgets);

	// This doesn't actually "set" the widget
	// It ensures required scope objects have been acquired before kicking off the display
	var setSelectedWidget = function() {
		$scope.perms.stale = true;

		populateDisplay();

		const currentId = $scope.selected.widget.id;

		return $q.all([
			userServ.get(),
			selectedWidgetSrv.getUserPermissions(),
			selectedWidgetSrv.getScoreSummaries(),
			selectedWidgetSrv.getDateRanges()
		])
		.then(function(data) {
			// don't render an old display if they user has clicked another widget
			if ($scope.selected.widget.id !== currentId) {
				return;
			}

			$scope.user = data[0];
			$scope.perms = data[1];
			$scope.selected.scores = data[2];

			Materia.MyWidgets.Statistics.clearGraphs();

			return populateAccess();
		});
	};

	var populateAttempts = function(attemptsAllowed) {
		attemptsAllowed = parseInt(attemptsAllowed, 10);
		return $scope.attemptText = attemptsAllowed > 0 ? attemptsAllowed : 'Unlimited';
	};

	var populateAvailability = function(startDateInt, endDateInt) {
		$scope.availability = widgetSrv.convertAvailibilityDates(startDateInt, endDateInt);
		$scope.availabilityStart = startDateInt;
		$scope.availabilityEnd = endDateInt;

		if ((endDateInt < 0) && (startDateInt < 0)) {
			return $scope.availabilityMode = "anytime";
		} else if ((startDateInt < 0) && (endDateInt > 0)) {
			return $scope.availabilityMode = "open until";
		} else if ((startDateInt > 0) && (endDateInt < 0)) {
			return $scope.availabilityMode = "anytime after";
		} else {
			return $scope.availabilityMode = "from";
		}
	};

	// Shows selected game information on the mainscreen.
	var populateDisplay = function() {
		// reset scope variables to defaults
		const count = null;

		$scope.show.olderScores = false;
		$scope.show.availabilityModal = false;
		$scope.show.collaborationModal = false;
		$scope.show.copyModal = false;
		$scope.show.deleteDialog = false;
		$scope.show.editPublishedWarning = false;
		$scope.show.embedToggle = false;
		$scope.show.exportModal = false;
		$scope.show.olderScores = false;

		$scope.selected.accessLevel = ACCESS.VISIBLE;
		$scope.selected.editable = true;
		$scope.selected.shareable = false;
		$scope.selected.hasScores = false;
		$scope.perms.collaborators = [];

		// TODO
		$scope.perms.error = false;

		$scope.selected.preview = `preview/${$scope.selected.widget.id}/${$scope.selected.widget.clean_name}`;
		$scope.selected.copy_title =  `${$scope.selected.widget.name} copy`;
		return $scope.selected.widget.iconbig = Materia.Image.iconUrl($scope.selected.widget.widget.dir, 275);
	};

	// Second half of populateDisplay
	// This allows us to update the display before the callback of scores finishes, which speeds up UI
	var populateAccess = function() {
		// accessLevel == ACCESS.VISIBLE is effectively read-only
		if (($scope.perms.user[$scope.user.id] != null ? $scope.perms.user[$scope.user.id][0] : undefined) != null) {
			$scope.selected.accessLevel = Number($scope.perms.user[$scope.user.id][0]);
		}

		$scope.selected.editable = (($scope.selected.accessLevel > ACCESS.VISIBLE) && (parseInt($scope.selected.widget.widget.is_editable) === 1));

		if ($scope.selected.editable) {
			$scope.selected.edit = `/widgets/${$scope.selected.widget.widget.dir}create\#${$scope.selected.widget.id}`;
		} else {
			$scope.selected.edit = "#";
		}

		countCollaborators();

		$scope.selected.shareable = $scope.selected.accessLevel !== ACCESS.VISIBLE;

		populateAvailability($scope.selected.widget.open_at, $scope.selected.widget.close_at);
		populateAttempts($scope.selected.widget.attempts);

		if (!$scope.selected.widget.widget.is_draft) {
			if ($scope.selected.scores.list.length > 0) {
				// TODO determine if populateScoreWrapper functionality can be implemented differently
				angular.forEach($scope.selected.scores.list, (semester, index) => populateScoreWrapper(semester, index));

				return (() => {
					const result = [];
					for (let d of Array.from($scope.selected.scores.list)) { // is this check necessary? Is there ever a use case where a list object won't have a distro array?
						if (d.distribution != null) {
							$scope.selected.hasScores = true;
							break;
						} else {
							result.push(undefined);
						}
					}
					return result;
				})();
			}
		}
	};

	// count up the number of other users collaborating
	var countCollaborators = function() {
		let count = 0;
		for (let id in $scope.perms.widget) {
			if (id !== $scope.user.id) { count++; }
		}
		return $scope.collaborateCount = count > 0 ?  ` (${count})`  : "";
	};

	var populateScoreWrapper = function(semester, index) {
		//  no scores, but we do have storage data
		if ((semester.distribution == null) && (semester.storage != null)) {
			return $scope.setScoreView(index, 2);
		} else { //  has scores, might have storage data
			// Get the score total by summing up the distribution array
			semester.totalScores = semester.distribution.reduce((prev, cur) => prev + cur);
			return $scope.setScoreView(index, 0);
		}
	};

	return $scope.setScoreView = (index, view) => $scope.selectedScoreView[index] = view;
});
