describe('adminUserController', function() {
	var _adminSrv
	var _userServ
	var _scope
	var sendMock
	var _q
	var $controller

	beforeEach(() => {
		// MOCK some services
		_adminSrv = {
			lookupUser: jest.fn(),
			saveUser: jest.fn()
		}
		_userServ = {}
		let app = angular.module('materia')
		app.factory('adminSrv', () => _adminSrv)
		app.factory('userServ', () => _userServ)

		require('../materia-namespace')
		require('../materia-constants')
		require('./ctrl-admin-user')

		inject(function($rootScope, $q, _$controller_) {
			_scope = $rootScope.$new()
			_q = $q
			$controller = _$controller_
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
		Namespace('Materia.User').getCurrentUser = getCurrentUserMock = jest.fn()
		Namespace('Materia.Image').iconUrl = jest.fn(() => 'iconurl')
	})

	it('defines expected scope vars', () => {
		var $scope = { $watch: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		expect($scope.inputs).toMatchObject({ userSearchInput: '' })
		expect($scope.searchResults).toMatchObject({
			show: false,
			searching: false,
			matches: []
		})
		expect($scope.selectedUser).toBeNull()
		expect($scope.additionalData).toBeNull()
		expect($scope.errorMessage).toMatchObject([])
		expect(typeof $scope.search).toBe('function')
		expect(typeof $scope.searchMatchClick).toBe('function')
		expect(typeof $scope.save).toBe('function')
		expect(typeof $scope.deselectUser).toBe('function')
	})

	it('defines watches search input changes', () => {
		var $scope = { $watch: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		expect($scope.$watch).toHaveBeenCalledWith('inputs.userSearchInput', expect.anything())
	})

	it('deselectUser resets scope vars', () => {
		var $scope = { $watch: jest.fn() }
		var controller = $controller('adminUserController', { $scope })
		$scope.errorMessage = 'test'
		$scope.selectedUser = 'test'
		$scope.additionalData = 'test'
		$scope.deselectUser()

		expect($scope.errorMessage).toMatchObject([])
		expect($scope.selectedUser).toBe(null)
		expect($scope.additionalData).toBe(null)
	})

	it('searchMatchClick looks up a user and updates the scope', () => {
		let lookupUser = {
			instances_available: [{ icon: 3, widget: { dir: '999' } }],
			instances_played: [{ id: 9, name: 'test', widget: { dir: 'somedir' } }]
		}
		let instances_played = [
			{
				icon: 'iconurl',
				id: 9,
				name: 'test',
				plays: [
					{
						id: 9,
						name: 'test',
						widget: {
							dir: 'somedir'
						}
					}
				],
				widget: { dir: 'somedir' }
			}
		]

		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })
		_adminSrv.lookupUser.mockImplementationOnce((id, cb) => {
			cb(lookupUser)
		})

		$scope.searchMatchClick({ id: 5 })

		expect(_adminSrv.lookupUser).toHaveBeenCalledWith(5, expect.anything())
		expect($scope.$apply).toHaveBeenCalledTimes(1)
		expect($scope.additionalData.instances_played).toMatchObject(instances_played)
	})

	it('save sends args to service and updates scope', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })
		_adminSrv.saveUser.mockImplementationOnce((data, cb) => {
			cb({ id: true })
		})

		$scope.selectedUser = {
			id: 1,
			email: 'email',
			is_student: 'false',
			profile_fields: {
				notify: 'notify',
				useGravatar: 'true'
			}
		}

		$scope.save()
		expect(_adminSrv.saveUser).toHaveBeenCalledWith(expect.any(Object), expect.anything())
		expect(_adminSrv.saveUser.mock.calls[0][0].id).toBe(1)
		expect(_adminSrv.saveUser.mock.calls[0][0].is_student).toBe(false)
		expect(_adminSrv.saveUser.mock.calls[0][0].useGravatar).toBe(true)
		expect($scope.errorMessage).toMatchObject([])
		expect($scope.$apply).toHaveBeenCalledTimes(1)
	})

	it('save sets errors', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })
		_adminSrv.saveUser.mockImplementationOnce((data, cb) => {
			cb({ id: 'this was an error' })
		})

		$scope.selectedUser = {
			id: 1,
			email: 'email',
			is_student: false,
			profile_fields: {
				notify: 'notify',
				useGravatar: 'true'
			}
		}

		$scope.save()
		expect($scope.errorMessage).toMatchObject(['this was an error'])
		expect($scope.$apply).toHaveBeenCalledTimes(1)
	})

	it.skip('search sends args to service and updates scope', () => {})
})
