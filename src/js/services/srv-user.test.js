describe('userServ', function() {
	var _service
	var _compile
	var _scope
	var sendMock
	var getCurrentUserMock
	var _q

	beforeEach(() => {
		require('../materia-namespace')
		require('../materia-constants')
		require('./srv-user')

		inject(function($rootScope, userServ, $q) {
			_scope = $rootScope
			_service = userServ
			_q = $q
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
		Namespace('Materia.User').getCurrentUser = getCurrentUserMock = jest.fn()
	})

	it('defines expected methods', function() {
		expect(_service.getCurrentUser).toBeDefined()
		expect(_service.getCurrentUserAvatar).toBeDefined()
		expect(_service.getAvatar).toBeDefined()
		expect(_service.updateSettings).toBeDefined()
		expect(_service.get).toBeDefined()
		expect(_service.set).toBeDefined()
		expect(_service.checkValidSession).toBeDefined()
	})

	it('getCurrentUser returns a user builds a default user', () => {
		expect(_service.getCurrentUser('default')).toMatchObject({
			avatar: '',
			loggedIn: false,
			name: '',
			notify: false,
			role: 'Student'
		})
	})

	it('getCurrentUser returns a user from the dom', () => {
		jest.spyOn(global.document, 'getElementById').mockImplementationOnce(arg => {
			return {
				getAttribute: jest
					.fn()
					.mockImplementationOnce(() => 'name')
					.mockImplementationOnce(() => 'avatar')
					.mockImplementationOnce(() => 'true')
					.mockImplementationOnce(() => 'role')
					.mockImplementationOnce(() => 'notify')
			}
		})
		expect(_service.getCurrentUser('dom')).toMatchObject({
			avatar: 'avatar',
			loggedIn: true,
			name: 'name',
			notify: false,
			role: 'role'
		})
		global.document.getElementById.mockRestore()
	})

	it('getCurrentUser returns a user from the dom with no argument', () => {
		jest.spyOn(global.document, 'getElementById').mockImplementationOnce(arg => {
			return { getAttribute: jest.fn(() => '') }
		})
		expect(_service.getCurrentUser()).toMatchObject({
			avatar: '',
			loggedIn: false,
			name: '',
			notify: false,
			role: ''
		})
		global.document.getElementById.mockRestore()
	})

	it('getCurrentUser caches the current user', () => {
		jest.spyOn(global.document, 'getElementById').mockImplementationOnce(arg => {
			return { getAttribute: jest.fn(() => '') }
		})
		expect(_service.getCurrentUser()).toMatchObject({
			avatar: '',
			loggedIn: false,
			name: '',
			notify: false,
			role: ''
		})
		expect(global.document.getElementById).toHaveBeenCalledTimes(1)

		expect(_service.getCurrentUser()).toMatchObject({
			avatar: '',
			loggedIn: false,
			name: '',
			notify: false,
			role: ''
		})
		expect(global.document.getElementById).toHaveBeenCalledTimes(1)

		global.document.getElementById.mockRestore()
	})

	it('getCurrentUserAvatar changes the size as expected', () => {
		let user = _service.getCurrentUser('')
		user.avatar = 'avatar?s=1'
		user.loggedIn = true
		user.name = 'name'
		user.notify = false
		user.role = 'role'

		expect(_service.getCurrentUserAvatar()).toBe('avatar?s=24')
		expect(_service.getCurrentUserAvatar(88)).toBe('avatar?s=88')
	})

	it('getAvatar changes the size as expected', () => {
		let user = { avatar: 'avatar?s=7777' }
		expect(_service.getAvatar(user)).toBe('avatar?s=24')
		expect(_service.getAvatar(user, 900)).toBe('avatar?s=900')
	})

	it('updateSettings changes the user as expected', () => {
		let user = _service.getCurrentUser('')
		user.avatar = 'avatar?s=1'
		user.loggedIn = true
		user.name = 'name'
		user.notify = false
		user.role = 'role'

		expect(_service.getCurrentUser()).toMatchObject({
			avatar: 'avatar?s=1',
			loggedIn: true,
			name: 'name',
			notify: false,
			role: 'role'
		})
		expect(_service.updateSettings('name', 'newname')).toBe('newname')
		expect(_service.getCurrentUser()).toMatchObject({
			avatar: 'avatar?s=1',
			loggedIn: true,
			name: 'newname',
			notify: false,
			role: 'role'
		})
		expect(_service.updateSettings('avatar', 'newavatar')).toBe('newavatar')
		expect(_service.getCurrentUser()).toMatchObject({
			avatar: 'newavatar',
			loggedIn: true,
			name: 'newname',
			notify: false,
			role: 'role'
		})
		expect(_service.updateSettings('loggedIn', 'weirdvalue')).toBe('weirdvalue')
		expect(_service.getCurrentUser()).toMatchObject({
			avatar: 'newavatar',
			loggedIn: 'weirdvalue',
			name: 'newname',
			notify: false,
			role: 'role'
		})
	})

	it('get returns a promise', () => {
		getCurrentUserMock.mockImplementationOnce(cb => {
			cb({ avatar: '', loggedIn: false, name: '', notify: false, role: '' })
		})
		// when there's no cache
		expect(_service.get()).toHaveProperty('$$state')
		// and again after it's cached
		expect(_service.get()).toHaveProperty('$$state')
	})

	it('get resolves after getting the current user', () => {
		let user = { avatar: '', loggedIn: false, name: '', notify: false, role: '' }
		getCurrentUserMock.mockImplementationOnce(cb => {
			cb(user)
		})

		let promiseSpy = jest.fn()
		_service.get().then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalledWith(user)
	})

	it('get caches the user', () => {
		let user = { avatar: '', loggedIn: false, name: '', notify: false, role: '' }
		_service.set(user)

		let promiseSpy = jest.fn()
		_service.get().then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalledWith(user)
		expect(getCurrentUserMock).toHaveBeenCalledTimes(0)
	})

	it('set updates the current user', () => {
		let user = { avatar: '', loggedIn: false, name: '', notify: false, role: '' }
		_service.set(user)

		let promiseSpy = jest.fn()
		_service.get().then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalledWith(user)
	})

	it('set calls $broadcast', () => {
		let user = { avatar: '', loggedIn: false, name: '', notify: false, role: '' }
		_scope.$broadcast = jest.fn()
		_service.set(user)
		expect(_scope.$broadcast).toHaveBeenCalledWith('user.update')
	})

	it('checkValidSession returns a promise', () => {
		expect(_service.checkValidSession()).toHaveProperty('$$state')
	})

	it('checkValidSession calls api', () => {
		_service.checkValidSession('some-role')
		expect(sendMock).toHaveBeenCalledWith('session_author_verify', ['some-role'], expect.anything())
	})

	it('checkValidSession calls api', () => {
		Materia.Coms.Json.send.mockImplementationOnce((name, data, cb) => cb('true'))

		let promiseSpy = jest.fn()
		_service.checkValidSession('some-role').then(promiseSpy)
		_scope.$digest()

		expect(promiseSpy).toHaveBeenCalledWith('true')
	})
})
