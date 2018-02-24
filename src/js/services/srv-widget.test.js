describe('widgetSrv', function() {
	var _service
	var _compile
	var _scope
	var sendMock
	var _selectedWidgetSrv
	var _dateTimeServ
	var _q

	beforeEach(() => {
		// MOCK $window
		_selectedWidgetSrv = jest.fn()
		_dateTimeServ = jest.fn()
		let app = angular.module('materia')
		app.factory('selectedWidgetSrv', () => _selectedWidgetSrv)
		app.factory('dateTimeServ', () => _dateTimeServ)

		require('../materia-namespace')
		require('../materia-constants')
		require('./srv-widget')

		inject(function($rootScope, widgetSrv, $q) {
			_scope = $rootScope
			_service = widgetSrv
			_q = $q
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
		Namespace('Materia.User').getCurrentUser = getCurrentUserMock = jest.fn()
	})

	it('defines expected methods', () => {
		expect(_service.getWidgets).toBeDefined()
		expect(_service.getWidgetsByType).toBeDefined()
		expect(_service.getWidget).toBeDefined()
		expect(_service.getWidgetInfo).toBeDefined()
		expect(_service.sortWidgets).toBeDefined()
		expect(_service.saveWidget).toBeDefined()
		expect(_service.addWidget).toBeDefined()
		expect(_service.removeWidget).toBeDefined()
		expect(_service.updateHashUrl).toBeDefined()
		expect(_service.selectWidgetFromHashUrl).toBeDefined()
		expect(_service.convertAvailibilityDates).toBeDefined()
	})

	it('getWidgets returns a promise', () => {
		expect(_service.getWidgets()).toHaveProperty('$$state')
	})

	it('getWidgets loads instances from api', () => {
		expect(_service.getWidgets()).toHaveProperty('$$state')
		expect(sendMock).toHaveBeenCalledWith('widget_instances_get', undefined, expect.anything())
	})

	it('getWidgets resolves with expected data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promise = _service.getWidgets()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('clean_name')
	})

	it('getWidgets caches data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promise = _service.getWidgets()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(sendMock).toHaveBeenCalledTimes(1)

		let promise2 = _service.getWidgets()
		let promiseSpy2 = jest.fn()
		promise2.then(promiseSpy2)
		_scope.$digest()

		expect(promiseSpy2).toHaveBeenCalled()
		expect(sendMock).toHaveBeenCalledTimes(1)
	})

	it('getWidget returns a promise', () => {
		expect(_service.getWidget()).toHaveProperty('$$state')
		expect(_service.getWidget(55)).toHaveProperty('$$state')
	})

	it('getWidget loads instances from api', () => {
		expect(_service.getWidget()).toHaveProperty('$$state')
		expect(sendMock).toHaveBeenCalledWith('widget_instances_get', undefined, expect.anything())
	})

	it('getWidget resolves with expected data for all widgets', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promise = _service.getWidget()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('clean_name')
	})

	it('getWidget resolves with expected data for 1 widget', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promise = _service.getWidget('avhWS')
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('clean_name')
	})

	it('getWidget caches widget data', () => {
		sendMock.mockImplementation((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promise = _service.getWidget()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(sendMock).toHaveBeenCalledTimes(1)

		let promise2 = _service.getWidget()
		let promiseSpy2 = jest.fn()
		promise2.then(promiseSpy2)
		_scope.$digest()

		expect(promiseSpy2).toHaveBeenCalled()
		expect(sendMock).toHaveBeenCalledTimes(1)
	})

	it('getWidgetInfo returns a promise', () => {
		expect(_service.getWidgetInfo()).toHaveProperty('$$state')
	})

	it('getWidgetInfo calls the api', () => {
		_service.getWidgetInfo(null)
		expect(sendMock).toHaveBeenCalledWith('widgets_get', null, expect.anything())
		_service.getWidgetInfo(6)
		expect(sendMock).toHaveBeenCalledWith('widgets_get', [[6]], expect.anything())
	})

	it('getWidgetInfo returns widget data', () => {
		sendMock.mockImplementation((name, args, cb) => {
			cb(getMockApiData('widgets_get'))
		})

		let promise = _service.getWidgetInfo()
		let promiseSpy = jest.fn()
		promise.then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalledWith(getMockApiData('widgets_get'))
	})

	it('sortWidgets sorts correctly', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		_service.getWidget()
		_scope.$digest()

		// join all the ids into an orderd string based on their expected order
		let finalOrder =
			'0UNM08vwnoLeHi41Ansey5o4eavhWSCECvoMUEc3l1UwKIvP3AEcgyW8FlMejrxh2Giu00yxQ0mT8ehcN99kGLQWPovZvNIi3lq4OS46SJOjDsQwe8WcrKqWujNVA8FgDglkXlQUKZRgnKnx21krR2pVaPgFL64ekd6xsSc1tQneebQg595klk72eatuhkcag88McXIm8bwgKwvOQyjGLaaQiqWmRHFsOd1BMOnmb3Yq1Same77J2'
		expect(
			_service
				.sortWidgets()
				.map(i => i.id)
				.join('')
		).toBe(finalOrder)
	})

	it('getWidgetsByType returns a promise', () => {
		expect(_service.getWidgetsByType()).toHaveProperty('$$state')
	})

	it('getWidgetsByType returns a promise', () => {
		_service.getWidgetsByType('type')
		expect(sendMock).toHaveBeenCalledWith('widgets_get_by_type', ['type'], expect.anything())
	})

	it('getWidgetsByType returns data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb('mock_result')
		})

		let result
		_service.getWidgetsByType('type').then(d => {
			result = d
		})
		_scope.$digest()

		expect(result).toBe('mock_result')
	})

	it('saveWidget returns a promise', () => {
		expect(_service.saveWidget()).toHaveProperty('$$state')
	})

	it('saveWidget calls new instance api', () => {
		const params = {
			name: 0,
			qset: 1,
			is_draft: 2,
			open_at: 3,
			close_at: 4,
			attempts: 5,
			guest_access: 6,
			embedded_only: 7,
			widget_id: 8
		}
		_service.saveWidget(params)
		expect(sendMock).toHaveBeenCalledWith('widget_instance_new', [8, 0, 1, 2], expect.anything())
	})

	it('saveWidget calls update instance api', () => {
		const params = {
			name: 0,
			qset: 1,
			is_draft: 2,
			open_at: 3,
			close_at: 4,
			attempts: 5,
			guest_access: 6,
			embedded_only: 7,
			inst_id: 8
		}
		_service.saveWidget(params)
		expect(sendMock).toHaveBeenCalledWith(
			'widget_instance_update',
			[8, 0, 1, 2, 3, 4, 5, 6, 7],
			expect.anything()
		)
	})

	it('saveWidget returns data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb('mock_result')
		})

		let result
		_service.saveWidget('type').then(d => {
			result = d
		})
		_scope.$digest()

		expect(result).toBe('mock_result')
	})
})
