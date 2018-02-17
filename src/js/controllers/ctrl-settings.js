/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('settingsController', function($scope, $http, userServ, apiServ, $log) {
	// SAVED_MESSAGE_DISPLAY_DELAY = 1000

	$scope.user = userServ.getCurrentUser();
	$scope.avatar = userServ.getCurrentUserAvatar(100);
	$scope.useGravatar = $scope.user.avatar.indexOf('gravatar') > -1;

	return $scope.saveSettings = function() {
		Materia.Set.Throbber.startSpin('.page');

		const newSettings = {
			notify: $scope.user.notify,
			useGravatar: $scope.useGravatar
		};

		return $http.post('/api/user/settings', newSettings)
			.success(function(result, status, headers, config) {
				apiServ.filterError(result);
				Materia.Set.Throbber.stopSpin('.page');
				$scope.settingsForm.$setPristine();
				if (result.success) {

					// update my scope object
					for (let k in result.meta) {
						const v = result.meta[k];
						userServ.updateSettings(k, v);
					}

					// update the user avatar
					if ((result.avatar != null ? result.avatar.length : undefined) > 0) {
						userServ.updateSettings('avatar', result.avatar);
						return $scope.avatar = userServ.getCurrentUserAvatar(100);
					}
				}}).error(function(result, status, headers, config) {
				$log.error(result);
				return Materia.Set.Throbber.stopSpin('.page');
		});
	};
});
