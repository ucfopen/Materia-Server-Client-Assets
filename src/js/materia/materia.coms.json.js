// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Coms').Json = (function() {
	let _gatewayURL = null

	const setGateway = newGateway => (_gatewayURL = newGateway)

	// prepare the callback interrupt
	const _resposeErrorChecker = (data, callback, ignoreError) => {
		// show errors if they exist
		if (
			ignoreError != null &&
			data != null &&
			data.msg != null &&
			data.title != null &&
			data.type != null
		) {
			_showError(data)
		}
		// continue to original callback
		if (callback != null) callback(data)
	}

	const _sendRequest = (method, url, body, callback, ignoreError) => {
		if (callback == null) {
			callback = new Function()
		}

		const options = {
			method,
			body,
			credentials: 'same-origin',
			cache: 'no-cache',
			headers: {
				accept: 'application/json;',
				'content-type': 'application/json; charset=utf-8'
			}
		}

		fetch(url, options)
			.then(res => res.json())
			.then(json => {
				_resposeErrorChecker(json, callback, ignoreError)
			})
			.catch(error => {
				_showError('Error Sending request to ' + url)
			})
	}

	// older api, calls callback AND returns a promise
	const send = (method, args, callback, ignoreError) => {
		// find a deferred object from angular or jquery
		// &TODO: remove the jquery version one day
		let deferred
		let promise
		if (angular) {
			var $injector = angular.injector(['ng'])
			$injector.invoke(function($q) {
				deferred = $q.defer()
				promise = deferred.promise
				promise.fail = promise.catch // emulate jquery's promise.fail()
			})
		} else {
			deferred = $.Deferred()
			promise = deferred.promise()
		}

		if (_gatewayURL == null) {
			_gatewayURL = API_LINK
		}
		if (callback == null) {
			callback = new Function()
		}
		if (args == null) {
			args = []
		}

		let formData = new FormData()
		formData.append('data', JSON.stringify(args))
		// returns deferred
		fetch(_gatewayURL + method + '/', {
			method: 'POST',
			credentials: 'same-origin',
			cache: 'no-cache',
			body: formData
		})
			.then(res => res.text())
			.then(body => {
				if (body) body = JSON.parse(body)
				_resposeErrorChecker(body, callback, ignoreError)
				deferred.resolve(body)
			})
			.catch(error => {
				deferred.reject(error)
			})

		return promise
	}

	// newer XMLHttpRequest json api
	const get = (url, callback, ignoreError) => {
		_sendRequest('GET', url, null, callback, ignoreError)
	}

	// newer XMLHttpRequest json api
	const post = function(url, dataObject, callback, ignoreError) {
		if (dataObject == null) {
			dataObject = {}
		}
		_sendRequest('POST', url, JSON.stringify(dataObject), callback, ignoreError)
	}

	const _showError = data => {
		if (data.title === 'Invalid Login') {
			// redirect to login page
			return (window.location = BASE_URL + 'login')
		}
	}

	// return true if jsonResult is an error object
	const isError = jsonResult => jsonResult != null && typeof jsonResult.errorID !== 'undefined'

	// public methods
	return {
		send,
		isError,
		post,
		get,
		setGateway
	}
})()
