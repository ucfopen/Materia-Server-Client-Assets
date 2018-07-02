const app = angular.module('materia')
app.requires.push('ngModal')
app.config(function($locationProvider) {
	$locationProvider.hashPrefix('')
})
app.controller('MyWidgetsController', function(
	Please,
	$rootScope,
	$scope,
	$q,
	$window,
	$timeout,
	widgetSrv,
	userServ,
	selectedWidgetSrv,
	beardServ,
	ACCESS,
	Alert
) {
	let firstRun = true
	let loadScoresTimout = null

	const _prepareWidgetForDisplay = widget => {
		widget.icon = Materia.Image.iconUrl(widget.widget.dir, 60)
		widget.beard = beardServ.getRandomBeard()
	}

	const updateWidgets = data => {
		Materia.Set.Throbber.stopSpin('.courses')

		// data is empty
		if (!data) {
			$scope.widgets.widgetList = []
			Please.$apply()
		} else if (data.then != null) {
			// data is a promise
			data.then(updateWidgets)
		} else {
			// we've got data
			// build attribues for each widget
			angular.forEach(data, widget => {
				_prepareWidgetForDisplay(widget)
			})

			$scope.widgets.widgetList = data
			// sort widgets by create time
			Please.$apply()
		}

		// on the first load, select the widget from the url
		if (firstRun) {
			widgetSrv.selectWidgetFromHashUrl()
			firstRun = false
			$window.addEventListener('hashchange', widgetSrv.selectWidgetFromHashUrl, false)
		}
	}

	// This doesn't actually "set" the widget
	// It ensures required scope objects have been acquired before kicking off the display
	const setSelectedWidget = () => {
		const currentId = $scope.selected.widget.id

		// clear scores right away
		$scope.selected.scores = null
		$scope.perms.stale = true

		populateDisplay()

		$q
			.all([
				userServ.get(),
				selectedWidgetSrv.getUserPermissions(),
				selectedWidgetSrv.getDateRanges()
			])
			.then(data => {
				// don't render an old display if they user has clicked another widget
				if ($scope.selected.widget.id !== currentId) {
					return
				}

				$scope.user = data[0]
				$scope.perms = data[1]
				populateAccess()

				$timeout.cancel(loadScoresTimout)

				// load the scores a little later
				loadScoresTimout = $timeout(() => {
					selectedWidgetSrv.getScoreSummaries().then(scores => {
						$scope.selected.scores = scores
						populateScores()
					})
				}, 300)
			})
	}

	const populateAttempts = attemptsAllowed => {
		attemptsAllowed = parseInt(attemptsAllowed, 10)
		$scope.attemptText = attemptsAllowed > 0 ? attemptsAllowed : 'Unlimited'
	}

	const populateAvailability = (startDateInt, endDateInt) => {
		$scope.availability = widgetSrv.convertAvailibilityDates(startDateInt, endDateInt)
		$scope.availabilityStart = startDateInt
		$scope.availabilityEnd = endDateInt

		if (endDateInt < 0 && startDateInt < 0) {
			$scope.availabilityMode = 'anytime'
		} else if (startDateInt < 0 && endDateInt > 0) {
			$scope.availabilityMode = 'open until'
		} else if (startDateInt > 0 && endDateInt < 0) {
			$scope.availabilityMode = 'anytime after'
		} else {
			$scope.availabilityMode = 'from'
		}
	}

	// Shows selected game information on the mainscreen.
	const populateDisplay = () => {
		// reset scope variables to defaults
		const count = null

		$scope.show.availabilityModal = false
		$scope.show.collaborationModal = false
		$scope.show.copyModal = false
		$scope.show.deleteDialog = false
		$scope.show.editPublishedWarning = false
		$scope.show.embedToggle = false
		$scope.show.autoplayToggle = true
		$scope.show.exportModal = false
		$scope.show.olderScores = false

		$scope.selected.accessLevel = ACCESS.VISIBLE
		$scope.selected.editable = true
		$scope.selected.shareable = false
		$scope.selected.hasScores = false
		$scope.perms.collaborators = []

		// TODO
		$scope.perms.error = false

		$scope.selected.preview = `preview/${$scope.selected.widget.id}/${
			$scope.selected.widget.clean_name
		}`
		$scope.selected.copy_title = `${$scope.selected.widget.name} copy`
		$scope.selected.widget.iconbig = Materia.Image.iconUrl($scope.selected.widget.widget.dir, 275)
	}

	const populateScores = () => {
		if (!$scope.selected.widget.widget.is_draft) {
			if ($scope.selected.scores.list.length > 0) {
				// TODO determine if _populateScoreWrapper functionality can be implemented differently
				angular.forEach($scope.selected.scores.list, (semester, index) => {
					_populateScoreWrapper(semester, index)
					if (semester.distribution) {
						$scope.selected.hasScores = true
					}
				})
			}
		}
	}

	// Second half of populateDisplay
	// This allows us to update the display before the callback of scores finishes, which speeds up UI
	const populateAccess = () => {
		// accessLevel == ACCESS.VISIBLE is effectively read-only
		if (
			($scope.perms.user[$scope.user.id] != null
				? $scope.perms.user[$scope.user.id][0]
				: undefined) != null
		) {
			$scope.selected.accessLevel = Number($scope.perms.user[$scope.user.id][0])
		}

		$scope.selected.editable =
			$scope.selected.accessLevel > ACCESS.VISIBLE &&
			parseInt($scope.selected.widget.widget.is_editable) === 1

		if ($scope.selected.editable) {
			$scope.selected.edit = `/widgets/${$scope.selected.widget.widget.dir}create\#${
				$scope.selected.widget.id
			}`
		} else {
			$scope.selected.edit = '#'
		}

		_countCollaborators()

		$scope.selected.shareable = $scope.selected.accessLevel !== ACCESS.VISIBLE

		populateAvailability($scope.selected.widget.open_at, $scope.selected.widget.close_at)
		populateAttempts($scope.selected.widget.attempts)
	}

	// count up the number of other users collaborating
	const _countCollaborators = () => {
		let count = 0
		for (let id in $scope.perms.widget) {
			if (id !== $scope.user.id) {
				count++
			}
		}
		$scope.collaborateCount = count > 0 ? ` (${count})` : ''
	}

	const _populateScoreWrapper = (semester, index) => {
		//  no scores, but we do have storage data
		if (semester.distribution == null && semester.storage != null) {
			_setScoreViewTab(index, $scope.SCORE_TAB_STORAGE)
		} else {
			//  has scores, might have storage data
			// Get the score total by summing up the distribution array
			semester.totalScores = semester.distribution.reduce((prev, cur) => prev + cur)
			_setScoreViewTab(index, $scope.SCORE_TAB_GRAPH)
		}
	}

	const _setScoreViewTab = (index, view) => {
		// load storage data if needed
		if (view === $scope.SCORE_TAB_STORAGE) {
			selectedWidgetSrv.getStorageData().then(data => {
				$rootScope.$broadcast('storageData.loaded')
				Please.$apply()
			})
		}

		$scope.selectedScoreView[index] = view
	}

	const _onSelectedWidgetUpdate = () => {
		$scope.selected.widget = selectedWidgetSrv.get()
		const sessionCheck = userServ.checkValidSession()
		sessionCheck.then(check => {
			if (check) {
				setSelectedWidget()
			} else {
				location.reload(true)
			}
		})
	}

	// expose to scope

	$scope.setScoreViewTab = _setScoreViewTab
	$scope.alert = Alert
	$scope.baseUrl = BASE_URL
	$scope.widgets = { widgetList: [] }
	$scope.selected = {
		widget: null,
		perms: {},
		scores: {},
		accessLevel: ACCESS.VISIBLE,
		shareable: false,
		editable: true,
		hasScores: false,
		preview: '',
		guestAccess: false,
		embeddedOnly: false
	}
	$scope.perms = { collaborators: [] }
	$scope.show = {
		collaborationModal: false,
		availabilityModal: false,
		copyModal: false,
		olderScores: false,
		exportModal: false,
		deleteDialog: false,
		embedToggle: false,
		editPublishedWarning: false
	}
	$scope.SCORE_TAB_GRAPH = 0
	$scope.SCORE_TAB_INDIVIDUAL = 1
	$scope.SCORE_TAB_STORAGE = 2
	$scope.selectedScoreView = [] // array of above (i.e. 0 = graph)

	$scope.setSelected = id => {
		widgetSrv.updateHashUrl(id)
	}

	// Initialize

	$scope.$on('selectedWidget.update', _onSelectedWidgetUpdate)
	$scope.$on('collaborators.update', _countCollaborators)
	$scope.$on('widgetList.update', evt => {
		updateWidgets(widgetSrv.getWidgets())
	})
	$scope.$on('user.update', evt => {
		$scope.user = userServ.get()
	})

	widgetSrv.getWidgets().then(updateWidgets)
})
