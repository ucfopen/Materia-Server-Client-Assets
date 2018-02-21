describe('ngEnter Directive', function() {
	let _scope
	let _compile

	beforeEach(() => {
		require('./dir-ngenter')
		inject(function($compile, $rootScope) {
			_compile = $compile
			_scope = $rootScope.$new()
		})
	})

	it('executes callback on enter key', function() {
		_scope.enterHandler = jest.fn()
		var element = angular.element('<div class="okyea" ng-enter="enterHandler()">test</div>')
		var compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(compiled.html()).toBe('test')
		expect(_scope.enterHandler).not.toHaveBeenCalled()
		compiled.triggerHandler({ type: 'keydown', which: 13 })
		compiled.triggerHandler({ type: 'keypress', which: 13 })
		expect(_scope.enterHandler).toHaveBeenCalledTimes(2)
	})
})
