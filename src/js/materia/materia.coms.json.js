Namespace('Materia.Coms').Json = do ->
	_gatewayURL = null

	setGateway = (newGateway) ->
		_gatewayURL = newGateway

	send = (method, args, callback, ignoreError) ->
		unless _gatewayURL? then _gatewayURL = API_LINK
		callback = $.noop() if !callback?
		args = [] if !args?

		# prepare the callback interrupt
		callbackInterrupt = (data) ->
			# show errors if they exist
			if ignoreError? && data? && data.msg? && data.title? && data.type?
				_showError data
			# continue to original callback
			callback data if callback?

		# send the request
		$.post(_gatewayURL+method+"/", {data:JSON.stringify(args)}, callbackInterrupt, 'json')

	get = (url, callback, ignoreError) ->
		_sendRequest('GET', url, null, callback, ignoreError)

	post = (url, dataObject, callback, ignoreError) ->
		dataObject = {} if !dataObject?
		_sendRequest('POST', url, JSON.stringify(dataObject), callback, ignoreError)

	_sendRequest = (method, url, dataString, callback, ignoreError) ->
		unless _gatewayURL? then _gatewayURL = API_LINK
		callback = new Function() if !callback?

		# prepare the callback interrupt
		resposeErrorChecker = (data) ->
			# show errors if they exist
			if ignoreError? && data? && data.msg? && data.title? && data.type?
				_showError data
			# continue to original callback
			callback data if callback?

		req = new XMLHttpRequest()
		req.onreadystatechange = ->
			if req.readyState == XMLHttpRequest.DONE
				if req.status == 200
					resposeErrorChecker JSON.parse(req.responseText)
				if req.status == 204
					resposeErrorChecker null

		req.open method, url
		req.setRequestHeader 'Accept', 'application/json;'
		req.setRequestHeader 'Content-type','application/json; charset=utf-8'
		req.send(dataString)

	_showError = (data) ->
		if data.title == 'Invalid Login'
			# redirect to login page
			window.location = BASE_URL+"login"

	# return true if jsonResult is an error object
	isError = (jsonResult) ->
		jsonResult? && typeof jsonResult.errorID != 'undefined'

	# public methods
	send:send
	isError: isError
	post:post
	get:get
	setGateway:setGateway
