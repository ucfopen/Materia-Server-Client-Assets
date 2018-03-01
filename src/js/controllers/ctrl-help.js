const app = angular.module('materia')
app.controller('helpCtrl', $scope => {
	Materia.Flashcheck.flashInstalled(version => {
		$scope.hasFlash = !(version === false || version.major <= 10)
	})
})
