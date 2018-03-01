describe('fancybox Directive', function() {
	let $scope
	let $compile
	let $timeout
	let mockFancyBox = jest.fn()
	let mockPlease
	mockFancyBox.resize = jest.fn()

	beforeEach(() => {
		mockPlease = { $apply: jest.fn() }
		let app = angular.module('materia')
		app.factory('Please', () => mockPlease)
		require('./dir-fancybox')
		inject(function(_$compile_, _$rootScope_, _$timeout_) {
			$compile = _$compile_
			$scope = _$rootScope_.$new()
			$timeout = _$timeout_
		})

		// mock jquery and fancybox plugin
		global.$ = jest.fn(() => ({ fancybox: mockFancyBox }))
		global.$.fancybox = mockFancyBox
	})

	it('is rendered and resized', () => {
		expect(mockFancyBox).toHaveBeenCalledTimes(0)
		let scopeApplySpy = jest.spyOn($scope, '$apply')
		let html = '<a fancybox>text</a>'
		let element = angular.element(html)
		let compiled = $compile(element)($scope)
		$scope.$digest()

		expect(compiled.html()).toBe('text')
		expect(mockFancyBox).toHaveBeenCalledTimes(1)
		// execute fancybox.onComplete()
		mockFancyBox.mock.calls[0][0].onComplete()

		// make sure resize and apply are called
		expect(mockFancyBox.resize).toHaveBeenCalledTimes(0)
		expect(mockPlease.$apply).toHaveBeenCalledTimes(0)
		$timeout.flush()
		expect(mockFancyBox.resize).toHaveBeenCalledTimes(1)
		expect(mockPlease.$apply).toHaveBeenCalledTimes(1)
	})
})
