// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// TODO: rip out redundant methods
const app = angular.module('materia');
app.service('userServ', function($q, $rootScope) {

	let _me = null;

	const buildUser = function(name, avatar, loggedIn, role, notify) {
		if (name == null) { name = ''; }
		if (avatar == null) { avatar = ''; }
		if (loggedIn == null) { loggedIn = false; }
		if (role == null) { role = 'Student'; }
		if (notify == null) { notify = false; }
		return {
			name,
			avatar,
			loggedIn,
			role,
			notify
		};
	};

	const getCurrentUserFromDom = function() {
		const user = document.getElementById('current-user');
		const userData = {
			name: user.getAttribute("data-name"),
			avatar: user.getAttribute("data-avatar"),
			loggedIn: user.getAttribute("data-logged-in"),
			role: user.getAttribute("data-role"),
			notify: user.getAttribute("data-notify")
		};
		return buildUser(userData.name, userData.avatar, userData.loggedIn === 'true', userData.role, userData.notify === 'true');
	};

	const getAvatar = function(user, size) {
		if (size == null) { size = 24; }
		return user.avatar.replace(/s=\d+/, `s=${size}`).replace(/size=\d+x\d+/, `size=${size}x${size}`);
	};

	const getCurrentUserFromAPI = callback => Materia.User.getCurrentUser(function(user) {});

	const updateSettings = (property, value) => _me[property] = value;

	const getCurrentUser = from => {
		if (from == null) { from = 'dom'; }
		if ((_me == null)) {
			switch (from) {
				case 'dom':
					_me = getCurrentUserFromDom();
					break;
				default:
					_me = buildUser();
			}
		}
		return _me;
	};

	const getCurrentUserAvatar = function(size) {
		if (size == null) { size = 24; }
		return getAvatar(_me, size);
	};

	let _user = null;

	const get = function() {
		const deferred = $q.defer();

		if (!_user) {
			deferred.resolve(grabCurrentUser());
		} else {
			deferred.resolve(_user);
		}

		return deferred.promise;
	};

	const set = function(userToSet) {
		_user = userToSet;
		return $rootScope.$broadcast('user.update');
	};

	var grabCurrentUser = () =>
		Materia.User.getCurrentUser(function(user) {
			set(user);
			return user;
		})
	;

	const checkValidSession = function(role) {
		const deferred = $q.defer();

		Materia.Coms.Json.send('session_author_verify', [role], data => deferred.resolve(data));

		return deferred.promise;
	};


	// return public method references
	return {
		getCurrentUser,
		getCurrentUserAvatar,
		getAvatar,
		updateSettings,
		get,
		set,
		grabCurrentUser,
		checkValidSession
	};
});

