describe('adminSrv', () => {
	var $rootScope
	var _service
	var postMock
	var getMock
	var mockPlease
	var $q

	let mockJsonPromiseOnce = (mock, result) => {
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
		require('./srv-admin')

		inject(function(adminSrv, _$q_, _$rootScope_) {
			_service = adminSrv
			$q = _$q_
			$rootScope = _$rootScope_
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
		Namespace('Materia.Coms.Json').post = postMock = jest.fn()
		Namespace('Materia.Coms.Json').get = getMock = jest.fn()
		postMock.mockClear()
		getMock.mockClear()
	})

	it('defines expected methods', () => {
		expect(_service.getWidgets).toBeDefined()
		expect(_service.saveWidget).toBeDefined()
		expect(_service.searchUsers).toBeDefined()
		expect(_service.lookupUser).toBeDefined()
		expect(_service.saveUser).toBeDefined()
	})

	it('getWidgets calls api', () => {
		let mockResults = { id: 1 }
		let myCallBack = jest.fn()
		mockJsonPromiseOnce(getMock, mockResults)
		_service.getWidgets(myCallBack)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/widgets')
		$rootScope.$digest() // execute coms callback
		expect(myCallBack).toHaveBeenLastCalledWith(mockResults)
	})

	it('saveWidget calls api', () => {
		let widget = { id: 99 }
		let mockResult = { id: 1 }
		let myCallBack = jest.fn()
		mockJsonPromiseOnce(postMock, mockResult)
		_service.saveWidget(widget, myCallBack)
		expect(postMock).toHaveBeenLastCalledWith('/api/admin/widget/99', widget)
		$rootScope.$digest() // execute coms callback
		expect(myCallBack).toHaveBeenLastCalledWith(mockResult)
	})

	it('searchUsers calls api', () => {
		let mockResult = { id: 1 }
		let myCallBack = jest.fn()
		mockJsonPromiseOnce(getMock, mockResult)
		_service.searchUsers('test', myCallBack)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/user_search/test')
		$rootScope.$digest() // execute coms callback
		expect(myCallBack).toHaveBeenLastCalledWith(mockResult)
	})

	it('lookupUser calls api', () => {
		let mockResult = { id: 1 }
		let myCallBack = jest.fn()
		mockJsonPromiseOnce(getMock, mockResult)
		_service.lookupUser(6, myCallBack)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/user/6')
		$rootScope.$digest() // execute coms callback
		expect(myCallBack).toHaveBeenLastCalledWith(mockResult)
	})

	it('saveUser calls api', () => {
		let user = { id: 9, beepBoop: true }
		let mockResult = { id: 1 }
		let myCallBack = jest.fn()
		mockJsonPromiseOnce(postMock, mockResult)
		_service.saveUser(user, myCallBack)
		expect(postMock).toHaveBeenLastCalledWith('/api/admin/user/9', user)
		$rootScope.$digest() // execute coms callback
		expect(myCallBack).toHaveBeenLastCalledWith(mockResult)
	})
})
