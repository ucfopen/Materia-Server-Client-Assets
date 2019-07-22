'use strict'
const app = angular.module('materia')

app.directive('focusMe', ($timeout, $parse) => ({
	restrict: 'A',
	link($scope, $element, $attrs) {
		const model = $parse($attrs.focusMe)
		$scope.$watch(model, function(value) {
			if (value) {
				$timeout(() => $element[0].focus())
			}
		})
	}
}))
