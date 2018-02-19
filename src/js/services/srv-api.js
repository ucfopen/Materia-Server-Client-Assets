const app = angular.module('materia')
app.service('apiServ', () => {
	const gatewayURL = API_LINK

	const filterError = data => {
		if (data != null && data.msg != null && data.title != null && data.type != null) {
			showErorr(data)
		}
	}

	var showErorr = data => {
		if (data.title === 'Invalid Login') {
			// redirect to login page
			window.location = BASE_URL + 'login'
		}
	}

	// public methods
	return {
		showErorr,
		filterError
	}
})
