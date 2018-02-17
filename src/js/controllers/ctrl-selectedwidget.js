/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Handles the widget currently selected (on the big screeny thing)
const app = angular.module('materia');
app.controller('SelectedWidgetController', function($scope, $q, widgetSrv,selectedWidgetSrv, userServ, $anchorScroll, ACCESS, Alert) {

	let getExpiresText;
	$scope.alert = Alert;

	// Displays a no-access message when attempting to access a widget without sharing permissions.
	$scope.$on('selectedWidget.notifyAccessDenied', function() {
		$scope.perms.error = true;
		return $scope.$apply();
	});

	$scope.popup = function() {
		if ($scope.selected.shareable && !$scope.selected.widget.is_draft) {
			return $scope.show.availabilityModal = true;
		}
	};

	$scope.hideModal = function() { return this.$parent.hideModal(); };

	$scope.exportPopup =  function() {
		// Do not show modal disabled
		$scope.show.exportModal = true;
		return Materia.MyWidgets.Csv.buildPopup();
	};

	$scope.copyWidget = () =>
		Materia.MyWidgets.Tasks.copyWidget($scope.selected.widget.id, $scope.selected.copy_title, function(inst_id) {
			$scope.show.copyModal = false;
			widgetSrv.addWidget(inst_id);
			return $scope.$apply();
		})
	;

	$scope.deleteWidget = () =>
		Materia.MyWidgets.Tasks.deleteWidget($scope.selected.widget.id, function(results) {
			if (results) {
				$scope.show.deleteDialog = false;
				widgetSrv.removeWidget($scope.selected.widget.id);
				return $scope.$apply();
			}
		})
	;

	$scope.editWidget = function() {
		if ($scope.selected.editable) {
			Materia.Coms.Json.send('widget_instance_lock',[$scope.selected.widget.id], function(success) {
				if (success) {
					if ($scope.selected.widget.is_draft) {
						window.location = $scope.selected.edit;
					} else {
						$scope.show.editPublishedWarning = true;
					}
				} else {
					$scope.alert.msg = 'This widget is currently locked, you will be able to edit this widget when it is no longer being edited by somebody else.';
				}
				return $scope.$apply();
			});
		}

		return false;
	};

	$scope.getEmbedLink = function() {
		if ($scope.selected.widget === null) { return ""; }

		const width = String($scope.selected.widget.widget.width) !== '0' ?  $scope.selected.widget.widget.width : 800;
		const height = String($scope.selected.widget.widget.height) !== '0' ? $scope.selected.widget.widget.height : 600;
		const draft = $scope.selected.widget.is_draft ? `${$scope.selected.widget.widget.name} Widget` : $scope.selected.widget.name;

		return `<iframe src='${BASE_URL}embed/${$scope.selected.widget.id}/${$scope.selected.widget.clean_name}' width='${width}' height='${height}' style='margin:0;padding:0;border:0;'></iframe>`;
	};

	$scope.enableOlderScores = () => $scope.show.olderScores = true;

	$scope.showCopyDialog = function() {
		if ($scope.selected.accessLevel !== ACCESS.VISIBLE) { return $scope.show.copyModal = true; }
	};

	$scope.showDelete = function() {
		if ($scope.selected.accessLevel !== ACCESS.VISIBLE) { return $scope.show.deleteDialog = !$scope.show.deleteDialog; }
	};

	$scope.showCollaboration = function() {
		const user_ids = [];
		for (var user in $scope.perms.widget) { user_ids.push(user); }

		if ($scope.perms.stale) { return; }

		$scope.perms.collaborators = [];
		$scope.show.collaborationModal = true;

		return Materia.Coms.Json.send('user_get', [user_ids], function(users) {
			$scope.studentAccessible = false;

			if (users.length != null) {
				// sort the users
				users.sort(function(a,b) {
					if((a.first < b.first) || ((a.first === b.first) && (a.last < b.last)) || ((a.last === b.last) && (a.middle < b.middle))) {
						return -1;
					}
					return 1;
				});

				// setup each user
				for (user of Array.from(users)) {
					if (user.is_student) { $scope.studentAccessible = true; }
					user.access = $scope.perms.widget[user.id][0];
					const timestamp = parseInt($scope.perms.widget[user.id][1], 10);
					user.expires = timestamp;
					user.expiresText = getExpiresText(timestamp);
					user.gravatar = userServ.getAvatar(user, 50);
				}

				$scope.perms.collaborators = users;
			}

			$scope.$apply();
			return $scope.setupPickers();
		});
	};

	$scope.setupPickers = () =>
		// fill in the expiration link text & setup click event
		Array.from($scope.perms.collaborators).map((user) =>
			(function(user) {
				return $(`.exp-date.user${user.id}`).datepicker({
					minDate: getDateForBeginningOfTomorrow(),
					onSelect(dateText, inst) {
						const timestamp = $(this).datepicker('getDate').getTime() / 1000;
						user.expires = timestamp;
						user.expiresText = getExpiresText(timestamp);
						return $scope.$apply();
					}
				});
			})(user))
	;

	$scope.removeExpires = function(user) {
		user.expires = null;
		return user.expiresText = getExpiresText(user.expires);
	};

	var getDateForBeginningOfTomorrow = function() {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return new Date(d.getFullYear(), d.getMonth(), d.getDate());
	};

	return getExpiresText = function(timestamp) {
		timestamp = parseInt(timestamp, 10);
		if (isNaN(timestamp) || (timestamp === 0)) { return 'Never'; } else { return $.datepicker.formatDate('mm/dd/yy', new Date(timestamp * 1000)); }
	};
});

