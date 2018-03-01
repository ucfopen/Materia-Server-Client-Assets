describe('creatorcore', () => {
	let creatorCore
	let $q

	let mockFetchOnce = result => {
		fetch.mockImplementationOnce((n, arg, cb) => {
			const deferred = $q.defer()
			deferred.resolve(result)
			return deferred.promise
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

	it('alert sends a postmessage', () => {
		creatorCore.alert('title', 'msg', 'type')
		expect(parent.postMessage).toHaveBeenCalledWith(
			'{"type":"alert","data":{"title":"title","msg":"msg","type":"type"}}',
			'*'
		)
	})

	it('getMediaUrl returns an expected url', () => {
		creatorCore.start({})
		let _onPostMessage = window.addEventListener.mock.calls[0][1]
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
})
