// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('profileCtrl', function($scope, userServ, $http, apiServ, dateTimeServ, $log) {
	$scope.more    = false;
	$scope.loading = false;
	let loaded_offset  = 0;
	$scope.user    = {};
	$scope.avatar  = '';

	// Shows selected game information on the mainscreen.
	// @param   data   Score data sent back from the server
	const showPlayActivity = function(data) {
		if (!$scope.activities) { $scope.activities = []; }

		$scope.activities.push.apply($scope.activities, data.activity);
		$scope.more    = data.more;
		$scope.loading = false;
		return loaded_offset  = $scope.activities.length;
	};

	// Get my activity from the server
	$scope.getLogs = function() {
		$scope.loading = true;

		return $http.get('/api/user/activity', {params: {start:loaded_offset, range:10}})
			.success(function(result, status, headers, config) {
				apiServ.filterError(result);
				return showPlayActivity(result);}).error((result, status, headers, config) => $log.error(result));
	};

	$scope.getLink = function(activity) {
		if (activity.is_complete === '1') {
			return `/scores/${activity.inst_id}#play-${activity.play_id}`;
		}
		return '';
	};

	$scope.getScore = function(activity) {
		if (activity.is_complete === '1') {
			return Math.round(parseFloat(activity.percent));
		}
		return '--';
	};

	$scope.getStatus = function(activity) {
		if (activity.is_complete === '1') { return ''; }
		return 'No Score Recorded';
	};

	$scope.getDate = activity =>
		dateTimeServ.parseObjectToDateString(activity.created_at) +
		' at ' +
		dateTimeServ.fixTime(parseInt(activity.created_at, 10)*1000, DATE)
	;

	$scope.user    = userServ.getCurrentUser();
	$scope.avatar  = userServ.getCurrentUserAvatar(100);
	return $scope.getLogs();
});
