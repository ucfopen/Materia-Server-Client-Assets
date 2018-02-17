// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Controller and accessory factory for Materia's modal alert dialog
const app = angular.module('materia');
app.controller('alertCtrl', function($scope, Alert) {
	$scope.alert = Alert;
	
	return $scope.reloadPage = () => window.location.reload();
});

app.factory('Alert', () =>
	({
		title: '',
		msg: '',
		fatal: false,
		enableLoginButton: false
	})
);
