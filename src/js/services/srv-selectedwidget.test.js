describe('selectedWidgetSrv', function() {
	var _service
	var _compile
	var _scope
	var sendMock
	var _q

	beforeEach(() => {
		require('../materia-namespace')
		require('../materia-constants')
		require('./srv-selectedwidget')

		inject(function($rootScope, selectedWidgetSrv, $q) {
			_scope = $rootScope
			_service = selectedWidgetSrv
			_q = $q
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
	})

	it('defines expected methods', function() {
		expect(_service.set).toBeDefined()
		expect(_service.get).toBeDefined()
		expect(_service.getSelectedId).toBeDefined()
		expect(_service.getScoreSummaries).toBeDefined()
		expect(_service.getUserPermissions).toBeDefined()
		expect(_service.getPlayLogsForSemester).toBeDefined()
		expect(_service.getDateRanges).toBeDefined()
		expect(_service.getSemesterFromTimestamp).toBeDefined()
		expect(_service.getStorageData).toBeDefined()
		expect(_service.getMaxRows).toBeDefined()
		expect(_service.updateAvailability).toBeDefined()
		expect(_service.notifyAccessDenied).toBeDefined()
	})

	it('seting a widget updates result of get', function() {
		expect(_service.get()).toBeNull()
		expect(_service.set({ id: 1 })).toBeUndefined()
		expect(_service.get()).toMatchObject({ id: 1 })
	})

	it('getSelectedId gets the widget id', function() {
		_service.set({ id: 1 })
		expect(_service.getSelectedId()).toBe(1)
		_service.set({ id: 4 })
		expect(_service.getSelectedId()).toBe(4)
	})

	it('getScoreSummaries to call api', function() {
		_service.set({ id: 5 })
		_service.getScoreSummaries()
		expect(sendMock).toHaveBeenCalledWith('score_summary_get', [5, true], expect.anything())
	})

	it('getScoreSummaries to return an angular promise', function() {
		_service.set({ id: 5 })
		expect(_service.getScoreSummaries()).toHaveProperty('$$state')
	})

	it.only('getScoreSummaries to process api results and caches them', function() {
		_service.set({ id: 5 })
		let promise = _service.getScoreSummaries()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)

		// execute coms callback
		let data = [{ id: 5 }, { id: 9 }]
		sendMock.mock.calls[0][2](data)
		_scope.$digest()

		expect(sendMock).toHaveBeenCalledTimes(1)
		expect(promiseSpy).toHaveBeenCalledWith({
			last: { id: 5 },
			list: [{ id: 5 }, { id: 9 }],
			map: { '5': { id: 5 }, '9': { id: 9 } }
		})

		let promiseSpy2 = jest.fn()
		promise = _service.getScoreSummaries()
		promise.then(promiseSpy2)
		_scope.$digest()
		expect(sendMock).toHaveBeenCalledTimes(1)
		expect(promiseSpy2).toHaveBeenCalledWith({
			last: { id: 5 },
			list: [{ id: 5 }, { id: 9 }],
			map: { '5': { id: 5 }, '9': { id: 9 } }
		})
	})
})
