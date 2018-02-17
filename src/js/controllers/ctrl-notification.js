// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('notificationCtrl', function($scope, $sce) {
	$scope.values =
		{notifications: []};
	$scope.clicked = false;

	Materia.Coms.Json.send('notifications_get', null, function(notifications) {
		$scope.values.notifications = notifications;
		$scope.$apply();

		// @TODO: replace with css animations?
		$(document).on('click', '.notice .close', function(event) {
			event.preventDefault();
			return $('.notice').slideToggle(150);
		});

		return false;
	});

	$scope.trust = notification => $sce.trustAsHtml(notification);

	$scope.clickNotification = function() {
		if ($scope.clicked) {
			$('#notices').slideUp(function() {
				$('#notifications_link').removeClass('selected');
				if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
					$('#swfplaceholder').hide();
					return $('object').css('visibility', 'visible');
				}
			});
		} else {
			const $object = $('object');
			if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
				if ($('#swfplaceholder').length > 0) { $('#swfplaceholder').show(); }
				$object.css('visibility', 'hidden');
			}
			$('#notifications_link').addClass('selected');
			$('#notifications_link').show();
			$('#notices').children().fadeIn();
			$('#notices').slideDown(function() {});
		}
		return $scope.clicked = !$scope.clicked;
	};

	return $scope.removeNotification = function(index) {
		Materia.Coms.Json.send('notification_delete', [$scope.values.notifications[index].id]);
		return $scope.values.notifications.splice(index, 1);
	};
});
