describe('playerCtrl', () => {
	var _widgetSrv
	var _userServ
	var _scope
	var sendMock
	var $q
	var $controller
	var $window
	var $sce
	var _alert
	var $timeout
	var $document
	var $interval

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
			_$interval_
		) {
			_scope = $rootScope.$new()
			$q = _$q_
			$controller = _$controller_
			$sce = _$sce_
			$timeout = _$timeout_
			$document = _$document_
			$window = _$window_
			$interval = _$interval_
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

		let mockIframePostMessage = jest.fn()
		let mockGetById = jest.fn().mockImplementationOnce(() => ({
			style: embedStyle,
			contentWindow: {
				postMessage: mockIframePostMessage
			}
		}))

		let mockCreateElement = jest.fn().mockImplementationOnce(() => mockHref)

		_widgetSrv.getWidget.mockImplementationOnce(inst_id => ({
			then: jest.fn(cb => {
				cb(getMockApiData('widget_instances_get')[0])
			})
		}))

		global.PLAY_ID = 'ff88gg'
		$document.getElementsByClassName = mockGetEl
		$document.getElementsById = mockGetById
		$document.createElement = mockCreateElement
		Materia.Coms.Json.send.mockImplementationOnce((a, args, cb) => {
			cb({})
		})
		jest.spyOn($window, 'addEventListener')
		var $scope = { $watch: jest.fn(), inst_id: 'bb8', $apply: jest.fn() }
		var controller = $controller('playerCtrl', { $scope })
		$timeout.flush()

		expect($scope.$apply).toHaveBeenCalledTimes(2)
		expect(_widgetSrv.getWidget).toHaveBeenLastCalledWith('bb8')
		expect($scope.allowFullScreen).toBe(false)
		expect(centerStyle.width).toBe('800px')
		expect(centerStyle.height).toBe('600px')
		expect(widgetStyle.display).toBe('block')
		expect(previewStyle.width).toBe('800px')
		expect(mockHref.href).toBe('https://crossdomain.com/')

		expect($window.addEventListener).toHaveBeenCalledWith('message', expect.anything(), false)

		let onPostMessage = $window.addEventListener.mock.calls[0][1]
		onPostMessage({
			origin: 'https://crossdomain.com',
			data: JSON.stringify({
				type: 'start',
				data: ''
			})
		})

		_scope.$digest() // make sure defer from post message completes
		expect(mockIframePostMessage).toHaveBeenCalled()
		$interval.flush(30000)
		expect(sendMock).toHaveBeenLastCalledWith('session_play_verify', ['ff88gg'], expect.anything())

		// ======== test addLog
		onPostMessage({
			origin: 'https://crossdomain.com',
			data: JSON.stringify({
				type: 'addLog',
				data: { testLog: true, value: 10, whatever: 'yep' }
			})
		})

		onPostMessage({
			origin: 'https://crossdomain.com',
			data: JSON.stringify({
				type: 'sendStorage',
				data: { testStorage: true, value: 10, whatever: 'yep' }
			})
		})

		onPostMessage({
			origin: 'https://crossdomain.com',
			data: JSON.stringify({
				type: 'sendPendingLogs'
			})
		})

		sendMock.mockImplementationOnce((n, arg, cb) => {
			const deferred = $q.defer()
			deferred.resolve()
			return deferred.promise
		})
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
		expect(sendMock).toHaveBeenCalledWith(
			'play_storage_data_save',
			expectedStoage,
			expect.anything()
		)
		expect(sendMock).toHaveBeenLastCalledWith('play_logs_save', expectedLogs, expect.anything())

		// ======== end test addLog
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

		let mockGetById = jest.fn().mockImplementationOnce(() => ({ style: embedStyle }))

		let mockCreateElement = jest.fn().mockImplementationOnce(() => mockHref)

		_widgetSrv.getWidget.mockImplementationOnce(inst_id => ({
			then: jest.fn(cb => {
				cb(getMockApiData('widget_instances_get')[0])
			})
		}))

		global.PLAY_ID = 'ff88gg'
		$document.getElementsByClassName = mockGetEl
		$document.getElementsById = mockGetById
		$document.createElement = mockCreateElement
		Materia.Coms.Json.send.mockImplementationOnce((a, args, cb) => {
			cb({})
		})
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
