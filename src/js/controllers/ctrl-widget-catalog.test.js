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
			supported_data: ['supported1', 'supported_three', 'SuPpOrTeD FoUr!!']
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
	const widget3 = {
		id: 3,
		icon: 'http://localhost/3.png',
		in_catalog: '0',
		meta_data: {
			about: 'information about the widget',
			demo: '3',
			excerpt: 'more information about the widget',
			features: [],
			supported_data: []
		},
		name: 'widget3'
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

		// manually set the url
		window.history.pushState({}, '', 'http://localhost/widgets')

		require('../materia-namespace')
		require('../materia-constants')
		require('../materia/materia.coms.json')
		require('../services/srv-selectedwidget')
		require('../services/srv-datetime')
		require('../services/srv-widget')
		require('angular-animate')
		require('./ctrl-widget-catalog')

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn(() => {
			const deferred = $q.defer()
			deferred.resolve([widget1, widget2, widget3])
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
		// the widgets were requested
		expect(sendMock).toHaveBeenCalledTimes(1)

		//the defaults are still default
		expect($scope.search).toBe('')
		expect($scope.ready).toBe(true)
		expect($scope.isShowingFilters).toBe(false)
		expect($scope.activeFilters).toEqual([])
		expect($scope.isFiltered).toBe(false)

		// widgets sent back from the API are mocked above - just do a quick check to make sure we have what we need
		expect($scope.totalWidgets).toBe(3)
		expect($scope.featuredWidgets).toContain(widget1)
		expect($scope.featuredWidgets.length).toBe(1)
		expect($scope.widgets).toContain(widget2)
		expect($scope.widgets.length).toBe(2)

		//available filters should be constructed from widget metadata
		const numFilters = Object.keys($scope.filters).length
		expect(numFilters).toBe(7)
		expect($scope.filters).toHaveProperty('feature1')
		expect($scope.filters).toHaveProperty('feature2')
		expect($scope.filters).toHaveProperty('feature3')
		expect($scope.filters).toHaveProperty('supported1')
		expect($scope.filters).toHaveProperty('supported2')
	})

	it('properly generates clean filter names', () => {
		const mapCleanToFilter = $scope.jestTest.getLocalVar('mapCleanToFilter')
		const cleanFilters = Object.keys(mapCleanToFilter)
		expect(cleanFilters.length).toBe(7)
		expect(cleanFilters).toContain('feature1')
		expect(cleanFilters).toContain('feature3')
		expect(cleanFilters).toContain('supported1')
		expect(cleanFilters).toContain('supported_three')
		expect(cleanFilters).toContain('su_pp_or_te_d_fo_ur')
		expect(cleanFilters).toContain('feature2')
		expect(cleanFilters).toContain('supported2')
	})

	it('filters out widgets correctly', () => {
		// expect all the filters to be false
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(false)
		}
		expect($scope.isFiltered).toBe(false)
		expect($scope.widgets.length).toBe(2)
		expect($scope.widgets[0].name).toBe('widget2')
		expect($scope.widgets[1].name).toBe('widget3')

		$scope.toggleFilter('feature1')

		// make sure only the one filter was affected
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(filterName == 'feature1')
		}
		expect($scope.isFiltered).toBe(true)
		expect($scope.widgets.length).toBe(1)
		expect($scope.widgets[0].name).toBe('widget1')

		// toggle again, so everything should be back to false
		$scope.toggleFilter('feature1')
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(false)
		}
		expect($scope.isFiltered).toBe(false)
		expect($scope.widgets.length).toBe(2)
		expect($scope.widgets[0].name).toBe('widget2')
		expect($scope.widgets[1].name).toBe('widget3')
	})

	it('will swap the featured section out when a filter is applied', () => {
		// first two widgets have 'feature3', should just filter out widget3
		// expect all the filters to be false
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(false)
		}
		expect($scope.widgets.length).toBe(2)
		expect($scope.widgets[0].name).toBe('widget2')
		expect($scope.widgets[1].name).toBe('widget3')

		$scope.toggleFilter('feature3')
		// make sure only the one filter was affected
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(filterName == 'feature3')
		}

		// check the new list, which should include a featured widget (widget1)
		expect($scope.isFiltered).toBe(true)
		expect($scope.widgets.length).toBe(2)
		expect($scope.widgets[0].name).toBe('widget1')
		expect($scope.widgets[1].name).toBe('widget2')
	})

	it('will filter widgets based on a search query', () => {
		expect($scope.search).toBe('')
		$scope.search = '1'
		const _onSearch = $scope.jestTest.getLocalVar('_onSearch')
		_onSearch()
		expect($scope.widgets.length).toBe(1)
		expect($scope.widgets[0].name).toBe('widget1')

		$scope.search = '123'
		_onSearch()
		expect($scope.widgets.length).toBe(0)

		$scope.search = ''
		_onSearch()
		expect($scope.widgets.length).toBe(2)
	})

	it('can toggle whether the filters are showing', () => {
		expect($scope.isShowingFilters).toBe(false)
		$scope.showFilters()
		expect($scope.isShowingFilters).toBe(true)
		$scope.clearFilters()
		expect($scope.isShowingFilters).toBe(false)
	})

	it('can clear the filters', () => {
		$scope.toggleFilter('feature1')
		$scope.toggleFilter('feature2')
		$scope.search = 'widget'
		$scope.clearFiltersAndSearch()

		// expect all the filters to be false
		for (let filterName in $scope.filters) {
			expect($scope.filters[filterName].isActive).toBe(false)
		}
		expect($scope.search).toBe('')
	})

	/* TODO need to figure out how to manually set/change URL for this test
	it('will show the filters if it loads with some filters in the URL', () => {
		expect(false).toBe(true)
	})

	*/
})
