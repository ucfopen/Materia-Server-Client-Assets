const app = angular.module('materia')
app.controller('adminUserController', function(Please, $scope, $window, adminSrv, userServ) {
	let lastSearch = ''

	const _sortNames = (userA, userB) => {
		const nameA = `${userA.first} ${userA.last}`
		const nameB = `${userB.first} ${userB.last}`
		return nameA.localeCompare(nameB)
	}

	const _getIconUrls = instances => {
		instances.forEach(i => {
			i.icon = Materia.Image.iconUrl(i.widget.dir, 60)
		})
	}

	const _processPlayed = instances => {
		const _pre = []

		for (let play of instances) {
			if (!_pre[play.id]) {
				_pre[play.id] = {
					id: play.id,
					name: play.name,
					widget: play.widget,
					icon: Materia.Image.iconUrl(play.widget.dir, 60),
					plays: []
				}
			}
			_pre[play.id].plays.push(play)
		}

		return Object.values(_pre)
	}

	const search = nameOrFragment => {
		if (nameOrFragment === lastSearch) {
			return
		}

		lastSearch = nameOrFragment

		if (nameOrFragment === '') {
			$scope.searchResults.show = false
			$scope.searchResults.none = true
			$scope.searchResults.matches = []
			return
		}

		$scope.searchResults.show = true
		$scope.searchResults.searching = true

		const inputArray = nameOrFragment.split(',')
		nameOrFragment = inputArray[inputArray.length - 1]

		adminSrv.searchUsers(nameOrFragment, result => {
			$scope.searchResults.searching = false
			if (result && result.halt) {
				alert(result.msg)
				$window.location.reload(true)
				return
			}

			let matches = []
			if (result.length) {
				matches = result
			}

			matches.forEach(user => {
				user.gravatar = userServ.getAvatar(user, 50)
			})

			matches = matches.sort(_sortNames)

			$scope.searchResults.none = matches.length < 1
			$scope.searchResults.matches = matches
			Please.$apply()
		})
	}

	const searchMatchClick = user =>
		adminSrv.lookupUser(user.id, data => {
			$scope.inputs.userSearchInput = ''
			$scope.selectedUser = user
			$scope.additionalData = data
			_getIconUrls(data.instances_available)
			data.instances_played = _processPlayed(data.instances_played)
			Please.$apply()
		})

	const save = () => {
		let u = $scope.selectedUser
		const update = {
			id: u.id,
			email: u.email,
			is_student: u.is_student === 'true' || u.is_student === true,
			notify: u.profile_fields.notify,
			useGravatar: u.profile_fields.useGravatar === 'true' || u.profile_fields.useGravatar === true
		}

		adminSrv.saveUser(update, response => {
			let errors = []
			for (let prop in response) {
				const stat = response[prop]
				if (stat !== true) {
					errors.push(stat)
				}
			}
			if (errors.length != 0) $scope.errorMessage = errors
			Please.$apply()
		})
	}

	const deselectUser = () => {
		$scope.errorMessage = []
		$scope.selectedUser = null
		$scope.additionalData = null
	}

	// Expose on scope
	$scope.inputs = { userSearchInput: '' }
	$scope.searchResults = {
		none: true,
		show: false,
		searching: false,
		matches: []
	}
	$scope.deselectUser = deselectUser
	$scope.save = save
	$scope.searchMatchClick = searchMatchClick
	$scope.search = search

	// initialize
	deselectUser()
	$scope.$watch('inputs.userSearchInput', input => $scope.search(input))
})
