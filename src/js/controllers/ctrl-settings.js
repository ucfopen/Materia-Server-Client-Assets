const app = angular.module('materia')
app.controller('settingsController', function($scope, $http, userServ, apiServ, $log) {
	$scope.user = userServ.getCurrentUser()
	$scope.avatar = userServ.getCurrentUserAvatar(100)
	$scope.useGravatar = $scope.user.avatar.indexOf('gravatar') > -1

	$scope.saveSettings = () => {
		Materia.Set.Throbber.startSpin('.page')

		const newSettings = {
			notify: $scope.user.notify,
			useGravatar: $scope.useGravatar
		}

		$http
			.post('/api/user/settings', newSettings)
			.success((result, status, headers, config) => {
				apiServ.filterError(result)
				Materia.Set.Throbber.stopSpin('.page')
				$scope.settingsForm.$setPristine()
				if (result.success) {
					// update my scope object
					for (let k in result.meta) {
						userServ.updateSettings(k, result.meta[k])
					}

					// update the user avatar
					if ((result.avatar != null ? result.avatar.length : undefined) > 0) {
						userServ.updateSettings('avatar', result.avatar)
						$scope.avatar = userServ.getCurrentUserAvatar(100)
					}
				}
			})
			.error((result, status, headers, config) => {
				$log.error(result)
				Materia.Set.Throbber.stopSpin('.page')
			})
	}
})
