const app = angular.module('materia')
app.controller('notificationCtrl', function(Please, $scope, $sce) {
	const _clickNotification = () => {
		if ($scope.clicked) {
			$('#notices').slideUp(function() {
				$('#notifications_link').removeClass('selected')
				if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
					$('#swfplaceholder').hide()
					$('object').css('visibility', 'visible')
				}
			})
		} else {
			const $object = $('object')
			if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
				if ($('#swfplaceholder').length > 0) {
					$('#swfplaceholder').show()
				}
				$object.css('visibility', 'hidden')
			}
			$('#notifications_link').addClass('selected')
			$('#notifications_link').show()
			$('#notices')
				.children()
				.fadeIn()
			$('#notices').slideDown(function() {})
		}
		$scope.clicked = !$scope.clicked
	}

	const _removeNotification = index => {
		Materia.Coms.Json.send('notification_delete', [$scope.values.notifications[index].id])
		$scope.values.notifications.splice(index, 1)
	}

	$scope.values = { notifications: [] }
	$scope.clicked = false
	$scope.removeNotification = _removeNotification
	$scope.trust = notification => $sce.trustAsHtml(notification)
	$scope.clickNotification = _clickNotification

	Materia.Coms.Json.send('notifications_get').then(notifications => {
		$scope.values.notifications = notifications
		Please.$apply()

		// @TODO: replace with css animations?
		$(document).on('click', '.notice .close', event => {
			event.preventDefault()
			$('.notice').slideToggle(150)
		})
	})
})
