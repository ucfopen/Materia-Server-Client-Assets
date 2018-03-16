describe('scoreTable Directive', function() {
	let $scope
	let $compile
	let $window
	let $q
	let selectedWidgetSrv
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

		inject(function(_$compile_, _$rootScope_, _selectedWidgetSrv_, _$q_, _$window_) {
			selectedWidgetSrv = _selectedWidgetSrv_
			$compile = _$compile_
			$scope = _$rootScope_.$new()
			$q = _$q_
			$window = _$window_
		})

		let deferred = $q.defer()
		jest.spyOn(selectedWidgetSrv, 'getSelectedId').mockImplementation(() => 6)
		jest
			.spyOn(selectedWidgetSrv, 'getPlayLogsForSemester')
			.mockImplementation(() => deferred.promise)

		expect($scope.selectedUser).not.toBeDefined()
		expect($scope.setSelectedUser).not.toBeDefined()
		expect($scope.showScorePage).not.toBeDefined()
		expect($scope.searchStudentActivity).not.toBeDefined()
		let html = '<div score-table data-term="TERM" data-year="2015"></div>'
		let element = angular.element(html)
		let compiled = $compile(element)($scope)
		$scope.$digest()

		deferred.resolve(data)
		$scope.$apply()
	})

	it('is initialized on the element', function() {
		expect($scope.selectedUser).toBeNull()
		expect($scope.users).toMatchObject(expected)
		expect($scope.setSelectedUser).toBeDefined()
		expect($scope.showScorePage).toBeDefined()
		expect($scope.searchStudentActivity).toBeDefined()
	})

	it('setSelectedUser sets selectedUser object as expected', function() {
		expect($scope.selectedUser).toBeNull()
		$scope.setSelectedUser(5)
		expect($scope.selectedUser).toMatchObject(expected['5'])
	})

	it('showScorePage opens the expected url', function() {
		$window.open = jest.fn()
		global.BASE_URL = 'some_url'
		$scope.showScorePage('two')
		expect($window.open).toHaveBeenLastCalledWith('some_urlscores/6/#single-two')
	})

	it('searchStudentActivity locates users', function() {
		$scope.searchStudentActivity('Ian')
		expect($scope.users).toMatchObject({ '2': expected['2'] })

		// finds neither
		$scope.searchStudentActivity('~author')
		expect($scope.users).toMatchObject({})

		$scope.searchStudentActivity('Peterson')
		expect($scope.users).toMatchObject({ '5': expected['5'] })

		// finds all
		$scope.searchStudentActivity('')
		expect($scope.users).toMatchObject(expected)
	})

	it('searchStudentActivity resets selecteUser', function() {
		$scope.setSelectedUser(5)
		expect($scope.selectedUser).toMatchObject(expected['5'])
		$scope.searchStudentActivity('Ian')
		expect($scope.users).toMatchObject({ '2': expected['2'] })
		expect($scope.selectedUser).toBeNull()
	})
})
