/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('datatable', ($compile, $timeout) =>
	({
		restrict: 'A',
		link($scope, $element, $attrs) {
			$timeout(() => $($element).DataTable());
			return null;
		}
	})
);
