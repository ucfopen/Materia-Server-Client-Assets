// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.directive('fancybox', ($compile, $timeout) =>
	({
		link($scope, element, attrs) {
			return $(element).fancybox({
				onComplete() {
					return $timeout(function() {
						$compile($("#fancybox-content"))($scope);
						$scope.$apply();
						return $.fancybox.resize();
					});
				}
			});
		}
	})
);


