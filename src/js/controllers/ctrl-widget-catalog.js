/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('widgetCatalogCtrl', function($scope, widgetSrv) {

	const featureKeys = {
		customizable: 'Customizable',
		scorable: 'Scorable',
		mobile: 'Mobile Friendly',
		qa: 'Question/Answer',
		mc: 'Multiple Choice',
		media: 'Media'
	};

	$scope.widgets = [];
	$scope.filters = {
		scorable:false,
		customizable:false,
		qa:false,
		mc:false,
		media:false
	};

	$scope.displayAll = false;

	const hideFiltered = () =>
		(() => {
			const result = [];
			for (let i = 0; i < $scope.widgets.length; i++) {
				var widget = $scope.widgets[i];
				var wFeatures = widget.meta_data.features;
				var wSupport = widget.meta_data.supported_data;
				widget.visible = true;

				result.push((() => {
					const result1 = [];
					for (let filterName in $scope.filters) {
						const filterOn = $scope.filters[filterName];
						const metaValue = featureKeys[filterName];

						if (filterOn && (wFeatures.indexOf(metaValue) < 0) && (wSupport.indexOf(metaValue) < 0)) {
							widget.visible = false;
							break;
						} else {
							result1.push(undefined);
						}
					}
					return result1;
				})());
			}
			return result;
		})()
	;

	// Display default "featured" widgets
	const displayWidgets = function() {
		Materia.Set.Throbber.startSpin('.page');
		return widgetSrv.getWidgetsByType('featured', function(widgets) {
			if (((widgets != null ? widgets.length : undefined) == null)) { return; }
			// setup some default values
			for (let i = 0; i < widgets.length; i++) {
				const widget = widgets[i];
				widget.icon = Materia.Image.iconUrl(widget.dir, 92);
				widget.visible = true;
			}

			Materia.Set.Throbber.stopSpin('.page');

			$scope.$watchCollection('filters', hideFiltered);

			$scope.widgets = widgets;
			return $scope.$apply();
		});
	};

	// Display ALL the widgets
	const displayAllWidgets = function() {
		Materia.Set.Throbber.startSpin('.page');
		return widgetSrv.getWidgetsByType('all', function(widgets) {
			if (((widgets != null ? widgets.length : undefined) == null)) { return; }

			for (let i = 0; i < widgets.length; i++) {
				const widget = widgets[i];
				widget.icon = Materia.Image.iconUrl(widget.dir, 92);
				widget.visible = true;
			}

			Materia.Set.Throbber.stopSpin('.page');

			$scope.$watchCollection('filters', hideFiltered);

			$scope.widgets = widgets;
			return $scope.$apply();
		});
	};

	// DISPLAY_TYPE added from controller if it was passed as part of the URL
	if (typeof DISPLAY_TYPE !== 'undefined') {

		switch (DISPLAY_TYPE) {
			case 'all':
				$scope.displayAll = true;
				break;
			default:
				displayWidgets();
		}

	} else {
		// Load the widgets
		displayWidgets();
	}

	return $scope.$watch('displayAll', function() {
		if ($scope.displayAll) { return displayAllWidgets();
		} else { return displayWidgets(); }
	});
});

