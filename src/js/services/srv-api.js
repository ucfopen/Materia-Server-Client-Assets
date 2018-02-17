/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.service('apiServ', function() {
	const gatewayURL = API_LINK;

	const filterError = function(data) {
		if ((data != null) && (data.msg != null) && (data.title != null) && (data.type != null)) { return showErorr(data); }
	};

	var showErorr = function(data) {
		if (data.title === 'Invalid Login') {
			// redirect to login page
			return window.location = BASE_URL+"login";
		}
	};

	// public methods
	return {
		showErorr,
		filterError
	};
});
