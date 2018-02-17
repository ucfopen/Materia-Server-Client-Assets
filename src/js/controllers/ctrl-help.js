/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('helpCtrl', ($scope, $sce) =>
	Materia.Flashcheck.flashInstalled(function(version) {
		if ((version === false) || (version.major <= 10)) {
			return $scope.noFlash = true;
		} else {
			return $scope.hasFlash = true;
		}
	})
);

