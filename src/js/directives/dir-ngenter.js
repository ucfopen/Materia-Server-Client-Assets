// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('ngEnter', () =>
	(scope, element, attrs) =>
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				return scope.$apply(() => scope.$eval(attrs.ngEnter));
			}
		})
	
);
