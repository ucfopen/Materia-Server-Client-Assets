describe('widgetCatalogController', () => {
	var $controller
	var mockPlease
	var $q
	var $rootScope
	var $scope
	var $window
	var $timeout
	var location
	var sendMock
	var iconUrlMock
	var screenshotUrlMock
	var screenshotThumbMock

	const widget1 = {
		id: 1,
		icon: 'http://localhost/1.png',
		in_catalog: '1',
		meta_data: {
			about: 'information about the widget',
			demo: '1',
			excerpt: 'more information about the widget',
			features: ['feature1', 'feature3'],
			supported_data: ['supported1']
		},
		name: 'widget1'
	}
	const widget2 = {
		id: 2,
		icon: 'http://localhost/2.png',
		in_catalog: '0',
		meta_data: {
			about: 'information about the widget',
			demo: '2',
			excerpt: 'more information about the widget',
			features: ['feature2', 'feature3'],
			supported_data: ['supported2']
		},
		name: 'widget2'
	}

	beforeEach(() => {
		mockPlease = { $apply: jest.fn() }
		let app = angular.module('materia')
		app.factory('Please', () => mockPlease)

		// mock window.location
		let mockWindow = {}
		let mockLocationSet = jest.fn(l => (location = l))
		let mockLocationGet = jest.fn(() => location)
		Object.defineProperty(mockWindow, 'location', {
			get: mockLocationGet,
			set: mockLocationSet
		})
		app.factory('$window', () => mockWindow)

		require('../materia-namespace')
		require('../materia-constants')
		require('../materia/materia.coms.json')
		require('../services/srv-selectedwidget')
		require('../services/srv-datetime')
		require('../services/srv-widget')
		require('./ctrl-widget-catalog')

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn(() => {
			const deferred = $q.defer()
			deferred.resolve([widget1, widget2])
			return deferred.promise
		})

		Namespace('Materia.Image').iconUrl = iconUrlMock = jest.fn(() => {
			const deferred = $q.defer()
			deferred.resolve('widget.jpg')
			return deferred.promise
		})

		Namespace('Materia.Image').screenshotUrl = screenshotUrlMock = jest.fn(() => {
			const deferred = $q.defer()
			deferred.resolve('screenshot-full.jpg')
			return deferred.promise
		})

		Namespace('Materia.Image').screenshotThumbUrl = screenshotThumbMock = jest.fn(() => {
			const deferred = $q.defer()
			deferred.resolve('screenshot-thumb.jpg')
			return deferred.promise
		})

		inject((_$controller_, _$window_, _$timeout_, _$q_, _$rootScope_) => {
			$controller = _$controller_
			$window = _$window_
			$timeout = _$timeout_
			$q = _$q_
			$rootScope = _$rootScope_
		})

		$scope = {
			$watch: jest.fn(),
			$on: jest.fn()
		}

		var controller = $controller('widgetCatalogCtrl', { $scope })
		$timeout.flush()
	})

	it('defines expected scope vars', () => {
		expect($scope.search).toBeDefined()
		expect($scope.totalWidgets).toBeDefined()
		expect($scope.isShowingFilters).toBeDefined()
		expect($scope.ready).toBeDefined()
		expect($scope.activeFilters).toBeDefined()
		expect($scope.showFilters).toBeDefined()
		expect($scope.clearFilters).toBeDefined()
		expect($scope.clearFiltersAndSearch).toBeDefined()
		expect($scope.toggleFilter).toBeDefined()
		expect($scope.widgets).toBeDefined()
		expect($scope.filters).toBeDefined()
		expect($scope.isFiltered).toBeDefined()
	})

	it('grabs widgets and sets defaults properly', () => {
		//the widgets were requested
		expect(sendMock).toHaveBeenCalledTimes(1)

		//the defaults are still default
		expect($scope.search).toBe('')
		expect($scope.ready).toBe(true)
		expect($scope.isShowingFilters).toBe(false)
		expect($scope.activeFilters).toEqual([])
		expect($scope.isFiltered).toBe(false)

		//widgets sent back from the API are mocked above - just do a quick check to make sure we have what we need
		expect($scope.totalWidgets).toBe(2)
		expect($scope.featuredWidgets).toContain(widget1)
		expect($scope.widgets).toContain(widget2)

		//available filters should be constructed from widget metadata
		expect($scope.filters).toHaveProperty('feature1')
		expect($scope.filters).toHaveProperty('feature2')
		expect($scope.filters).toHaveProperty('feature3')
		expect($scope.filters).toHaveProperty('supported1')
		expect($scope.filters).toHaveProperty('supported2')
	})
})
