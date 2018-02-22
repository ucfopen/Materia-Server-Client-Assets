describe('scoreData Directive', function() {
	let _scope
	let _compile
	let _q
	let _selectedWidgetSrv

	beforeEach(() => {
		require('../materia-constants')
		require('../services/srv-selectedwidget')
		require('./dir-scoredata.js')

		inject(function($compile, $rootScope, selectedWidgetSrv, $q) {
			_selectedWidgetSrv = selectedWidgetSrv
			_compile = $compile
			_scope = $rootScope.$new()
			_q = $q
		})
	})

	it('is initialized on the element', function() {
		let data = { '2050 Summer': { table1: null, table2: null } }

		let deferred = _q.defer()
		jest.spyOn(_selectedWidgetSrv, 'getStorageData').mockImplementation(() => deferred.promise)

		jest.spyOn(_selectedWidgetSrv, 'getMaxRows').mockImplementation(() => 777)

		let html = '<div score-data id="data_66" data-semester="2050 Summer" data-has-storage="true" >'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		deferred.resolve(data)
		_scope.$apply()

		expect(_scope.tables).toMatchObject({ table1: null, table2: null })
		expect(_scope.MAX_ROWS).toBe(777)
		expect(_scope.tableNames).toMatchObject(['table1', 'table2'])
		expect(_scope.selectedTable).toBe('table1')
	})
})
