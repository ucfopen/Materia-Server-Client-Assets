/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('loginCtrl', ($scope, $sce, dateTimeServ) =>
	// Widget login partial has this on widgets with expiration
	$scope.time = date => dateTimeServ.fixTime(date, $scope.date)
);

