Namespace('Materia').ScoreCore = (() => {
	let _lastHeight = -1
	let _widgetClass = null

	const _onPostMessage = e => {
		const msg = JSON.parse(e.data)
		switch (msg.type) {
			case 'initWidget':
				_initWidget(msg.data[0], msg.data[1], msg.data[2])
				break
			case 'updateWidget':
				_updateWidget(msg.data[0])
				break
			default:
				throw new Error(`Error: Engine Core received unknown post message: ${msg.type}`)
				break
		}
	}

	const _sendPostMessage = (type, data) => {
		parent.postMessage(JSON.stringify({ type, data }), '*')
	}

	const _initWidget = (qset, scoreTable, instance) => {
		_widgetClass.start(instance, qset.data, scoreTable, qset.version)
	}

	const _updateWidget = (scoreTable) => {
		_widgetClass.update(scoreTable)
	}

	const start = widgetClass => {
		// setup the postmessage listener
		addEventListener('message', _onPostMessage, false)

		_widgetClass = widgetClass
		_sendPostMessage('initialize') // not currently used, TODO
		_sendPostMessage('start', null)
	}

	const sendValidation = (valid) => {
		_sendPostMessage('validationResponse', [valid])
	}

	return {
		start,
		sendValidation
	}
})()
