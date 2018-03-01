const app = angular.module('materia')
app.service('adminSrv', function() {
	// @TODO: upgrade to use $q
	const getWidgets = callback => {
		Materia.Coms.Json.get('/api/admin/widgets').then(callback)
	}

	const saveWidget = (widget, callback) => {
		Materia.Coms.Json.post(`/api/admin/widget/${widget.id}`, widget).then(callback)
	}

	const searchUsers = (str, callback) => {
		Materia.Coms.Json.get(`/api/admin/user_search/${str}`).then(callback)
	}

	const lookupUser = (userId, callback) => {
		Materia.Coms.Json.get(`/api/admin/user/${userId}`).then(callback)
	}

	const saveUser = (obj, callback) => {
		Materia.Coms.Json.post(`/api/admin/user/${obj.id}`, obj).then(callback)
	}

	return {
		getWidgets,
		saveWidget,
		searchUsers,
		lookupUser,
		saveUser
	}
})
