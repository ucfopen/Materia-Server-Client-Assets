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
		require('../services/srv-widget')
		require('../services/srv-selectedwidget')
		require('../services/srv-datetime')
		require('../services/srv-user')
		require('./ctrl-alert')
		require('ngmodal/dist/ng-modal')
		require('./ctrl-selectedwidget')

		inject((_$controller_, _$q_, _adminSrv_, _$rootScope_) => {
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
		$scope = {
			$watch: jest.fn(),
			$on: jest.fn()
		}
		var controller = $controller('SelectedWidgetController', { $scope })
	})

	it('defines expected scope vars', () => {
		expect($scope.hideModal).toBeDefined()
		expect($scope.removeExpires).toBeDefined()
		expect($scope.setupPickers).toBeDefined()
		expect($scope.showCollaboration).toBeDefined()
		expect($scope.showDelete).toBeDefined()
		expect($scope.showCopyDialog).toBeDefined()
		expect($scope.getEmbedLink).toBeDefined()
		expect($scope.editWidget).toBeDefined()
		expect($scope.popup).toBeDefined()
		expect($scope.hideModal).toBeDefined()
		expect($scope.exportPopup).toBeDefined()
		expect($scope.copyWidget).toBeDefined()
		expect($scope.deleteWidget).toBeDefined()
		expect($scope.enableOlderScores).toBeDefined()
		expect($scope.alert).toBeDefined()
	})

	it('_hideModal uses a flexible scope', () => {
		expect($scope.hideModal).toBeDefined()

		this.$parent = {
			hideModal: jest.fn()
		}

		// calling hideModal should call the hideModal we provide in this scope
		// this will not pass if $scope.hideModal is an arrow function
		$scope.hideModal.bind(this)()
		expect(this.$parent.hideModal).toHaveBeenCalled()
	})
})
