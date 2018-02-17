/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
// Ensures the user can only input numeric characters, '/', and ':' for the
// date and time inputs.
app.directive('dateValidation', () =>
	({
		require: 'ngModel',
		scope: {
			validate: "&"
		},
		link(scope, element, attrs, modelCtrl) {
			return modelCtrl.$parsers.push(function(inputValue) {
				// Dates can do 0-9 and '/'
				let transformed;
				if (attrs.validate === 'date') {
					transformed = inputValue.replace(/[^\d\/]/g,'');
				// Times can do 0-9 and ':'
				} else {
					transformed = inputValue.replace(/[^\d:]/g,'');
				}

				if (transformed !== inputValue) {
					modelCtrl.$setViewValue(transformed);
					modelCtrl.$render();
				}
				return transformed;
			});
		}
	})
);

