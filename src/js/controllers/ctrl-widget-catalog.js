const app = angular.module('materia')

if (window.location.href.includes('/widgets') && !window.location.href.includes('-')) {
	app.config(function($locationProvider) {
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		})
	})
}

app.controller('widgetCatalogCtrl', function(Please, $scope, $window, $location, widgetSrv) {
	$scope.displayAll = false
	$scope.widgets = []
	$scope.query = ''
	$scope.count = -1
	$scope.mobileFiltersOpen = false
	$scope.ready = false
	$scope.filters = {
		Scorable: {
			active: false,
			text: 'Collects Scores',
			clean: 'scorable'
		},
		'Mobile Friendly': {
			active: false,
			text: 'Mobile Friendly',
			clean: 'mobile_friendly'
		},
		Media: {
			active: false,
			text: 'Uploadable Media',
			clean: 'media'
		},
		'Question/Answer': {
			active: false,
			text: 'Question/Answer',
			clean: 'question_answer'
		},
		'Multiple Choice': {
			active: false,
			text: 'Multiple Choice',
			clean: 'multiple_choice'
		}
	}

	const uncleanMap = {
		scorable: 'Scorable',
		mobile_friendly: 'Mobile Friendly',
		media: 'Media',
		question_answer: 'Question/Answer',
		multiple_choice: 'Multiple Choice'
	}

	$scope.toggleDisplayAll = () => {
		$scope.displayAll = !$scope.displayAll
		const path = $scope.displayAll ? 'widgets/all' : 'widgets'
		$location.path(path).replace()
		resortWidgets()
		_createGrid()
	}

	const resortWidgets = () => {
		$scope.widgets = $scope[$scope.displayAll ? 'alphabetical' : 'featuredFirst']
	}

	$scope.toggleFeature = feature => {
		$scope.filters[feature].active = !$scope.filters[feature].active
		const val = $scope.filters[feature].active || null
		const cleanName = $scope.filters[feature].clean
		$location.search(cleanName, val).replace()
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

		$scope.activeFilters = Object.keys($scope.filters).filter(key => $scope.filters[key].active)

		Please.$apply()
	}

	const _updateQuery = () => {
		const val = $scope.query || null
		$location.search('query', val).replace()
		_createGrid()
	}

	// load list of widgets
	widgetSrv.getWidgetsByType('all').then(widgets => {
		if (!widgets || !widgets.length || !widgets.length > 0) {
			return
		}
		widgets.forEach(widget => {
			widget.icon = Materia.Image.iconUrl(widget.dir, 275)
		})

		const featured = widgets.filter(w => w.in_catalog == '1')
		const notFeatured = widgets.filter(w => w.in_catalog == '0')
		$scope.featuredFirst = [...featured, ...notFeatured]
		$scope.alphabetical = widgets
		resortWidgets()

		$scope.$watch('query', _updateQuery)
		_createGrid()
		$scope.ready = true // prevents animation on initial load
	})

	// load filters from url
	for (let key in $location.search()) {
		if (key == 'query') {
			$scope.query = $location.search().query
		} else if (uncleanMap[key]) {
			$scope.filters[uncleanMap[key]].active = true
		}
	}

	if ($location.path().includes('all')) {
		$scope.displayAll = true
	}

	$scope.activeFilters = Object.keys($scope.filters).filter(key => $scope.filters[key].active)

	// with html mode is on, angular will have to process all location changes
	// means we have to manually change url when needed
	$scope.$on('$locationChangeStart', (e, newUrl) => {
		if (!newUrl.includes('/widgets') || newUrl.includes('-')) {
			$window.location = newUrl
		}
	})
})
