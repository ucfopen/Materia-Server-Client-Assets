describe('creatorcore', () => {
	let creatorCore
	let $q

	let mockCreator
	let _onPostMessage

	let mockHeightGetter = () => {
		//mocks document.getElementsByTagName('tag')[0].height()
		jest.spyOn(document, 'getElementsByTagName').mockReturnValueOnce([{height: () => 10}])
	}

	let mockFetchOnce = result => {
		fetch.mockImplementationOnce((n, arg, cb) => {
			const deferred = $q.defer()
			deferred.resolve(result)
			return deferred.promise
		})
	}

	let onlyCalledInCreator = targetMethod => {
		Object.keys(mockCreator).forEach(method => {
			if (method == targetMethod) {
				expect(mockCreator[method]).toHaveBeenCalledTimes(1)
			} else {
				expect(mockCreator[method]).not.toHaveBeenCalled()
			}
		})
	}

	beforeEach(() => {
		let app = angular.module('materia')
		inject(function(_$q_) {
			$q = _$q_
		})
		global.API_LINK = 'my_api_url'
		require('../materia-namespace')
		require('./materia.creatorcore')
		creatorCore = Namespace('Materia.CreatorCore')
		global.fetch = jest.fn()
		jest.spyOn(window, 'addEventListener')
		jest.spyOn(parent, 'postMessage')

		mockCreator = {
			onSaveClicked: jest.fn(),
			onSaveComplete: jest.fn(),
			onMediaImportComplete: jest.fn(),
			onQuestionImportComplete: jest.fn(),
			initNewWidget: jest.fn(),
			initExistingWidget: jest.fn()
		}

		//prior to each test, run creatorCore.start to prime the _onPostMessage event listener
		creatorCore.start(mockCreator)
		parent.postMessage.mockReset()
		//this refers to the private method _onPostMessage passed to window.addEventListener
		//use this to run private methods
		_onPostMessage = window.addEventListener.mock.calls[0][1]
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('defines expected public methods', () => {
		expect(creatorCore.start).toBeDefined()
		expect(creatorCore.alert).toBeDefined()
		expect(creatorCore.getMediaUrl).toBeDefined()
		expect(creatorCore.showMediaImporter).toBeDefined()
		expect(creatorCore.cancelSave).toBeDefined()
		expect(creatorCore.save).toBeDefined()
		expect(creatorCore.disableResizeInterval).toBeDefined()
		expect(creatorCore.setHeight).toBeDefined()
		expect(creatorCore.escapeScriptTags).toBeDefined()
	})

	it('start sends a postmessage', () => {
		creatorCore.start({})
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"start","data":null}', '*')
	})

	it('reacts properly to initNewWidget post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'initNewWidget',
				data: ['widgetObj', 'baseUrl', 'mediaUrl']
			})
		})
		expect(mockCreator.initNewWidget).toHaveBeenCalledWith('widgetObj')
		onlyCalledInCreator('initNewWidget')
	})

	it('reacts properly to initExistingWidget post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'initExistingWidget',
				data: ['widgetObj', 'widgetTitle', 'qsetObj', 'qsetVersion', 'baseUrl', 'mediaUrl']
			})
		})
		expect(mockCreator.initExistingWidget).toHaveBeenCalledWith('widgetObj', 'widgetTitle', 'qsetObj', 'qsetVersion')
		onlyCalledInCreator('initExistingWidget')
	})

	it('reacts properly to onRequestSave post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'onRequestSave',
				data: ['save']
			})
		})
		expect(mockCreator.onSaveClicked).toHaveBeenCalledWith('save')
		onlyCalledInCreator('onSaveClicked')
	})

	it('reacts properly to onSaveComplete post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'onSaveComplete',
				data: ['instanceName', 'instanceWidget', 'instanceQsetData', 'instanceQsetVersion']
			})
		})
		expect(mockCreator.onSaveComplete).toHaveBeenCalledWith('instanceName', 'instanceWidget', 'instanceQsetData', 'instanceQsetVersion')
		onlyCalledInCreator('onSaveComplete')
	})

	it('reacts properly to onMediaImportComplete post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'onMediaImportComplete',
				data: ['mediaArray']
			})
		})
		expect(mockCreator.onMediaImportComplete).toHaveBeenCalledWith('mediaArray')
		onlyCalledInCreator('onMediaImportComplete')
	})

	it('reacts properly to onQuestionImportComplete post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'onQuestionImportComplete',
				data: ['questionArray']
			})
		})
		expect(mockCreator.onQuestionImportComplete).toHaveBeenCalledWith('questionArray')
		onlyCalledInCreator('onQuestionImportComplete')
	})

	it('reacts properly to unknown post messages', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'undefinedMessageType',
				data: ['payload']
			})
		})
		expect(parent.postMessage).toHaveBeenCalledWith(
			'{\"type\":\"alert\",\"data\":{\"title\":\"Error, unknown message sent to creator core: undefinedMessageType\",\"type\":1}}',
			'*'
		)
	})

	it('reacts properly if the creator class is missing an expected method', () => {
		//pretend the creator doesn't have this method defined after all
		delete mockCreator.initNewWidget

		_onPostMessage({
			data: JSON.stringify({
				type: 'initNewWidget',
				data: ['widgetObj', 'baseUrl', 'mediaUrl']
			})
		})
		expect(parent.postMessage).toHaveBeenCalledWith(
			'{\"type\":\"alert\",\"data\":{\"title\":\"Error, missing creator initNewWidget called.\",\"type\":1}}',
			'*'
		)
	})

	it('alert sends a postmessage', () => {
		creatorCore.alert('title', 'msg', 'type')
		expect(parent.postMessage).toHaveBeenCalledWith(
			'{"type":"alert","data":{"title":"title","msg":"msg","type":"type"}}',
			'*'
		)
	})

	it('getMediaUrl returns an expected url', () => {
		_onPostMessage({
			data: JSON.stringify({
				type: 'initNewWidget',
				data: ['widgetObj', 'baseUrl', 'mediaUrl']
			})
		})

		expect(creatorCore.getMediaUrl('fR93X')).toBe('mediaUrl/fR93X')
	})

	it('showMediaImporter sends post message', () => {
		creatorCore.showMediaImporter()
		let ex = JSON.stringify({
			type: 'showMediaImporter',
			data: ['jpg', 'jpeg', 'gif', 'png']
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('showMediaImporter sends post message with media specified', () => {
		creatorCore.showMediaImporter(['mp3'])
		let ex = JSON.stringify({
			type: 'showMediaImporter',
			data: ['mp3']
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('cancelSave sends post message', () => {
		creatorCore.cancelSave('message')
		let ex = JSON.stringify({
			type: 'cancelSave',
			data: ['message']
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('save sends post message', () => {
		creatorCore.save('title', { one: 1, two: 2 }, 1)
		let ex = JSON.stringify({
			type: 'save',
			data: ['title', { one: 1, two: 2 }, 1]
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('save sets default vesion', () => {
		creatorCore.save('title', { one: 1, two: 2 })
		let ex = JSON.stringify({
			type: 'save',
			data: ['title', { one: 1, two: 2 }, '1']
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('save sanitizes title', () => {
		creatorCore.save('title <script></script>', {})
		let ex = JSON.stringify({
			type: 'save',
			data: ['title &lt;script&gt;&lt;/script&gt;', {}, '1']
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('setHeight sends message', () => {
		creatorCore.setHeight(200)
		let ex = JSON.stringify({
			type: 'setHeight',
			data: [200]
		})
		expect(parent.postMessage).toHaveBeenLastCalledWith(ex, '*')
	})

	it('escapeScriptTags cleans tags', () => {
		let ret = creatorCore.escapeScriptTags('<script><a href="test">hi</a></script>')
		expect(ret).toBe('&lt;script&gt;&lt;a href="test"&gt;hi&lt;/a&gt;&lt;/script&gt;')
	})

	it('does not send a request to set height if setHeight is given the current height', () => {
		creatorCore.setHeight(-1)
		expect(parent.postMessage).not.toHaveBeenCalled()
	})

	it('sends a request to set height if setHeight is given the current height', () => {
		creatorCore.setHeight(1)
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"setHeight","data":[1]}', '*')
	})

	it('sends a request to set height if setHeight is given nothing', () => {
		mockHeightGetter()
		creatorCore.setHeight()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"setHeight","data":[10]}', '*')
	})

	it('properly sets a resize interval for auto-resizing widgets', () => {
		mockHeightGetter()
		mockCreator.manualResize = false

		//lets us trigger intervals
		jest.useFakeTimers()

		creatorCore.start(mockCreator)
		jest.runOnlyPendingTimers()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"setHeight","data":[10]}', '*')
	})

	it('disables the resize interval correctly', () => {
		mockHeightGetter()
		mockCreator.manualResize = false

		//lets us trigger intervals
		jest.useFakeTimers()

		creatorCore.start(mockCreator)
		parent.postMessage.mockReset()

		creatorCore.disableResizeInterval()
		expect(clearInterval).toHaveBeenCalledTimes(1)

		//no additional post messages should result since we shouldn't have any intervals
		jest.runOnlyPendingTimers();
		expect(parent.postMessage).not.toHaveBeenCalled()
	})
})
