describe('Materia.ScoreCore', () => {
	let ScoreCore
	let $q

	let mockWidget = {
		start: jest.fn(),
		update: jest.fn(),
		handleScoreDistribution: jest.fn()
	}

	let _onPostMessage

	beforeEach(() => {
		let app = angular.module('materia')
		inject(function(_$q_) {
			$q = _$q_
		})
		global.API_LINK = 'my_api_url'
		require('../materia-namespace')
		require('./materia.scorecore')
		ScoreCore = Namespace('Materia').ScoreCore
		global.fetch = jest.fn()
		jest.spyOn(window, 'addEventListener')
		jest.spyOn(parent, 'postMessage')
	})

	it('defines expected public methods', () => {
		expect(ScoreCore.hideResultsTable).toBeDefined()
		expect(ScoreCore.hideScoresOverview).toBeDefined()
		expect(ScoreCore.requestScoreDistribution).toBeDefined()
		expect(ScoreCore.setHeight).toBeDefined()
		expect(ScoreCore.start).toBeDefined()
	})

	it('sends a post message and adds an event listener for post messages when starting', () => {
		ScoreCore.start( mockWidget )
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"initialize"}', '*')
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"start","data":null}', '*')

		expect(window.addEventListener).toHaveBeenCalled()
		_onPostMessage = window.addEventListener.mock.calls[0][1]
	})

	it('sends a post message when hiding the results table', () => {
		ScoreCore.hideResultsTable()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"hideResultsTable"}', '*')
	})

	it('sends a post message when hiding the scores overview', () => {
		ScoreCore.hideScoresOverview()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"hideScoresOverview"}', '*')
	})

	it('sends a post message when requesting score distribution', () => {
		ScoreCore.requestScoreDistribution()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"requestScoreDistribution"}', '*')
	})

	it('does not send a request to set height if setHeight is given the current height', () => {
		ScoreCore.setHeight(-1)
		expect(parent.postMessage).not.toHaveBeenCalled()
	})

	it('sends a request to set height if setHeight is given the current height', () => {
		ScoreCore.setHeight(1)
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"setHeight","data":[1]}', '*')
	})

	it('sends a request to set height if setHeight is given nothing', () => {
		jest.spyOn(window, 'getComputedStyle').mockReturnValueOnce({height: 10})
		ScoreCore.setHeight()
		expect(parent.postMessage).toHaveBeenCalledWith('{"type":"setHeight","data":[10]}', '*')
	})

	it('initializes the widget when receiving an "initWidget" post message', () => {
		jest.spyOn(mockWidget, 'start')
		//fake data to make sure everything is passed into the widget in the right order
		let initData = [
			{
				data: [{qset: 'data'}],
				version: 0
			},
			{score: 'table'},
			{widget: 'instance'},
			false
		]
		_onPostMessage({
			data: JSON.stringify({
				type: 'initWidget',
				data: initData
			})
		})
		expect(mockWidget.start).toHaveBeenCalledWith(
			{widget: 'instance'}, //instance
			[{qset: 'data'}],     //qset.data
			{score: 'table'},     //scoreTable
			false,                //isPreview
			0                     //qset.version
		)
	})

	it('updates the widget when receiving an "update" post message', () => {
		jest.spyOn(mockWidget, 'update')
		//fake data to make sure everything is passed into the widget in the right order
		let updateData = [
			{
				data: [{qset: 'updated_data'}],
				version: 0
			},
			{score: 'updated_table'}
		]
		_onPostMessage({
			data: JSON.stringify({
				type: 'updateWidget',
				data: updateData
			})
		})
		expect(mockWidget.update).toHaveBeenCalledWith(
			[{qset: 'updated_data'}], //qset.data
			{score: 'updated_table'}  //scoreTable
		)
	})

	it('passes score distribution data to the widget when receiving an "update" post message', () => {
		jest.spyOn(mockWidget, 'handleScoreDistribution')
		_onPostMessage({
			data: JSON.stringify({
				type: 'scoreDistribution',
				data: [{score: 'distribution'}]
			})
		})
		expect(mockWidget.handleScoreDistribution).toHaveBeenCalledWith({score: 'distribution'})
	})

	it('throws an error when receiving an unexpected post message', () => {
		let postUnknown = () => {
			_onPostMessage({
				data: JSON.stringify({
					type: 'unknownMessageType',
					data: [null]
				})
			})
		}
		expect(postUnknown).toThrow('Error: Score Core received unknown post message: unknownMessageType');
	})
})
