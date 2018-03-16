describe('adminWidgetController', () => {
	var adminSrv
	var $controller
	var mockPlease
	var $q
	var $rootScope
	var $scope
	var widgetUploaderChangeListener

	let mockPromiseOnce = (mock, result) => {
		mock.mockImplementationOnce((n, arg, cb) => {
			const deferred = $q.defer()
			deferred.resolve(result)
			return deferred.promise
		})
	}

	beforeEach(() => {
		mockPlease = { $apply: jest.fn() }
		let app = angular.module('materia')
		app.factory('Please', () => mockPlease)

		require('../materia-namespace')
		require('../materia-constants')
		require('../services/srv-admin')
		require('./ctrl-admin-widget')

		inject(function(_$controller_, _$q_, _adminSrv_, _$rootScope_) {
			$controller = _$controller_
			$q = _$q_
			adminSrv = _adminSrv_
			$rootScope = _$rootScope_
		})

		Namespace('Materia.Image').iconUrl = jest.fn(() => 'iconurl')

		// set up the controller
		let getElementById = jest.spyOn(document, 'getElementById')
		widgetUploaderChangeListener = jest.fn()
		getElementById.mockReturnValueOnce({
			addEventListener: widgetUploaderChangeListener
		})
		jest.spyOn(adminSrv, 'getWidgets')
		mockPromiseOnce(adminSrv.getWidgets, ['sampleval'])
		$scope = { $watch: jest.fn() }
		var controller = $controller('adminWidgetController', { $scope })
	})

	it('defines expected scope vars', () => {
		expect($scope.save).toBeDefined()
		expect($scope.selectedFileName).toBe('No File Selected')
		expect($scope.widgets).toMatchObject([])
		$rootScope.$digest() // processes promise
		expect($scope.widgets).toMatchObject(['sampleval'])
	})

	it('changing the uploader updates the selected File name', () => {
		let _onUploaderChange = widgetUploaderChangeListener.mock.calls[0][1]
		_onUploaderChange({ target: { files: [{ name: 'filename' }] } })
		expect($scope.selectedFileName).toBe('filename')

		_onUploaderChange({ target: {} })
		expect($scope.selectedFileName).toBe('No File Selected')
	})

	it('changing the uploader updates the selected File name', () => {
		let w = {
			clean_name: 'f',
			in_catalog: 'f',
			is_editable: 'f',
			is_scorable: 'f',
			is_playable: 'f',
			meta_data: {
				about: 'f',
				excerpt: 'f',
				demo: 'f'
			}
		}
		// tests
		let saveWidget = jest.spyOn(adminSrv, 'saveWidget')
		mockPromiseOnce(saveWidget, { success: true })
		$scope.save(w)
		$rootScope.$digest()
		expect(w.errorMessage).toMatchObject([])

		mockPromiseOnce(saveWidget, { erorr: 'Trouble' })
		$scope.save(w)
		$rootScope.$digest()
		expect(w.errorMessage).toMatchObject(['Trouble'])

		mockPromiseOnce(saveWidget, { erorr: 'Trouble' })
		$scope.save(w)
		$rootScope.$digest()
		expect(w.errorMessage).toMatchObject(['Trouble'])
	})
})
