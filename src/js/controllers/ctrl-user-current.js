const app = angular.module('materia')
app.controller('UserCurrentCtrl', ($scope, $sce, userServ, $http, $rootScope) => {
	$scope.currentUser = userServ.getCurrentUser()
})
