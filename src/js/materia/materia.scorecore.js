Namespace('Materia').ScoreCore = (() => {
	let _lastHeight = -1
	let _widgetClass = null

	const _onPostMessage = e => {
		const msg = JSON.parse(e.data)
		switch (msg.type) {
			case 'initWidget':
				_initWidget(msg.data[0], msg.data[1], msg.data[2], msg.data[3])
				break
			case 'updateWidget':
				_updateWidget(msg.data[0], msg.data[1])
				break
			case 'scoreDistribution':
				_scoreDistribution(msg.data[0])
				break
			default:
				throw new Error(`Error: Score Core received unknown post message: ${msg.type}`)
		}
	}

	const _sendPostMessage = (type, data) => {
		parent.postMessage(JSON.stringify({ type, data }), '*')
	}

	const _initWidget = (qset, scoreTable, instance, isPreview) => {
		_widgetClass.start(instance, qset.data, scoreTable, isPreview, qset.version)
	}

	const _updateWidget = (qset, scoreTable) => {
		_widgetClass.update(qset.data, scoreTable)
	}

	const _scoreDistribution = (data) => {
		_widgetClass.handleScoreDistribution(data)
	}

	const hideResultsTable = () => {
		_sendPostMessage('hideResultsTable')
	}

	const hideScoresOverview = () => {
		_sendPostMessage('hideScoresOverview')
	}

	const requestScoreDistribution = () => {
		_sendPostMessage('requestScoreDistribution')
	}

	const start = widgetClass => {
		// setup the postmessage listener
		addEventListener('message', _onPostMessage, false)

		_widgetClass = widgetClass
		_sendPostMessage('start', null)
	}

	const setHeight = h => {
		if (!h) {
			h = parseInt(window.getComputedStyle(document.documentElement).height, 10)
		}
		if (h !== _lastHeight) {
			_sendPostMessage('setHeight', [h])
			_lastHeight = h
		}
	}

	return {
		hideResultsTable,
		hideScoresOverview,
		requestScoreDistribution,
		setHeight,
		start
	}
})()
