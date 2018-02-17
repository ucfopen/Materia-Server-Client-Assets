// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').User = (function() {
	let currentUser = null;

	const getCurrentUser = function(callback) {
		if (currentUser != null) {
			return callback(currentUser);
		} else {
			// if we are unable to retrieve it then we need to pull it from the server:
			return Materia.Coms.Json.send('user_get', null, function(user) {
				currentUser = user;
				return callback(currentUser);
			});
		}
	};

	return {getCurrentUser};
})();