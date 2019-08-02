const app = angular.module('materia')
app.directive('ngEnter', () => (scope, element, attrs) => {
	element.bind('keypress', event => {
		if (event.which === 13) {
			scope.$apply(() => scope.$eval(attrs.ngEnter))
		}
	})
})
