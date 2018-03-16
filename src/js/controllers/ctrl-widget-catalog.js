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
		for (let i = 0; i < $scope.widgets.length; i++) {
			var widget = $scope.widgets[i]
			var wFeatures = widget.meta_data.features
			var wSupport = widget.meta_data.supported_data
			widget.visible = true

			for (let filterName in $scope.filters) {
				const filterOn = $scope.filters[filterName]
				const metaValue = featureKeys[filterName]

				if (filterOn && wFeatures.indexOf(metaValue) < 0 && wSupport.indexOf(metaValue) < 0) {
					widget.visible = false
					break
				}
			}
		}
	}

	const _displayWidgets = () => {
		let type = $scope.displayAll ? 'all' : 'featured'
		Materia.Set.Throbber.startSpin('.page')
		widgetSrv.getWidgetsByType(type).then(widgets => {
			if (!widgets || !widgets.length || !widgets.length > 0) {
				return
			}
			// setup some default values
			widgets.forEach(widget => {
				widget.icon = Materia.Image.iconUrl(widget.dir, 92)
				widget.visible = true
			})

			Materia.Set.Throbber.stopSpin('.page')
			$scope.$watchCollection('filters', _hideFiltered)
			$scope.widgets = widgets
			Please.$apply()
		})
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

	$scope.$watch('displayAll', () => {
		_displayWidgets()
	})

	// DISPLAY_TYPE can be rendered in the page by the server
	if (typeof DISPLAY_TYPE !== 'undefined' && DISPLAY_TYPE === 'all') {
		$scope.displayAll = true
	}
})
