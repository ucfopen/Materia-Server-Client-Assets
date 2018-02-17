/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The collaboration modal on the My Widgets page
const app = angular.module('materia');
app.controller('CollaborationController', function($scope, $timeout, selectedWidgetSrv, widgetSrv, userServ, ACCESS, OBJECT_TYPES, Alert) {

	$scope.alert = Alert;

	// make these constants available to the page so we populate dropdowns with the correct values
	$scope.ACCESS = {
		VISIBLE: ACCESS.VISIBLE,
		FULL: ACCESS.FULL
	};

	const LEFT = 37;
	const UP = 38;
	const RIGHT = 39;
	const DOWN = 40;
	const ESC = 27;

	let lastSearch = '';
	$scope.inputs =
		{userSearchInput: ''};
	$scope.searchResults = {
		show: false,
		searching: false,
		matches: []
	};

	$scope.$watch('inputs.userSearchInput', input => $scope.search(input));

	$scope.search = function(nameOrFragment) {

		if (nameOrFragment === lastSearch) { return; }

		if (nameOrFragment === "") {
			$scope.searchResults.show = false;
			$scope.searchResults.matches = [];
			lastSearch = "";
			return;
		}

		lastSearch = nameOrFragment;

		$scope.searchResults.show = true;
		$scope.searchResults.searching = true;

		const inputArray = nameOrFragment.split(',');
		nameOrFragment = inputArray[inputArray.length - 1];

		return Materia.Coms.Json.send('users_search', [nameOrFragment], function(matches) {
			if (matches != null ? matches.halt : undefined) {
				$scope.alert.msg = matches.msg;
				$scope.alert.fatal = true;
				$scope.$apply();
				return;
			}

			$scope.searchResults.searching = false;

			if (!matches || ((matches != null ? matches.length : undefined) < 1)) {
				matches = [];
			}

			$scope.searchResults.none = matches.length < 1;

			for (let user of Array.from(matches)) {
				user.gravatar = userServ.getAvatar(user, 50);
			}

			matches = matches.sort(sortNames);

			$scope.selectedMatch = matches[0];
			$scope.selectedIndex = 0;
			$scope.searchResults.matches = matches;
			return $scope.$apply();
		});
	};

	var sortNames = function(userA, userB) {
		const nameA = userA.first + " " + userA.last;
		const nameB = userB.first + " " + userB.last;
		return nameA.localeCompare(nameB);
	};

	$scope.searchKeyDown = function(event) {
		switch (event.which) {
			case RIGHT:
				$scope.selectedIndex++;
				break;
			case LEFT:
				$scope.selectedIndex--;
				break;
			case DOWN:
				$scope.selectedIndex += 2;
				break;
			case UP:
				$scope.selectedIndex -= 2;
				break;
			case ESC:
				$scope.searchResults.show = false;
				return;
				break;
			default:
				return;
		}

		if ($scope.selectedIndex < 0) { $scope.selectedIndex = 0; }
		if ($scope.selectedIndex > ($scope.searchResults.matches.length - 1)) { $scope.selectedIndex = $scope.searchResults.matches.length - 1; }

		$scope.selectedMatch = $scope.searchResults.matches[$scope.selectedIndex];

		// Scroll the search list so the selected match is always within view when navigating with arrow keys
		// Placed within a $timeout so logic is done only after the changes are made to the DOM
		return $timeout(function() {
			const selectedMatchHtml = document.getElementsByClassName("focused")[0];
			const searchListHtml = document.getElementsByClassName("search_list")[0];

			if (selectedMatchHtml.getBoundingClientRect().bottom > searchListHtml.getBoundingClientRect().bottom) {
				return searchListHtml.scrollTop += selectedMatchHtml.offsetHeight + 5;

			} else if (selectedMatchHtml.getBoundingClientRect().top < searchListHtml.getBoundingClientRect().top) {
				return searchListHtml.scrollTop -= selectedMatchHtml.offsetHeight + 5;
			}
		});
	};

	$scope.searchMatchClick = function(user) {
		if (!user) { return; }
		if ($scope.searchResults.matches.indexOf(user) === -1) { return; }
		$scope.inputs.userSearchInput = '';

		if (($scope.selected.widget.guest_access === false) && user.is_student) {
			$scope.alert.msg = 'Students can not be given access to this widget unless Guest Mode is enabled!';
			$scope.alert.title = 'Unable to share with student';
			$scope.alert.fatal = false;
			return;
		}

		$scope.searchResults.show = false;
		$scope.searchResults.matches = [];

		// Do not add duplicates
		if (!$scope.perms.collaborators) { $scope.perms.collaborators = []; }
		for (let existing_user of Array.from($scope.perms.collaborators)) {
			if (user.id === existing_user.id) {
				if (existing_user.remove) { existing_user.remove = false; }
				return;
			}
		}

		$scope.perms.collaborators.push({
			id: user.id,
			is_student: user.is_student,
			isCurrentUser: user.isCurrentUser,
			expires: null,
			expiresText: "Never",
			first: user.first,
			last: user.last,
			gravatar: user.gravatar,
			access: ACCESS.VISIBLE
		});

		return setTimeout(() => $scope.$parent.setupPickers()
		, 1);
	};

	$scope.removeAccess = function(user) {
		user.remove = true;
		return $scope.checkForWarning(user);
	};

	$scope.updatePermissions = function() {
		let remove_widget = false;
		const widget_id     = $scope.selected.widget.id;
		const permObj       = [];
		const user_ids      = {};
		const students  = [];

		for (let user of Array.from($scope.perms.collaborators)) {
			if (user.is_student) { students.push(user); }
			// Do not allow saving if a demotion dialog is on the screen
			if (user.warning) { return; }

			// If we only have self-demotion access, don't send more info to server
			// or else we'll get a perm error
			if (!$scope.selected.shareable && !user.isCurrentUser) { continue; }

			if (!remove_widget) { remove_widget = (user.isCurrentUser && user.remove); }

			const access = {};
			access[user.access] = !user.remove;

			if (!user.remove) {
				user_ids[user.id] = [user.access, user.expires];
			}

			permObj.push({
				user_id: user.id,
				expiration: user.expires,
				perms: access
			});
		}

		$scope.perms.widget = user_ids;
		return Materia.Coms.Json.send('permissions_set', [OBJECT_TYPES.WIDGET_INSTANCE, widget_id, permObj], function(returnData) {
			if (returnData === true) {
				$scope.$emit('collaborators.update', '');
				$scope.show.collaborationModal = false;
				if (remove_widget) { widgetSrv.removeWidget(widget_id); }
				if (students.length > 0) { $scope.selected.widget.student_access = true; }
			} else {
				$scope.alert.msg = (((returnData != null ? returnData.msg : undefined) != null) ? returnData.msg : 'There was an unknown error saving your changes.');
				if ((returnData != null ? returnData.halt : undefined) != null) { $scope.alert.fatal = true; }
			}

			return $scope.$apply();
		});
	};

	$scope.checkForWarning = function(user) {
		if (user.isCurrentUser && (user.access <= ACCESS.FULL)) {
			return user.warning = true;
		}
	};

	return $scope.cancelDemote = function(user) {
		user.warning = false;
		user.remove = false;
		return user.access = ACCESS.FULL;
	};
});
