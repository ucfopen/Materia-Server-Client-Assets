describe('adminSrv', function() {
	var _service
	var postMock
	var getMock

	beforeEach(() => {
		require('../materia-namespace')
		require('./srv-admin')

		inject(function(adminSrv) {
			_service = adminSrv
		})

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
		let cb = { id: 1 }
		_service.getWidgets(cb)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/widgets', cb)
	})

	it('saveWidget calls api', () => {
		let widget = { id: 99 }
		let cb = { id: 1 }
		_service.saveWidget(widget, cb)
		expect(postMock).toHaveBeenLastCalledWith('/api/admin/widget/99', widget, cb)
	})

	it('searchUsers calls api', () => {
		let cb = { id: 1 }
		_service.searchUsers('test', cb)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/user_search/test', cb)
	})

	it('lookupUser calls api', () => {
		let cb = { id: 1 }
		_service.lookupUser(6, cb)
		expect(getMock).toHaveBeenLastCalledWith('/api/admin/user/6', cb)
	})

	it('saveUser calls api', () => {
		let user = { id: 9, beepBoop: true }
		let cb = { id: 1 }
		_service.saveUser(user, cb)
		expect(postMock).toHaveBeenLastCalledWith('/api/admin/user/9', user, cb)
	})
})
