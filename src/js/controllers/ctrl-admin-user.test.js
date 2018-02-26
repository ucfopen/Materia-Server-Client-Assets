describe('adminUserController', function() {
	var _adminSrv
	var _userServ
	var _scope
	var sendMock
	var _q
	var $controller
	var mockWindow

	beforeEach(() => {
		// MOCK some services
		_adminSrv = {
			lookupUser: jest.fn(),
			saveUser: jest.fn(),
			searchUsers: jest.fn()
		}
		_userServ = {
			getAvatar: jest.fn(() => 'avatar')
		}
		let app = angular.module('materia')
		app.factory('adminSrv', () => _adminSrv)
		app.factory('userServ', () => _userServ)

		// MOCK $window
		mockWindow = {
			addEventListener: jest.fn(),
			location: {
				reload: jest.fn()
			}
		}
		app.factory('$window', () => mockWindow)

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
			none: true,
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

	it('search sends args to service and updates scope', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		$scope.search('one')
		expect(_adminSrv.searchUsers).toHaveBeenCalledTimes(1)
		expect(_adminSrv.searchUsers).toHaveBeenLastCalledWith('one', expect.anything())

		$scope.search('one two three')
		expect(_adminSrv.searchUsers).toHaveBeenCalledTimes(2)
		expect(_adminSrv.searchUsers).toHaveBeenLastCalledWith('one two three', expect.anything())
	})

	it('search sends doesnt search twice with the same input', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		$scope.search('one')
		$scope.search('one')
		expect(_adminSrv.searchUsers).toHaveBeenCalledTimes(1)
	})

	it('search responds to api errors with an alert and a location change', () => {
		global.alert = jest.fn()
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		_adminSrv.searchUsers.mockImplementationOnce((name, cb) => {
			cb({ halt: true, msg: 'oh no' })
		})

		$scope.search('one')
		expect(alert).toHaveBeenCalledWith('oh no')
		expect(mockWindow.location.reload).toHaveBeenCalledWith(true)
	})

	it('search handles no matches', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		_adminSrv.searchUsers.mockImplementationOnce((name, cb) => {
			cb([])
		})

		$scope.search('one')
		expect($scope.searchResults.none).toBe(true)
		expect($scope.searchResults.show).toBe(true)
		expect($scope.searchResults.matches).toMatchObject([])
	})

	it('search short cuts empty string', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		_adminSrv.searchUsers.mockImplementationOnce((name, cb) => {
			cb([])
		})

		$scope.search('one')
		$scope.search('')
		expect($scope.searchResults.none).toBe(true)
		expect($scope.searchResults.show).toBe(false)
		expect($scope.searchResults.matches).toMatchObject([])
	})

	it('search shows sorted matches', () => {
		var $scope = { $watch: jest.fn(), $apply: jest.fn() }
		var controller = $controller('adminUserController', { $scope })

		_adminSrv.searchUsers.mockImplementationOnce((name, cb) => {
			cb([{ first: 'z', last: 'z' }, { first: 'a', last: 'a' }])
		})

		let expected = [
			{
				first: 'a',
				gravatar: 'avatar',
				last: 'a'
			},
			{
				first: 'z',
				gravatar: 'avatar',
				last: 'z'
			}
		]

		$scope.search('one')
		expect($scope.searchResults.none).toBe(false)
		expect($scope.searchResults.show).toBe(true)
		expect($scope.$apply).toHaveBeenCalled()
		expect($scope.searchResults.matches).toMatchObject(expected)
	})
})
