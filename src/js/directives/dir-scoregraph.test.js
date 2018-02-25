describe('scoreGraph Directive', function() {
	let _scope
	let _compile
	let _timeout
	let mock1 = jest.fn(cb => {
		cb({ map: { '6': { distribution: true } } })
	})
	let mock2 = jest.fn(() => ({ then: mock1 }))
	let mock3 = jest.fn()

	beforeEach(() => {
		jest.useFakeTimers()
		angular.module('materia').service('selectedWidgetSrv', () => ({ getScoreSummaries: mock2 }))

		require('../materia-namespace')
		require('./dir-scoregraph.js')

		inject(function($compile, $rootScope, $timeout) {
			_compile = $compile
			_scope = $rootScope.$new()
			_timeout = $timeout
		})

		Namespace('Materia.MyWidgets.Statistics').createGraph = mock3
	})

	it('is initialized on the element', function() {
		let html = '<div score-graph id="chart_6" >text</div>'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(mock1).toHaveBeenCalledTimes(1)
		expect(mock2).toHaveBeenCalledTimes(1)
		expect(mock3).toHaveBeenCalledTimes(0)
		jest.runAllTimers()
		expect(mock3).toHaveBeenCalledTimes(1)
		expect(mock3).toHaveBeenCalledWith('chart_6', true)
	})
})
