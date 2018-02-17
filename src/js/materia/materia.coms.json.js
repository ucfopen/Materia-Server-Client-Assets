/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Coms').Json = (function() {
	let _gatewayURL = null;

	const setGateway = newGateway => _gatewayURL = newGateway;

	const send = function(method, args, callback, ignoreError) {
		if (_gatewayURL == null) { _gatewayURL = API_LINK; }
		if ((callback == null)) { callback = $.noop(); }
		if ((args == null)) { args = []; }

		// prepare the callback interrupt
		const callbackInterrupt = function(data) {
			// show errors if they exist
			if ((ignoreError != null) && (data != null) && (data.msg != null) && (data.title != null) && (data.type != null)) {
				_showError(data);
			}
			// continue to original callback
			if (callback != null) { return callback(data); }
		};

		// send the request
		return $.post(_gatewayURL+method+"/", {data:JSON.stringify(args)}, callbackInterrupt, 'json');
	};

	const get = (url, callback, ignoreError) => _sendRequest('GET', url, null, callback, ignoreError);

	const post = function(url, dataObject, callback, ignoreError) {
		if ((dataObject == null)) { dataObject = {}; }
		return _sendRequest('POST', url, JSON.stringify(dataObject), callback, ignoreError);
	};

	var _sendRequest = function(method, url, dataString, callback, ignoreError) {
		if (_gatewayURL == null) { _gatewayURL = API_LINK; }
		if ((callback == null)) { callback = new Function(); }

		// prepare the callback interrupt
		const resposeErrorChecker = function(data) {
			// show errors if they exist
			if ((ignoreError != null) && (data != null) && (data.msg != null) && (data.title != null) && (data.type != null)) {
				_showError(data);
			}
			// continue to original callback
			if (callback != null) { return callback(data); }
		};

		const req = new XMLHttpRequest();
		req.onreadystatechange = function() {
			if (req.readyState === XMLHttpRequest.DONE) {
				if (req.status === 200) {
					resposeErrorChecker(JSON.parse(req.responseText));
				}
				if (req.status === 204) {
					return resposeErrorChecker(null);
				}
			}
		};

		req.open(method, url);
		req.setRequestHeader('Accept', 'application/json;');
		req.setRequestHeader('Content-type','application/json; charset=utf-8');
		return req.send(dataString);
	};

	var _showError = function(data) {
		if (data.title === 'Invalid Login') {
			// redirect to login page
			return window.location = BASE_URL+"login";
		}
	};

	// return true if jsonResult is an error object
	const isError = jsonResult => (jsonResult != null) && (typeof jsonResult.errorID !== 'undefined');

	// public methods
	return {
		send,
		isError,
		post,
		get,
		setGateway
	};
})();
