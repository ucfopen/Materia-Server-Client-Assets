const app = angular.module('materia')
app.controller('qsetRollbackConfirmCtrl', function($scope, $sce) {
	$scope.closeDialog = e => {
		e.stopPropagation()
		return window.parent.Materia.Creator.onQsetRollbackConfirmation(null)
	}
})
