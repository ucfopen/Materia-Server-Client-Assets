const app = angular.module('materia')
app.service('userServ', function($q, $rootScope) {
	let _me = null

	const buildUser = function(name, avatar, loggedIn, role, notify) {
		if (name == null) {
			name = ''
		}
		if (avatar == null) {
			avatar = ''
		}
		if (loggedIn == null) {
			loggedIn = false
		}
		if (role == null) {
			role = 'Student'
		}
		if (notify == null) {
			notify = false
		}
		return {
			name,
			avatar,
			loggedIn,
			role,
			notify
		}
	}

	const getCurrentUserFromDom = function() {
		const user = document.getElementById('current-user')
		const userData = {
			name: user.getAttribute('data-name'),
			avatar: user.getAttribute('data-avatar'),
			loggedIn: user.getAttribute('data-logged-in'),
			role: user.getAttribute('data-role'),
			notify: user.getAttribute('data-notify')
		}
		return buildUser(
			userData.name,
			userData.avatar,
			userData.loggedIn === 'true',
			userData.role,
			userData.notify === 'true'
		)
	}

	const getAvatar = function(user, size) {
		if (size == null) {
			size = 24
		}
		return user.avatar.replace(/s=\d+/, `s=${size}`).replace(/size=\d+x\d+/, `size=${size}x${size}`)
	}

	const updateSettings = (property, value) => (_me[property] = value)

	const getCurrentUser = from => {
		if (from == null) {
			from = 'dom'
		}
		if (_me == null) {
			switch (from) {
				case 'dom':
					_me = getCurrentUserFromDom()
					break
				default:
					_me = buildUser()
			}
		}
		return _me
	}

	const getCurrentUserAvatar = function(size) {
		if (size == null) {
			size = 24
		}
		return getAvatar(_me, size)
	}

	const get = function() {
		const deferred = $q.defer()

		if (!_me) {
			deferred.resolve(_getCurrentUserFromAPI())
		} else {
			deferred.resolve(_me)
		}

		return deferred.promise
	}

	const set = function(userToSet) {
		_me = userToSet
		return $rootScope.$broadcast('user.update')
	}

	// @TODO this needs to return a promise
	var _getCurrentUserFromAPI = () => {
		const deferred = $q.defer()

		Materia.User.getCurrentUser(user => {
			set(user)
			deferred.resolve(_me)
		})

		return deferred.promise
	}

	const checkValidSession = function(role) {
		const deferred = $q.defer()

		Materia.Coms.Json.send('session_author_verify', [role], data => {
			deferred.resolve(data)
		})

		return deferred.promise
	}

	// return public method references
	return {
		getCurrentUser,
		getCurrentUserAvatar,
		getAvatar,
		updateSettings,
		get,
		set,
		checkValidSession
	}
})
