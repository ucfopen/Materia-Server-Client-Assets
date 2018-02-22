'use strict'

const app = angular.module('materia')
app.directive('scoreData', function(selectedWidgetSrv, $window) {
	return {
		restrict: 'A',
		link($scope, $element, $attrs) {
			if ($attrs.hasStorage === 'false') {
				return false
			}

			const id = $attrs.id.split('_')[1]
			const { semester } = $attrs
			const storage = selectedWidgetSrv.getStorageData()
			storage.then(data => {
				$scope.tables = data[semester]
				$scope.MAX_ROWS = selectedWidgetSrv.getMaxRows()
				$scope.tableNames = Object.keys($scope.tables)
				$scope.selectedTable = $scope.tableNames[0]
			})
		}
	}
})
