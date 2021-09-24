const app = angular.module('materia')
app.controller('UserNotificationCtrl', function (Please, $scope, $sce, $rootScope) {
	let $notices = document.querySelector('#notices')
	const _toggleOpen = () => {
		$scope.isOpen = !$scope.isOpen
	}

	const _removeNotification = (index, id) => {
		let note = $scope.notifications[index]
		note.deleted = true
		Please.$apply()
		Materia.Coms.Json.send('notification_delete', [id]).then((success) => {
			if (success) {
				$scope.notifications.splice(index, 1)
			} else {
				note.deleted = false
			}
			Please.$apply()
		})
	}

	$scope.notifications = []
	$scope.isOpen = false
	$scope.removeNotification = _removeNotification
	$scope.trust = (notification) => $sce.trustAsHtml(notification)
	$scope.toggleOpen = _toggleOpen

	Materia.Coms.Json.send('notifications_get').then((notifications) => {
		if (!notifications && !notifications.length) return
		$scope.notifications = notifications.map((notification) => {
			// does a notification include an action? Perform some additional setup based on the action performed. This is intended to be extensible.
			if (notification.action) {
				// someone is requesting access to the widget, enable the "add a collaborator" button and callback behavior
				switch (notification.action) {
					case 'access_request':
						notification.button_action_text = 'Add as Collaborator'
						notification.button_action_callback = () => {
							var url = new URL(window.location.href)

							// already on the my-widgets page; don't need to redirect, just send a broadcast with relevant info
							if (
								url.pathname.match(/^(\/my-widgets)/) &&
								url.pathname.match(/^(\/my-widgets)/).length
							) {
								$rootScope.$broadcast('notification.directAddPendingCollaborator', {
									from_id: notification.from_id,
									item_id: notification.item_id,
								})
							}
							// not on my-widgets page; update url with widget hash and collaborator id, then redirect
							else {
								url.pathname = '/my-widgets'
								url.hash = `/${notification.item_id}?pending_collaborator=${notification.from_id}`
								location.assign(url)
							}
						}
						break

					default:
						break
				}
			}
			return notification
		})

		console.log($scope.notifications)
		Please.$apply()
	})
})
