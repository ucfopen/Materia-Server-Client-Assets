// Controller and accessory factory for Materia's modal alert dialog
const app = angular.module('materia')
app.controller('alertCtrl', function($scope, Alert, $window) {
	$scope.alert = Alert
	$scope.reloadPage = () => {
		$window.location.reload()
	}
})

app.factory('Alert', () => ({
	title: '',
	msg: '',
	fatal: false,
	enableLoginButton: false
}))
