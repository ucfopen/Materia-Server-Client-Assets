describe('MyWidgetSettingsController', () => {
	var AdminSrv
	var $controller
	var mockPlease
	var $q
	var $rootScope
	var $scope

	beforeEach(() => {
		mockPlease = { $apply: jest.fn() }
		let app = angular.module('materia')
		app.factory('Please', () => mockPlease)

		require('../common/materia-namespace')
		require('../common/materia-constants')
		require('../services/srv-admin')
		require('../services/srv-widget')
		require('../services/srv-selectedwidget')
		require('../services/srv-datetime')
		require('../services/srv-user')
		require('./ctrl-alert')
		require('ngmodal/dist/ng-modal')
		require('./ctrl-my-widgets-settings')

		inject((_$controller_, _$q_, _AdminSrv_, _$rootScope_) => {
			$controller = _$controller_
			$q = _$q_
			AdminSrv = _AdminSrv_
			$rootScope = _$rootScope_
		})

		$scope = {
			$watch: jest.fn(),
			$on: jest.fn(),
			selected: {
				widget: {
					id: 1,
					is_embedded: 1,
					embedded_only: 1,
					is_student_made: 1,
					attempts: 1,
					guest_access: 1,
					student_access: 1,
					open_at: 1,
					close_at: 1,
				},
			},
		}

		Namespace('Materia.Coms.Json').send = jest.fn()

		var controller = $controller('MyWidgetsSettingsController', { $scope })
	})

	it('defines expected scope vars', () => {
		expect($scope.error).toBeDefined()
		expect($scope.dateError).toBeDefined()
		expect($scope.timeError).toBeDefined()
		expect($scope.setupSlider).toBeDefined()
		expect($scope.setupDatePickers).toBeDefined()
		expect($scope.toggleNormalAccess).toBeDefined()
		expect($scope.toggleGuestAccess).toBeDefined()
		expect($scope.toggleEmbeddedOnly).toBeDefined()
		expect($scope.dateFormatter).toBeDefined()
		expect($scope.checkTime).toBeDefined()
		expect($scope.changeSlider).toBeDefined()
		expect($scope.updateSlider).toBeDefined()
		expect($scope.parseSubmittedInfo).toBeDefined()
		expect($scope.changeAvailability).toBeDefined()
		expect($scope.alert).toBeDefined()
		expect($scope.attemptsSliderValue).toBeDefined()
	})

	it('accepts times in 24 hour format', () => {
		expect($scope.parseSubmittedInfo).toBeDefined()
		$scope.availability[0].time = '22:00'
		$scope.parseSubmittedInfo()
		expect($scope.timeError[0]).toBeFalsy()
	})

	it('rejects times outside of 24 hour format', () => {
		expect($scope.parseSubmittedInfo).toBeDefined()
		$scope.availability[0].time = '25:00'
		$scope.parseSubmittedInfo()
		expect($scope.timeError[0]).toBeTruthy()
	})
})
