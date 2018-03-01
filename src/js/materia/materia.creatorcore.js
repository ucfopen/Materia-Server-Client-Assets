Namespace('Materia').CreatorCore = (() => {
	let _baseurl = null
	let _creatorClass = null
	let _lastHeight = -1
	let _mediaUrl = null
	let _resizeInterval = null

	const PRESANITIZE_CHARACTERS = {
		'>': '',
		'<': ''
	}

	const _onPostMessage = e => {
		const msg = JSON.parse(e.data)
		switch (msg.type) {
			case 'initNewWidget':
				_initNewWidget(msg.data[0], msg.data[1], msg.data[2], msg.data[3])
			case 'initExistingWidget':
				_initExistingWidget(
					msg.data[0],
					msg.data[1],
					msg.data[2],
					msg.data[3],
					msg.data[4],
					msg.data[5],
					msg.data[6]
				)
			case 'onRequestSave':
				_tellCreator('onSaveClicked', [msg.data[0]])
			case 'onSaveComplete':
				_tellCreator('onSaveComplete', [msg.data[0], msg.data[1], msg.data[2], msg.data[3]])
			case 'onMediaImportComplete':
				_tellCreator('onMediaImportComplete', [msg.data[0]])
			case 'onQuestionImportComplete':
				_tellCreator('onQuestionImportComplete', [msg.data[0]])
			default:
				alert(`Error, unknown message sent to creator core: ${msg.type}`)
		}
	}

	const _tellCreator = (method, args) => {
		if (typeof _creatorClass[method] === 'function') {
			_creatorClass[method].apply(undefined, args)
		} else {
			alert(`Error, missing creator ${method} called.`)
		}
	}

	const _sendPostMessage = (type, data) => parent.postMessage(JSON.stringify({ type, data }), '*')

	const _initNewWidget = (widget, baseUrl, mediaUrl) => {
		_baseurl = baseUrl
		_mediaUrl = mediaUrl
		_tellCreator('initNewWidget', [widget])
	}

	const _initExistingWidget = (widget, title, qset, qsetVersion, baseUrl, mediaUrl) => {
		_baseurl = baseUrl
		_mediaUrl = mediaUrl
		_tellCreator('initExistingWidget', [widget, title, qset, qsetVersion])
	}

	const start = creatorClass => {
		// setup the postmessage listener
		addEventListener('message', _onPostMessage, false)

		if (creatorClass.manualResize != null && creatorClass.manualResize === false) {
			_resizeInterval = setInterval(() => {
				setHeight()
			}, 300)
		}

		_creatorClass = creatorClass
		_sendPostMessage('start', null)
	}

	const alert = (title, msg, type) => {
		if (type == null) {
			type = 1
		}
		_sendPostMessage('alert', { title, msg, type })
	}

	const getMediaUrl = mediaId => `${_mediaUrl}/${mediaId}`

	// replace a specified list of characters with their safe equivalents
	const _preSanitize = text => {
		for (let k in PRESANITIZE_CHARACTERS) {
			const v = PRESANITIZE_CHARACTERS[k]
			text = text.replace(new RegExp(k, 'g'), v)
		}
		return text
	}

	const showMediaImporter = types => {
		if (types == null) {
			types = ['jpg', 'jpeg', 'gif', 'png']
		}
		_sendPostMessage('showMediaImporter', types)
	}

	const save = (title, qset, version) => {
		if (version == null) {
			version = '1'
		}
		const sanitizedTitle = _preSanitize(title)
		_sendPostMessage('save', [sanitizedTitle, qset, version])
	}

	const cancelSave = msg => _sendPostMessage('cancelSave', [msg])

	const setHeight = h => {
		if (!h) {
			h = $('html').height()
		}
		if (h !== _lastHeight) {
			_sendPostMessage('setHeight', [h])
			_lastHeight = h
		}
	}

	const escapeScriptTags = text => text.replace(/</g, '&lt;').replace(/>/g, '&gt;')

	const disableResizeInterval = () => {
		clearInterval(_resizeInterval)
	}

	// Public Methods
	return {
		/* develblock:start */
		// these method are exposed for testing
		getLocalVar: name => eval(name),
		/* istanbul ignore next */
		setLocalVar: (name, value) => {
			/* istanbul ignore next */
			let x = eval(name)
			/* istanbul ignore next */
			x = value
		},
		/* develblock:end */

		start,
		alert,
		getMediaUrl,
		showMediaImporter,
		cancelSave,
		save,
		disableResizeInterval,
		setHeight, // allows the creator to resize its iframe container to fit the height of its contents
		escapeScriptTags
	}
})()
