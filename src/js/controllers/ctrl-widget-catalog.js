const app = angular.module('materia')
app.controller('widgetCatalogCtrl', function(Please, $scope, $window, widgetSrv) {
	$scope.displayAll = false // TODO not used
	$scope.widgets = []
	$scope.query = ""
	$scope.count = -1
	$scope.filters = {
		scorable: false,
		mobile: false,
		media: false,
		qa: false,
		mc: false
	}

	const featureKeys = {
		scorable: 'Scorable',
		mobile: 'Mobile Friendly',
		qa: 'Question/Answer',
		mc: 'Multiple Choice',
		media: 'Media'
	}

	// checks filters and returns true if the widget should be shown, false if filtered out
	const _showWidget = widget => {
		const wFeatures = widget.meta_data.features
		const wSupport = widget.meta_data.supported_data

		for (let filterName in $scope.filters) {
			const filterOn = $scope.filters[filterName]
			const metaValue = featureKeys[filterName]

			if (filterOn && !wFeatures.includes(metaValue) && !wSupport.includes(metaValue)) {
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
		Please.$apply()
	}

	// load list of widgets
	widgetSrv.getWidgetsByType('all').then(widgets => {
		if (!widgets || !widgets.length || !widgets.length > 0) {
			return
		}
		// setup some default values
		widgets.forEach(widget => {
			widget.icon = Materia.Image.iconUrl(widget.dir, 275)
			widget.visible = true
		})
		$scope.widgets = widgets

		// draw the grid once widgets are initially sized (need height)
		_createGrid()
		$scope.$watch('query', _createGrid)
		$scope.$watchCollection('filters', _createGrid)
		// redraw the grid whenever the window is resized
		angular.element($window).bind('resize', _checkResize)
	})

	const _checkResize = () => {
		$scope.isMini = document.getElementById('widgets-container').scrollWidth < 860
		Please.$apply()
	}
	_checkResize()

	// TODO this doesn't do anything
	// DISPLAY_TYPE can be rendered in the page by the server
	if (typeof DISPLAY_TYPE !== 'undefined' && DISPLAY_TYPE === 'all') {
		$scope.displayAll = true
	}
})
