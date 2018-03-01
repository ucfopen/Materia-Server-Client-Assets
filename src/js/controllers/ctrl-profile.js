const app = angular.module('materia')
app.controller('profileCtrl', function($scope, userServ, apiServ, dateTimeServ, $log) {
	let loaded_offset = 0

	// Shows selected game information on the mainscreen.
	// @param   data   Score data sent back from the server
	const _showPlayActivity = data => {
		if (!$scope.activities) {
			$scope.activities = []
		}

		$scope.activities.push.apply($scope.activities, data.activity)
		$scope.more = data.more
		$scope.loading = false
		loaded_offset = $scope.activities.length
	}

	const _getLogs = () => {
		$scope.loading = true

		Materia.Coms.Json.get(`/api/user/activity?range=10&start=${loaded_offset}`)
			.then(result => {
				apiServ.filterError(result)
				_showPlayActivity(result)
			})
			.catch(error => {
				$log.error('Error loading user activity')
			})
	}

	const _getLink = activity => {
		if (activity.is_complete === '1') {
			return `/scores/${activity.inst_id}#play-${activity.play_id}`
		}
		return ''
	}

	const _getScore = activity => {
		if (activity.is_complete === '1') {
			return Math.round(parseFloat(activity.percent))
		}
		return '--'
	}

	const _getStatus = activity => {
		if (activity.is_complete === '1') {
			return ''
		}
		return 'No Score Recorded'
	}

	const _getDate = activity =>
		dateTimeServ.parseObjectToDateString(activity.created_at) +
		' at ' +
		dateTimeServ.fixTime(parseInt(activity.created_at, 10) * 1000, DATE)

	// expose on scope

	$scope.getLogs = _getLogs
	$scope.getLink = _getLink
	$scope.getScore = _getScore
	$scope.getStatus = _getStatus
	$scope.getDate = _getDate
	$scope.more = false
	$scope.loading = false
	$scope.user = {}
	$scope.avatar = ''
	$scope.user = userServ.getCurrentUser()
	$scope.avatar = userServ.getCurrentUserAvatar(100)

	// initialize
	$scope.getLogs()
})
