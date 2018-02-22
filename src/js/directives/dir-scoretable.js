// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict'

const app = angular.module('materia')
app.directive('scoreTable', function(selectedWidgetSrv, $window) {
	return {
		restrict: 'A',
		link($scope, $element, $attrs) {
			const widgetId = selectedWidgetSrv.getSelectedId()
			const tableSort = 'desc'
			const userCount = []
			const users = {}
			const { year } = $attrs
			let { term } = $attrs
			let masterUserList = {}
			$scope.users = {}
			$scope.selectedUser = null

			const logs = selectedWidgetSrv.getPlayLogsForSemester(term, year)
			logs.then(function(data) {
				// process play logs into records for each user
				angular.forEach(data, function(log, index) {
					const uid = log.user_id
					const name = log.last ? `${log.last}, ${log.first}` : 'Guests'

					if (users[uid] == null) {
						users[uid] = {
							uid,
							name,
							scores: {}
						}
					}

					// make the score percentage readable
					let percent = 0
					if (log.done === '1') {
						percent = parseFloat(log.perc)
							.toFixed(2)
							.replace('.00', '')
					}

					// make the play duration readable
					let duration = 0
					const mins = (log.elapsed - log.elapsed % 60) / 60
					const secs = log.elapsed % 60

					if (mins !== 0) {
						duration = `${mins}m ${secs}s`
					} else {
						duration = `${secs}s`
					}

					return (users[uid].scores[log.time.toString()] = {
						date: new Date(log.time * 1000).toDateString(),
						percent,
						elapsed: duration,
						complete: log.done,
						id: log.id
					})
				})

				masterUserList = $scope.users = users
			})

			$scope.setSelectedUser = id => {
				$scope.selectedUser = $scope.users[id]
			}

			$scope.showScorePage = function(scoreId) {
				$window.open(`${BASE_URL}scores/${widgetId}/#single-${scoreId}`)
				return true
			}

			$scope.searchStudentActivity = function(query) {
				if (query === '') {
					$scope.users = masterUserList
					return
				}

				$scope.selectedUser = null
				const sanitized = query.toLowerCase().replace(/,/g, ' ')
				const hits = {}
				const terms = sanitized.split(' ')

				// loop over mast users to check if any search word matches the user name
				angular.forEach(masterUserList, user => {
					let name = user.name.toLowerCase()
					terms.forEach(term => {
						if (name.includes(term)) {
							hits[user.uid] = user
						}
					})
				})

				$scope.users = hits
			}
		}
	}
})
