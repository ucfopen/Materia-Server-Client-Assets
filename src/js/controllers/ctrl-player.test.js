describe('playerCtrl', () => {
	let _widgetSrv
	let _userServ
	let _scope
	let sendMock
	let $q
	let $controller
	let $window
	let $sce
	let _alert
	let $timeout
	let $document
	let $interval
	let $location

	let buildPostMessage = (type, data) => ({
		origin: 'https://crossdomain.com',
		data: JSON.stringify({
			type: type,
			data: data
		})
	})

	let mockSendPromiseOnce = result => {
		sendMock.mockImplementationOnce((n, arg, cb) => {
			const deferred = $q.defer()
			deferred.resolve(result)
			return deferred.promise
		})
	}

	beforeEach(() => {
		require('../materia-namespace')
		require('../materia-constants')

		_userServ = { getAvatar: jest.fn(() => 'avatar') }
		_widgetSrv = {
			getWidget: jest.fn()
		}
		_alert = {}
		let app = angular.module('materia')
		app.factory('widgetSrv', () => _widgetSrv)
		app.factory('userServ', () => _userServ)
		app.factory('Alert', () => _alert)

		require('./ctrl-player')

		inject(function(
			_$window_,
			$rootScope,
			_$q_,
			_$controller_,
			_$sce_,
			_$timeout_,
			_$document_,
			_$interval_,
			_$location_
		) {
			_scope = $rootScope.$new()
			$q = _$q_
			$controller = _$controller_
			$sce = _$sce_
			$timeout = _$timeout_
			$document = _$document_
			$window = _$window_
			$interval = _$interval_
			$location = _$location_
		})

		Namespace('Materia.Coms.Json').send = sendMock = jest.fn()
		Namespace('Materia.User').getCurrentUser = getCurrentUserMock = jest.fn()
		Namespace('Materia.Image').iconUrl = jest.fn(() => 'iconurl')
	})

	it('defines expected scope vars', () => {
		var $scope = { $watch: jest.fn() }
		var controller = $controller('playerCtrl', { $scope })

		expect($scope.isPreview).toBe(false)
		expect($scope.allowFullScreen).toBe(false)
		expect($scope.type).toBe(null)
		expect($scope.htmlPath).toBe(null)
		expect($scope.alert).toBe(_alert)
		expect(typeof $window.onbeforeunload).toBe('function')
	})

	it('successfully completes an entire play', () => {
		let widgetInstance = getMockApiData('widget_instances_get')[0]
		// mock dom elements
		let centerStyle = {
			width: -1,
			height: -1
		}

		let widgetStyle = {
			display: 'none'
		}

		let previewStyle = {
			width: -1
		}

		let embedStyle = {
			width: -1,
			height: -1
		}

		let mockHref = {
			href: null
		}

		let mockGetEl = jest
			.fn()
			.mockImplementationOnce(() => [
				{
					style: centerStyle
				}
			])
			.mockImplementationOnce(() => ({
				style: widgetStyle
			}))
			.mockImplementationOnce(() => [
				{
					style: previewStyle
				}
			])
		$document.getElementsByClassName = mockGetEl

		let mockPostMessageFromWidget = jest.fn()

		// mock the getElementsById needed for the widget
		let mockGetById = jest.fn().mockImplementationOnce(() => ({
			style: embedStyle,
			contentWindow: {
				postMessage: mockPostMessageFromWidget
			}
		}))
		$document.getElementsById = mockGetById

		// mock createElement needed for href resolution
		let mockCreateElement = jest.fn().mockImplementationOnce(() => mockHref)
		$document.createElement = mockCreateElement

		// mock getting the instance from the api
		_widgetSrv.getWidget.mockImplementationOnce(inst_id => ({
			then: jest.fn(cb => {
				cb(widgetInstance)
			})
		}))

		global.PLAY_ID = 'ff88gg'
		// mock question_set_get
		mockSendPromiseOnce({})

		jest.spyOn($window, 'addEventListener')

		// start the controller
		var $scope = { $watch: jest.fn(), inst_id: 'bb8', $apply: jest.fn() }
		var controller = $controller('playerCtrl', { $scope })

		$timeout.flush() // flush the render delay timeout

		// check all the widget initialization
		expect($scope.$apply).toHaveBeenCalledTimes(2)
		expect(_widgetSrv.getWidget).toHaveBeenLastCalledWith('bb8')
		expect($scope.allowFullScreen).toBe(false)
		expect(centerStyle.width).toBe('800px')
		expect(centerStyle.height).toBe('600px')
		expect(widgetStyle.display).toBe('block')
		expect(previewStyle.width).toBe('800px')
		expect(mockHref.href).toBe('https://crossdomain.com/')
		expect($window.addEventListener).toHaveBeenCalledWith('message', expect.anything(), false)

		// mock postmessages coming from the widget
		let mockPostMessage = $window.addEventListener.mock.calls[0][1]

		// mock widget start
		mockPostMessage(buildPostMessage('start', ''))

		_scope.$digest() // make sure defer from post message completes
		expect(mockPostMessageFromWidget).toHaveBeenCalled()

		// varify the heartbeat request is sent after 30 seconds of initialization
		mockSendPromiseOnce()
		$interval.flush(30000)
		expect(sendMock).toHaveBeenLastCalledWith('session_play_verify', ['ff88gg'])

		// mock the api request
		mockSendPromiseOnce() // once for add log
		mockSendPromiseOnce() // once for storate

		// ======== test addLog
		mockPostMessage(buildPostMessage('addLog', { testLog: true, value: 10, whatever: 'yep' }))

		// add a storage log
		mockPostMessage(
			buildPostMessage('sendStorage', { testStorage: true, value: 10, whatever: 'yep' })
		)

		// force them to send now
		mockPostMessage(buildPostMessage('sendPendingLogs', ''))

		_scope.$digest() // make sure defer from post message completes

		let expectedStoage = expect.objectContaining([
			'ff88gg',
			[
				{
					testStorage: true,
					value: 10,
					whatever: 'yep'
				}
			]
		])

		let expectedLogs = expect.objectContaining([
			'ff88gg',
			[
				{
					game_time: expect.any(Number),
					testLog: true,
					value: 10,
					whatever: 'yep'
				}
			]
		])
		expect(sendMock).toHaveBeenCalledWith('play_storage_data_save', expectedStoage)
		expect(sendMock).toHaveBeenCalledWith('play_logs_save', expectedLogs)
		// ======== end test addLog

		// test setHeight message
		mockGetEl.mockImplementationOnce(() => [{ style: centerStyle }])
		mockPostMessage(buildPostMessage('setHeight', [999]))
		expect(centerStyle.height).toBe('999px')

		// test min height
		mockGetEl.mockImplementationOnce(() => [{ style: centerStyle }])
		mockPostMessage(buildPostMessage('setHeight', [10]))
		expect(centerStyle.height).toBe('600px')

		// test initialize post message
		expect(() => {
			mockPostMessage(buildPostMessage('initialize'))
		}).not.toThrow()

		// expect unkown types to throw
		expect(() => {
			mockPostMessage(buildPostMessage('wild crazy thing'))
		}).toThrow()

		// test alert post message
		mockPostMessage(buildPostMessage('alert', 'aaaahh!'))
		expect($scope.$apply).toHaveBeenCalledTimes(4)
		expect($scope.alert.msg).toBe('aaaahh!')
		expect($scope.alert.fatal).toBe(false)
		expect($scope.alert.title).toBe('Warning!')

		// test onbeforeunload
		expect($window.onbeforeunload()).not.toBeUndefined()
		widgetInstance.widget.is_scorable = 0
		expect($window.onbeforeunload()).toBeUndefined()
		widgetInstance.widget.is_scorable = '1'
		$scope.isPreview = true
		expect($window.onbeforeunload()).toBeUndefined()
		$scope.isPreview = false

		// test alert
		expect($scope.$apply).toHaveBeenCalledTimes(4)
		$scope.jestTest._alert('eh', 'titletext', true)
		expect($scope.$apply).toHaveBeenCalledTimes(5)
		expect($scope.alert.msg).toBe('eh')
		expect($scope.alert.fatal).toBe(true)
		expect($scope.alert.title).toBe('titletext')
		$scope.jestTest._alert('eh2')
		expect($scope.$apply).toHaveBeenCalledTimes(6)
		expect($scope.alert.msg).toBe('eh2')
		expect($scope.alert.fatal).toBe(false)
		expect($scope.alert.title).toBe('')

		// send end message
		// mock the api request
		mockSendPromiseOnce({
			score_url: '/score/screen/url',
			type: 'success'
		})

		// send end without showing the score screen
		mockPostMessage(buildPostMessage('end', false))
		_scope.$digest() // make sure defer from post message completes

		expect(sendMock).toHaveBeenCalledWith('play_storage_data_save', expectedStoage)
		expect(sendMock).toHaveBeenCalledWith('play_logs_save', expectedLogs)

		jest.spyOn($location, 'replace')
		mockPostMessage(buildPostMessage('end'))
		expect($location.replace).toHaveBeenCalledWith('/score/screen/url')
	})

	it('_startPlaySession checks post message origin', () => {
		let centerStyle = {
			width: -1,
			height: -1
		}

		let widgetStyle = {
			display: 'none'
		}

		let previewStyle = {
			width: -1
		}

		let embedStyle = {
			width: -1,
			height: -1
		}

		let mockHref = {
			href: null
		}

		let mockGetEl = jest
			.fn()
			.mockImplementationOnce(() => [
				{
					style: centerStyle
				}
			])
			.mockImplementationOnce(() => ({
				style: widgetStyle
			}))
			.mockImplementationOnce(() => [
				{
					style: previewStyle
				}
			])
		$document.getElementsByClassName = mockGetEl

		let mockGetById = jest.fn().mockImplementationOnce(() => ({ style: embedStyle }))

		let mockCreateElement = jest.fn().mockImplementationOnce(() => mockHref)

		_widgetSrv.getWidget.mockImplementationOnce(inst_id => ({
			then: jest.fn(cb => {
				cb(getMockApiData('widget_instances_get')[0])
			})
		}))

		global.PLAY_ID = 'ff88gg'
		$document.getElementsById = mockGetById
		$document.createElement = mockCreateElement
		mockSendPromiseOnce({})
		jest.spyOn($window, 'addEventListener')
		var $scope = { $watch: jest.fn(), inst_id: 'bb8', $apply: jest.fn() }
		var controller = $controller('playerCtrl', { $scope })
		$timeout.flush()

		expect(() => {
			$window.addEventListener.mock.calls[0][1]({
				origin: 'this-doesnt-match',
				data: JSON.stringify({
					type: 'start',
					data: ''
				})
			})
		}).toThrow()
	})
})
