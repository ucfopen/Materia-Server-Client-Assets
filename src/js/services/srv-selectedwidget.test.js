describe('selectedWidgetSrv', function() {
	var _service
	var _compile
	var _scope
	var sendMock

	beforeEach(() => {
		require('../materia-namespace')
		require('../materia-constants')
		require('./srv-selectedwidget')

		inject(function($rootScope, selectedWidgetSrv) {
			_scope = $rootScope
			_service = selectedWidgetSrv
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
		// expect(_service.getSelectedId()).toBeNull()
		_service.set({ id: 1 })
		expect(_service.getSelectedId()).toBe(1)
		_service.set({ id: 4 })
		expect(_service.getSelectedId()).toBe(4)
	})

	it('getScoreSummaries to call api', function() {
		// expect(_service.getSelectedId()).toBeNull()
		_service.set({ id: 5 })
		_service.getScoreSummaries()
		expect(sendMock).toHaveBeenCalledWith('score_summary_get', [5, true], expect.anything())
	})
})
