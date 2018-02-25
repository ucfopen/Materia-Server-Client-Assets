describe('widgetSrv', function() {
	var _service
	var _compile
	var _scope
	var sendMock
	var _selectedWidgetSrv
	var _dateTimeServ
	var mockWindow
	var mockHashGet
	var mockHashSet
	var _q

	beforeEach(() => {
		// MOCK some services
		_selectedWidgetSrv = {
			set: jest.fn(),
			notifyAccessDenied: jest.fn()
		}
		_dateTimeServ = {
			parseObjectToDateString: jest.fn(() => 'dateString'),
			parseTime: jest.fn(() => 'timeString')
		}
		let app = angular.module('materia')
		app.factory('selectedWidgetSrv', () => _selectedWidgetSrv)
		app.factory('dateTimeServ', () => _dateTimeServ)

		// MOCK $window
		mockWindow = {
			addEventListener: jest.fn(),
			location: {}
		}
		mockHashGet = jest.fn()
		mockHashSet = jest.fn()
		Object.defineProperty(mockWindow.location, 'hash', {
			get: mockHashGet,
			set: mockHashSet
		})
		app.factory('$window', () => mockWindow)

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

	it('listens to hash changes', () => {
		expect(mockWindow.addEventListener).toHaveBeenCalledWith(
			'hashchange',
			expect.any(Function),
			false
		)
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

		let promiseSpy = jest.fn()
		_service.getWidgets().then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('clean_name')
	})

	it('getWidgets caches data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promiseSpy = jest.fn()
		_service.getWidgets().then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(sendMock).toHaveBeenCalledTimes(1)

		let promiseSpy2 = jest.fn()
		_service.getWidgets().then(promiseSpy2)
		_scope.$digest() // processes promise

		expect(promiseSpy2).toHaveBeenCalled()
		expect(sendMock).toHaveBeenCalledTimes(1)
	})

	it('getWidget returns a promise', () => {
		expect(_service.getWidget()).toHaveProperty('$$state')
		expect(_service.getWidget(55)).toHaveProperty('$$state')
	})

	it('getWidget loads instances from api', () => {
		expect(_service.getWidget()).toHaveProperty('$$state')
		expect(sendMock).toHaveBeenCalledWith('widget_instances_get', null, expect.anything())
	})

	it('getWidget resolves with expected data for all widgets', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promiseSpy = jest.fn()
		_service.getWidget().then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0][0]).toHaveProperty('clean_name')
	})

	it('getWidget resolves with expected data for 1 widget', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promiseSpy = jest.fn()
		_service.getWidget('avhWS').then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveProperty('widget')
		expect(promiseSpy.mock.calls[0][0]).toHaveProperty('clean_name')
	})

	it('getWidget caches widget data', () => {
		sendMock.mockImplementation((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		let promiseSpy = jest.fn()
		_service.getWidget().then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalled()
		expect(promiseSpy.mock.calls[0][0]).toHaveLength(49)
		expect(sendMock).toHaveBeenCalledTimes(1)

		let promiseSpy2 = jest.fn()
		_service.getWidget().then(promiseSpy2)
		_scope.$digest() // processes promise

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

		let promiseSpy = jest.fn()
		_service.getWidgetInfo().then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalledWith(getMockApiData('widgets_get'))
	})

	it('sortWidgets sorts correctly', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})

		_service.getWidget()
		_scope.$digest() // processes promise

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
		_scope.$digest() // processes promise

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

	it('saveWidget updates the saved widget in the cache', () => {
		let widgets = getMockApiData('widget_instances_get')
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(widgets)
		})
		_service.getWidget()
		_scope.$digest() // processes promise

		let newWidget = Object.assign({}, getMockApiData('widget_instances_get')[0])
		newWidget.clean_name = 'MY NEW TEST NAME'
		newWidget.inst_id = newWidget.id
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(newWidget)
		})

		_service.saveWidget(newWidget)

		let promiseSpy = jest.fn()
		_service.getWidget(newWidget.id).then(promiseSpy)
		_scope.$digest() // processes promise

		expect(promiseSpy).toHaveBeenCalledWith(newWidget)
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

	it('saveWidget returns expected data', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb('mock_result')
		})

		let result
		_service.saveWidget('type').then(d => {
			result = d
		})
		_scope.$digest() // processes promise

		expect(result).toBe('mock_result')
	})

	it('addWidget returns a promise', () => {
		expect(_service.addWidget()).toHaveProperty('$$state')
	})

	it('addWidget adds a widget to the cache by getting it from the api', () => {
		_scope.$broadcast = jest.fn()
		let allWidgets = getMockApiData('widget_instances_get')
		let widgetsMinusOne = allWidgets.slice()
		let newWidget = widgetsMinusOne.pop()

		// mock the first get instances
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(widgetsMinusOne)
		})
		_service.getWidget()
		_scope.$digest() // processes promise

		// now service has widgets cached (without our new widget)
		// lets signal that we've created a new one by id
		// mock get instances returning minusOne widgets + new widget
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(allWidgets)
		})

		_service.addWidget(newWidget.id)
		_scope.$digest() // processes promise

		// make sure the api was used to get the new widget
		expect(sendMock).toHaveBeenLastCalledWith(
			'widget_instances_get',
			[[newWidget.id]],
			expect.anything()
		)
	})

	it('addWidget calls broadcast', () => {
		_scope.$broadcast = jest.fn()
		let allWidgets = getMockApiData('widget_instances_get')
		sendMock.mockImplementation((name, args, cb) => {
			cb(allWidgets)
		})

		_service.addWidget(allWidgets[0].id)
		_scope.$digest() // processes promise

		// make sure the api was used to get the new widget
		expect(_scope.$broadcast).toHaveBeenCalledWith('widgetList.update')
	})

	it('addWidget sets the window hash', () => {
		let allWidgets = getMockApiData('widget_instances_get')
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(allWidgets)
		})

		_service.addWidget(allWidgets[0].id)
		_scope.$digest() // processes promise

		expect(mockHashSet).toHaveBeenCalledWith('/0UNM0')
	})

	it('removeWidget removes a widget from cache', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})
		_service.getWidgets()
		_scope.$digest() // processes promise

		_service.removeWidget('0UNM0')

		let then = jest.fn()
		_service.getWidgets().then(then)
		_scope.$digest() // processes promise
		expect(then.mock.calls[0][0]).toHaveLength(48)
		expect(mockHashSet).toHaveBeenCalledWith('/8vwno')
	})

	it('removeWidget updates hash', () => {
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})
		_service.getWidgets()
		_scope.$digest() // processes promise

		_service.removeWidget('0UNM0')

		_service.getWidgets()
		_scope.$digest() // processes promise

		expect(mockHashSet).toHaveBeenCalledWith('/8vwno')
	})

	it('removeWidget broadcasts event', () => {
		_scope.$broadcast = jest.fn()
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})
		_service.getWidgets()
		_scope.$digest() // processes promise

		_service.removeWidget('0UNM0')

		_service.getWidgets()
		_scope.$digest() // processes promise

		expect(_scope.$broadcast).toHaveBeenCalledWith('widgetList.update')
	})

	it('updateHashUrl sets url has as expected', () => {
		_service.updateHashUrl('ffgg00')
		expect(mockHashSet).toHaveBeenCalledWith('/ffgg00')
	})

	it('convertAvailibilityDates parses time when start and end are sent', () => {
		let res = _service.convertAvailibilityDates(1519232808, 1519405200)
		expect(res).toMatchObject({
			end: { date: 'dateString', time: 'timeString' },
			start: { date: 'dateString', time: 'timeString' }
		})
	})

	it('convertAvailibilityDates parses start time alone', () => {
		let res = _service.convertAvailibilityDates(1519232808)
		expect(res).toMatchObject({
			end: { date: 0, time: 0 },
			start: { date: 'dateString', time: 'timeString' }
		})
	})

	it('convertAvailibilityDates parses endtime alone', () => {
		let res = _service.convertAvailibilityDates(null, 1519232808)
		expect(res).toMatchObject({
			end: { date: 'dateString', time: 'timeString' },
			start: { date: 0, time: 0 }
		})
	})

	it('convertAvailibilityDates handles no start or end date', () => {
		let res = _service.convertAvailibilityDates()
		expect(res).toMatchObject({ end: { date: 0, time: 0 }, start: { date: 0, time: 0 } })
	})

	it('selectWidgetFromHashUrl loads widget and sets selection', () => {
		mockHashGet.mockImplementation(() => '/0UNM0')
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})
		_service.selectWidgetFromHashUrl()
		_scope.$digest() // processes promise

		expect(_selectedWidgetSrv.set).toHaveBeenCalled()
		expect(_selectedWidgetSrv.set.mock.calls[0][0].id).toBe('0UNM0')
	})

	it('selectWidgetFromHashUrl warns about not having access', () => {
		mockHashGet.mockImplementation(() => '/ffff')
		sendMock.mockImplementationOnce((name, args, cb) => {
			cb(getMockApiData('widget_instances_get'))
		})
		_service.selectWidgetFromHashUrl()
		_scope.$digest() // processes promise
		expect(_selectedWidgetSrv.notifyAccessDenied).toHaveBeenCalled()
	})
})
