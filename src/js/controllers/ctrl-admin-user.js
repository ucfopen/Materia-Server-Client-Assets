/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('adminUserController', function($scope, adminSrv, userServ) {

	let lastSearch = '';
	$scope.inputs =
		{userSearchInput: ''};
	$scope.searchResults = {
		show: false,
		searching: false,
		matches: []
	};

	$scope.$watch('inputs.userSearchInput', input => $scope.search(input));

	$scope.selectedUser = null;
	$scope.additionalData = null;
	$scope.errorMessage = [];

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

		return adminSrv.searchUsers(nameOrFragment, function(matches) {
			if (matches != null ? matches.halt : undefined) {
				alert(matches.msg);
				location.reload(true);
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

			matches = matches.sort(_sortNames);

			$scope.searchResults.matches = matches;
			return $scope.$apply();
		});
	};

	var _sortNames = function(userA, userB) {
		const nameA = userA.first + " " + userA.last;
		const nameB = userB.first + " " + userB.last;
		return nameA.localeCompare(nameB);
	};

	$scope.searchMatchClick = user =>
		adminSrv.lookupUser(user.id, function(data) {
			$scope.inputs.userSearchInput = '';
			$scope.selectedUser = user;
			$scope.additionalData = data;

			_processAvailable();
			_processPlayed();

			return $scope.$apply();
		})
	;

	var _processAvailable = () =>
		Array.from($scope.additionalData.instances_available).map((instance) =>
			(instance.icon = Materia.Image.iconUrl(instance.widget.dir, 60)))
	;

	var _processPlayed = function() {
		const _pre = [];

		for (let play of Array.from($scope.additionalData.instances_played)) {
			if (!_pre[play.id]) {
				_pre[play.id] = {
					id: play.id,
					name: play.name,
					widget: play.widget,
					icon: Materia.Image.iconUrl(play.widget.dir, 60),
					plays: []
				};
			}
			_pre[play.id].plays.push(play);
		}

		$scope.additionalData.instances_played = [];
		return (() => {
			const result = [];
			for (let id in _pre) {
				const item = _pre[id];
				result.push($scope.additionalData.instances_played.push(item));
			}
			return result;
		})();
	};

	$scope.save = function() {
		const update = {
			id: $scope.selectedUser.id,
			email: $scope.selectedUser.email,
			is_student: (($scope.selectedUser.is_student === 'true') || ($scope.selectedUser.is_student === true)),
			notify: $scope.selectedUser.profile_fields.notify,
			useGravatar: (($scope.selectedUser.profile_fields.useGravatar === 'true') || ($scope.selectedUser.profile_fields.useGravatar === true))
		};
		return adminSrv.saveUser(update, function(response) {
			$scope.errorMessage = [];
			for (let prop in response) {
				const stat = response[prop];
				if (stat !== true) { $scope.errorMessage.push(stat); }
			}
			if ($scope.errorMessage.len === 0) { delete $scope.errorMessage; }
			return $scope.$apply();
		});
	};

	return $scope.deselectUser = function() {
		$scope.errorMessage = [];
		$scope.selectedUser = null;
		return $scope.additionalData = null;
	};
});
