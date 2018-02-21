describe('fancybox Directive', function() {
	let _scope
	let _compile
	let _timeout
	let mockFancyBox = jest.fn()
	mockFancyBox.resize = jest.fn()

	beforeEach(() => {
		require('./dir-fancybox')
		inject(function($compile, $rootScope, $timeout) {
			_compile = $compile
			_scope = $rootScope.$new()
			_timeout = $timeout
		})

		// mock jquery and fancybox plugin
		global.$ = jest.fn(() => ({ fancybox: mockFancyBox }))
		global.$.fancybox = mockFancyBox
	})

	it('is rendered and resized', function() {
		expect(mockFancyBox).toHaveBeenCalledTimes(0)
		let scopeApplySpy = jest.spyOn(_scope, '$apply')
		let html = '<a fancybox>text</a>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(compiled.html()).toBe('text')
		expect(mockFancyBox).toHaveBeenCalledTimes(1)
		// execute fancybox.onComplete()
		mockFancyBox.mock.calls[0][0].onComplete()

		// make sure resize and apply are called
		expect(mockFancyBox.resize).toHaveBeenCalledTimes(0)
		expect(scopeApplySpy).toHaveBeenCalledTimes(0)
		_timeout.flush()
		expect(mockFancyBox.resize).toHaveBeenCalledTimes(1)
		expect(scopeApplySpy).toHaveBeenCalledTimes(1)
	})
})
