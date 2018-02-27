// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').User = (function() {
	let currentUser = null

	const getCurrentUser = callback => {
		if (currentUser != null) {
			callback(currentUser)
		} else {
			// if we are unable to retrieve it then we need to pull it from the server:
			Materia.Coms.Json.send('user_get', null).then(user => {
				currentUser = user
				callback(currentUser)
			})
		}
	}

	return { getCurrentUser }
})()
