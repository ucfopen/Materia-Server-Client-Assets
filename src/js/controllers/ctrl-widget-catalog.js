const app = angular.module('materia')
app.controller('widgetCatalogCtrl', function(Please, $scope, widgetSrv) {
	const featureKeys = {
		customizable: 'Customizable',
		scorable: 'Scorable',
		mobile: 'Mobile Friendly',
		qa: 'Question/Answer',
		mc: 'Multiple Choice',
		media: 'Media'
	}

	const _hideFiltered = () => {
		for (let widget of $scope.widgets) {
			var wFeatures = widget.meta_data.features
			var wSupport = widget.meta_data.supported_data
			widget.visible = true

			for (let filterName in $scope.filters) {
				const filterOn = $scope.filters[filterName]
				const metaValue = featureKeys[filterName]

				if (filterOn && !wFeatures.includes(metaValue) && !wSupport.includes(metaValue)) {
					widget.visible = false
					break
				}
			}
		}
	}

	// expose to scope

	$scope.displayAll = false
	$scope.widgets = []
	$scope.filters = {
		scorable: false,
		customizable: false,
		qa: false,
		mc: false,
		media: false
	}

	// load list of widgets
	widgetSrv.getWidgetsByType('all').then(widgets => {
		if (!widgets || !widgets.length || !widgets.length > 0) {
			return
		}
		// setup some default values
		widgets.forEach(widget => {
			widget.icon = Materia.Image.iconUrl(widget.dir, 92)
			widget.visible = true
		})
		$scope.$watchCollection('filters', _hideFiltered)
		$scope.widgets = widgets
		Please.$apply()
	})

	// DISPLAY_TYPE can be rendered in the page by the server
	if (typeof DISPLAY_TYPE !== 'undefined' && DISPLAY_TYPE === 'all') {
		$scope.displayAll = true
	}
})
