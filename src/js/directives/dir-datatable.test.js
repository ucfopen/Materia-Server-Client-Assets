describe('datatable Directive', function() {
	let _scope
	let _compile
	let _timeout
	let DataTable = jest.fn()

	beforeEach(() => {
		require('./dir-datatable')
		inject(function($compile, $rootScope, $timeout) {
			_compile = $compile
			_scope = $rootScope.$new()
			_timeout = $timeout
		})

		// mock jquery and fancybox plugin
		global.$ = jest.fn(() => ({ DataTable }))
	})

	it('is initialized on the element', function() {
		let scopeApplySpy = jest.spyOn(_scope, '$apply')
		let html = '<div datatable>text</div>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(compiled.html()).toBe('text')
		expect(DataTable).toHaveBeenCalledTimes(0)
		expect(global.$).toHaveBeenCalledTimes(0)
		_timeout.flush()
		expect(DataTable).toHaveBeenCalledTimes(1)
		expect(global.$).toHaveBeenCalledTimes(1)
	})
})
