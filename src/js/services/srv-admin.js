const app = angular.module('materia')
app.service('adminSrv', function() {
	const getWidgets = callback => {
		Materia.Coms.Json.get('/api/admin/widgets', callback)
	}

	const saveWidget = (widget, callback) => {
		Materia.Coms.Json.post(`/api/admin/widget/${widget.id}`, widget, callback)
	}

	const searchUsers = (str, callback) => {
		Materia.Coms.Json.get(`/api/admin/user_search/${str}`, callback)
	}

	const lookupUser = (userId, callback) => {
		Materia.Coms.Json.get(`/api/admin/user/${userId}`, callback)
	}

	const saveUser = (obj, callback) => {
		Materia.Coms.Json.post(`/api/admin/user/${obj.id}`, obj, callback)
	}

	return {
		getWidgets,
		saveWidget,
		searchUsers,
		lookupUser,
		saveUser
	}
})
