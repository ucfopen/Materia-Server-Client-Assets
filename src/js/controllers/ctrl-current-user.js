/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('currentUserCtrl', ($scope, $sce, userServ, $http, $rootScope) => $scope.currentUser = userServ.getCurrentUser());
