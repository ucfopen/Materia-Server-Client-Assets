/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('scoreTable', (selectedWidgetSrv, $window) =>
	({
		restrict: 'A',
		link($scope, $element, $attrs) {

			const widgetId = selectedWidgetSrv.getSelectedId();
			const tableSort = 'desc';
			$scope.users = {};
			const userCount = [];
			const users = {};
			let masterUserList = {};
			$scope.selectedUser = null;

			let { term } = $attrs;
			const { year } = $attrs;

			const logs = selectedWidgetSrv.getPlayLogsForSemester(term, year);
			logs.then(function(data) {

				// process play logs into records for each user
				angular.forEach(data, function(log, index) {

					const uid = log.user_id;
					const name = log.last ? `${log.last}, ${log.first}` : "Guests";

					if (users[uid] == null) {
						users[uid] = {
							uid,
							name,
							scores : {}
						};
					}

					// make the score percentage readable
					let percent = 0;
					if (log.done === "1") {
						percent = parseFloat(log.perc).toFixed(2).replace('.00', '');
					}

					// make the play duration readable
					let duration = 0;
					const mins = (log.elapsed - (log.elapsed % 60)) / 60;
					const secs = log.elapsed % 60;

					if (mins !== 0) { duration =  `${mins}m ${secs}s`;
					} else { duration = `${secs}s`; }

					return users[uid].scores[log.time.toString()] = {
						date : new Date(log.time*1000).toDateString(),
						percent,
						elapsed : duration,
						complete : log.done,
						id: log.id
					};
				});

				$scope.users = users;
				return masterUserList = users;
			});

			$scope.setSelectedUser = id => $scope.selectedUser = $scope.users[id];

			$scope.showScorePage = function(scoreId) {
				$window.open(`${BASE_URL}scores/${widgetId}/#single-${scoreId}`);
				return true;
			};

			return $scope.searchStudentActivity = function(query) {

				if (query === "") { return $scope.users = masterUserList; }
				$scope.selectedUser = null;

				const sanitized = query.toLowerCase().replace(/,/g, ' ');
				const hits = {};
				const misses = {};
				const terms = sanitized.split(' ');

				angular.forEach(masterUserList, function(user, index) {
					let match = false;

					return (() => {
						const result = [];
						for (term of Array.from(terms)) {
							if (user.name.toLowerCase().indexOf(term) > -1) {
								match = true;
							} else {
								match = false;
								break;
							}

							if (match) {
								result.push(hits[user.uid] = user);
							} else {
								result.push(misses[user.uid] = user);
							}
						}
						return result;
					})();
				});

				return $scope.users = hits;
			};
		}
	})
);

