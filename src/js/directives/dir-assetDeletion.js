const app = angular.module('materia')
app.directive('deleteAction', () => ({
	restrict: 'A',
	link(scope, element, attrs) {
		// const onDeleteHandler = scope.$eval(attrs.deleteAction)
		// element.bind('change', onDeleteHandler)
		// element.bind('drop', onDeleteHandler)
	}
}))