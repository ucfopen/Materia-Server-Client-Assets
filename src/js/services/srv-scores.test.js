describe('scoreSrv', () => {
	var _service
	var postMock

	beforeEach(() => {
		require('../materia-namespace')
		require('./srv-scores')

		inject(function(scoreSrv) {
			_service = scoreSrv
		})

		Namespace('Materia.Coms.Json').send = postMock = jest.fn()
		postMock.mockClear()
	})

	it('defines expected methods', () => {
		expect(_service.getWidgetInstanceScores).toBeDefined()
		expect(_service.getWidgetInstancePlayScores).toBeDefined()
		expect(_service.getGuestWidgetInstanceScores).toBeDefined()
	})

	it('getWidgetInstanceScores calls api', () => {
		let cb = { id: 1 }
		_service.getWidgetInstanceScores(5, 'fff', cb)
		expect(postMock).toHaveBeenLastCalledWith('widget_instance_scores_get', [5, 'fff'], cb)
	})

	it('getWidgetInstancePlayScores calls api', () => {
		let cb = { id: 1 }
		_service.getWidgetInstancePlayScores(9, 88, cb)
		expect(postMock).toHaveBeenLastCalledWith('widget_instance_play_scores_get', [9, 88], cb)
	})

	it('getGuestWidgetInstanceScores calls api', () => {
		let cb = { id: 1 }
		_service.getGuestWidgetInstanceScores(23, 77, cb)
		expect(postMock).toHaveBeenLastCalledWith('guest_widget_instance_scores_get', [23, 77], cb)
	})
})
