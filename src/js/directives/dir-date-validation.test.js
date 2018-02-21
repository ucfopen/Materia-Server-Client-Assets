describe('dateValidation Directive', function() {
	let _scope
	let _compile
	let _timeout

	beforeEach(() => {
		require('./dir-date-validation')
		inject(function($compile, $rootScope, $timeout) {
			_compile = $compile
			_scope = $rootScope.$new()
			_timeout = $timeout
		})
	})

	it('valid dates render with valid class', function() {
		_scope.sampleDate = 'date'
		let scopeApplySpy = jest.spyOn(_scope, '$apply')
		let html =
			'<input type="text" ng-model="sampleDate" date-validation validate="date" value="12/12/06"/>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()
		expect(compiled.hasClass('ng-valid')).toBe(true)
	})

	it('replaces invalid characters for date type', function() {
		_scope.model = { sampleDate: 'initialValue' }

		let html =
			'<form name="form"><input name="mydate" type="text" ng-model="model.sampleDate" date-validation validate="date"/></form>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		let form = _scope.form
		form.mydate.$setViewValue('qwertyuioplkjhgfdsazxcvbnm<>?:"{}=-+_0987654321!@#$%^&*()')
		_scope.$digest()
		expect(_scope.model.sampleDate).toBe('0987654321')
		expect(form.mydate.$valid).toBe(true)
	})

	it('replaces invalid characters for time type', function() {
		_scope.model = { sampleDate: 'initialValue' }

		let html =
			'<form name="form"><input name="mydate" type="text" ng-model="model.sampleDate" date-validation validate="time"/></form>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		let form = _scope.form
		form.mydate.$setViewValue('qwertyuioplkjhgfdsazxcvbnm<>?:"{}=-+_0987654321!@#$%^&*()')
		_scope.$digest()
		expect(_scope.model.sampleDate).toBe(':0987654321')
		expect(form.mydate.$valid).toBe(true)
	})
})
