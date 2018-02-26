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
const app = angular.module('materia')
app.controller('adminUserController', function($scope, $window, adminSrv, userServ) {
	let lastSearch = ''

	let _sortNames = (userA, userB) => {
		const nameA = `${userA.first} ${userA.last}`
		const nameB = `${userB.first} ${userB.last}`
		return nameA.localeCompare(nameB)
	}

	let _getIconUrls = instances => {
		instances.forEach(i => {
			i.icon = Materia.Image.iconUrl(i.widget.dir, 60)
		})
	}

	let _processPlayed = instances => {
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

	let search = nameOrFragment => {
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
			$scope.$apply()
		})
	}

	let searchMatchClick = user =>
		adminSrv.lookupUser(user.id, data => {
			$scope.inputs.userSearchInput = ''
			$scope.selectedUser = user
			$scope.additionalData = data
			_getIconUrls(data.instances_available)
			data.instances_played = _processPlayed(data.instances_played)
			$scope.$apply()
		})

	let save = () => {
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
			$scope.$apply()
		})
	}

	let deselectUser = () => {
		$scope.errorMessage = []
		$scope.selectedUser = null
		$scope.additionalData = null
	}

	// Expose on scope
	deselectUser()
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
	$scope.$watch('inputs.userSearchInput', input => $scope.search(input))
})
