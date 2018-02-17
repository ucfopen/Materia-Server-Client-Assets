// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('scoreData', (selectedWidgetSrv, $window) =>
	({
		restrict: 'A',
		link($scope, $element, $attrs) {

			if ($attrs.hasStorage === "false") { return false; }

			const id = $attrs.id.split("_")[1];
			const widgetId = selectedWidgetSrv.getSelectedId();
			const { semester } = $attrs;

			const storage = selectedWidgetSrv.getStorageData();
			return storage.then(function(data) {

				$scope.tables = data[semester];
				$scope.MAX_ROWS = selectedWidgetSrv.getMaxRows();

				$scope.tableNames = [];

				for (let tableName in $scope.tables) { const tableData = $scope.tables[tableName]; $scope.tableNames.push(tableName); }

				return $scope.selectedTable = $scope.tableNames[0];});
		}
	})
);
