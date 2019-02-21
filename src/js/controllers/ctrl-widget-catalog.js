const app = angular.module('materia')
app.controller('widgetCatalogCtrl', function(Please, $scope, $window, widgetSrv) {
	$scope.displayAll = false
	$scope.widgets = []
	$scope.query = ""
	$scope.count = -1
	$scope.filters = {
		'Scorable': {
			active: false,
			text: "Collects Scores",
			type: 1
		},
		'Mobile Friendly': {
			active: false,
			text: "Mobile Friendly",
			type: 1
		},
		'Media': {
			active: false,
			text: "Uploadable Media",
			type: 1
		},
		'Question/Answer': {
			active: false,
			text: "Question/Answer",
			type: 2
		},
		'Multiple Choice': {
			active: false,
			text: "Multiple Choice",
			type: 2
		}
	}
	$scope.displayAll = false
	$scope.ready = false
	$scope.toggleDisplayAll = () => $scope.displayAll = !$scope.displayAll
	$scope.toggleFeature = feature => {
		$scope.filters[feature].active = !$scope.filters[feature].active
		_createGrid()
	}


	// checks filters and returns true if the widget should be shown, false if filtered out
	const _showWidget = widget => {
		const wFeatures = widget.meta_data.features
		const wSupport = widget.meta_data.supported_data

		for (let filterName in $scope.filters) {
			const filterOn = $scope.filters[filterName].active

			if (filterOn && !wFeatures.includes(filterName) && !wSupport.includes(filterName)) {
				return false
			}
		}

		if (!$scope.displayAll && widget.in_catalog == "0") {
			return false
		}

		if ($scope.query.length) {
			const re = new RegExp($scope.query, 'i')
			return re.test(widget.name)
		}

		return true
	}

	const _createGrid = () => {
		$scope.count = 0
		for (let widget of $scope.widgets) {
			if (_showWidget(widget)) {
				widget.visible = true
				$scope.count++
			} else {
				widget.visible = false
			}
		}

		$scope.mobileFiltersOpen = false
		Please.$apply()
	}

	// load list of widgets
	widgetSrv.getWidgetsByType('all').then(widgets => {
		if (!widgets || !widgets.length || !widgets.length > 0) {
			return
		}
		// set up some default values
		widgets.forEach(widget => {
			widget.icon = Materia.Image.iconUrl(widget.dir, 275)
		})

		$scope.widgets = widgets

		_createGrid()
		$scope.ready = true // prevents animation when loading
		$scope.$watch('query', _createGrid)
		$scope.$watch('displayAll', _createGrid)
	})

	// DISPLAY_TYPE can be rendered in the page by the server (on widgets/all)
	if (typeof DISPLAY_TYPE !== 'undefined' && DISPLAY_TYPE === 'all') {
		$scope.displayAll = true
	}
})
