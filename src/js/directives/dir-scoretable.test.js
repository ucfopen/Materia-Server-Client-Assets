describe('scoreTable Directive', function() {
	let _scope
	let _compile
	let _window
	let _q
	let _selectedWidgetSrv
	let data = [
		{
			id: 'one',
			time: '1519272328',
			done: '1',
			perc: '99',
			elapsed: '999',
			qset_id: '7',
			user_id: '2',
			first: 'Ian',
			last: 'Turgeon',
			username: '~author'
		},
		{
			id: 'two',
			time: '1519372329',
			done: '0',
			perc: '75',
			elapsed: '12',
			qset_id: '45',
			user_id: '5',
			first: 'Corey',
			last: 'Peterson',
			username: '~author2'
		}
	]
	let expected = {
		'2': {
			name: 'Turgeon, Ian',
			scores: {
				'1519272328': {
					complete: '1',
					date: 'Wed Feb 21 2018',
					elapsed: '16m 39s',
					id: 'one',
					percent: '99'
				}
			},
			uid: '2'
		},
		'5': {
			name: 'Peterson, Corey',
			scores: {
				'1519372329': {
					complete: '0',
					date: 'Fri Feb 23 2018',
					elapsed: '12s',
					id: 'two',
					percent: 0
				}
			},
			uid: '5'
		}
	}

	beforeEach(() => {
		require('../materia-constants')
		require('../services/srv-selectedwidget')
		require('./dir-scoretable')

		inject(function($compile, $rootScope, selectedWidgetSrv, $q, $window) {
			_selectedWidgetSrv = selectedWidgetSrv
			_compile = $compile
			_scope = $rootScope.$new()
			_q = $q
			_window = $window
		})

		let deferred = _q.defer()
		jest.spyOn(_selectedWidgetSrv, 'getSelectedId').mockImplementation(() => 6)
		jest
			.spyOn(_selectedWidgetSrv, 'getPlayLogsForSemester')
			.mockImplementation(() => deferred.promise)

		expect(_scope.selectedUser).not.toBeDefined()
		expect(_scope.setSelectedUser).not.toBeDefined()
		expect(_scope.showScorePage).not.toBeDefined()
		expect(_scope.searchStudentActivity).not.toBeDefined()
		let html = '<div score-table data-term="TERM" data-year="2015"></div>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		deferred.resolve(data)
		_scope.$apply()
	})

	it('is initialized on the element', function() {
		expect(_scope.selectedUser).toBeNull()
		expect(_scope.users).toMatchObject(expected)
		expect(_scope.setSelectedUser).toBeDefined()
		expect(_scope.showScorePage).toBeDefined()
		expect(_scope.searchStudentActivity).toBeDefined()
	})

	it('setSelectedUser sets selectedUser object as expected', function() {
		expect(_scope.selectedUser).toBeNull()
		_scope.setSelectedUser(5)
		expect(_scope.selectedUser).toMatchObject(expected['5'])
	})

	it('showScorePage opens the expected url', function() {
		_window.open = jest.fn()
		global.BASE_URL = 'some_url'
		_scope.showScorePage('two')
		expect(_window.open).toHaveBeenLastCalledWith('some_urlscores/6/#single-two')
	})

	it('searchStudentActivity locates users', function() {
		_scope.searchStudentActivity('Ian')
		expect(_scope.users).toMatchObject({ '2': expected['2'] })

		// finds neither
		_scope.searchStudentActivity('~author')
		expect(_scope.users).toMatchObject({})

		_scope.searchStudentActivity('Peterson')
		expect(_scope.users).toMatchObject({ '5': expected['5'] })

		// finds all
		_scope.searchStudentActivity('')
		expect(_scope.users).toMatchObject(expected)
	})

	it('searchStudentActivity resets selecteUser', function() {
		_scope.setSelectedUser(5)
		expect(_scope.selectedUser).toMatchObject(expected['5'])
		_scope.searchStudentActivity('Ian')
		expect(_scope.users).toMatchObject({ '2': expected['2'] })
		expect(_scope.selectedUser).toBeNull()
	})
})
