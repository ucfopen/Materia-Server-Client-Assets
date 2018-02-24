// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia')
app.controller('playerCtrl', function($scope, $sce, $timeout, widgetSrv, userServ, PLAYER, Alert) {
	$scope.alert = Alert

	// Keep track of a promise
	let embedDoneDfD = null
	// Widget instance
	let instance = null
	// Logs that have yet to be synced
	const pendingLogs = { play: [], storage: [] }
	// ID of the current play, received from embedded inline script variables
	let play_id = null
	// hold onto the qset from the instance
	let qset = null
	// the time the widget starts playing
	let startTime = 0
	// widget container object, used for postMessage
	let widget = null
	// .swf or .html
	let widgetType = null
	// Keeps the state of whether scores have been sent yet when receiving .end() calls from widgets
	let endState = null
	// Whether or not to show the score screen as soon as playlogs get synced
	let scoreScreenPending = false
	// Keep track of the timer id for the heartbeat so we can clear the timeout
	let heartbeatIntervalId = -1
	// Calculates which screen to show (preview, embed, or normal)
	let scoreScreenURL = null
	// Whether or not to show the embed view
	const isEmbedded = top.location !== self.location
	// Queue of requests
	const pendingQueue = []
	// Whether or not a queue push is in progress
	let logPushInProgress = false
	// number of times the logs an retried sending
	let retryCount = 0
	// search for preview or embed directory in the url
	const checkForContext = String(window.location).split('/')
	// Controls whether the view has a "preview" header bar
	$scope.isPreview = false
	// Controls whether or not the widget iframe will allow fullscreen behavior (disabled by default)
	$scope.allowFullScreen = false

	for (let word of Array.from(checkForContext)) {
		if (word === 'preview') {
			$scope.isPreview = true
			break
		}
	}

	const sendAllPendingLogs = function(callback) {
		if (callback == null) {
			callback = $.noop
		}

		return $.when(sendPendingStorageLogs())
			.pipe(sendPendingPlayLogs)
			.done(callback)
			.fail(() => _alert('There was a problem saving.', 'Something went wrong...', false))
	}

	const onWidgetReady = function() {
		widget = $(`#${PLAYER.EMBED_TARGET}`).get(0)
		switch (false) {
			case !(qset == null):
				return embedDoneDfD.reject('Unable to load widget data.')
			case !(widget == null):
				return embedDoneDfD.reject('Unable to load widget.')
			default:
				return embedDoneDfD.resolve()
		}
	}

	const addLog = function(log) {
		// add to pending logs
		log['game_time'] = (new Date().getTime() - startTime) / 1000 // log time in seconds
		return pendingLogs.play.push(log)
	}

	const sendStorage = function(log) {
		if (!$scope.isPreview) {
			return pendingLogs.storage.push(log)
		}
	}

	const end = function(showScoreScreenAfter) {
		if (showScoreScreenAfter == null) {
			showScoreScreenAfter = true
		}
		switch (endState) {
			case 'sent':
				if (showScoreScreenAfter) {
					return showScoreScreen()
				}
				break
			case 'pending':
				if (showScoreScreenAfter) {
					return (scoreScreenPending = true)
				}
				break
			default:
				endState = 'pending'
				// kill the heartbeat
				clearInterval(heartbeatIntervalId)
				// required to end a play
				addLog({ type: 2, item_id: 0, text: '', value: null })
				// send anything remaining
				return sendAllPendingLogs(function() {
					// Async callback after final logs are sent
					endState = 'sent'
					// shows the score screen upon callback if requested any time betwen method call and now
					if (showScoreScreenAfter || scoreScreenPending) {
						return showScoreScreen()
					}
				})
		}
	}

	const startHeartBeat = function() {
		const dfd = $.Deferred().resolve()
		setInterval(
			() =>
				Materia.Coms.Json.send('session_play_verify', [play_id], function(result) {
					if (result !== true && instance.guest_access === false) {
						return _alert(
							"Your play session is no longer valid! This may be due to logging out, your session expiring, or trying to access another Materia account simultaneously. You'll need to reload the page to start over.",
							'Invalid session',
							true
						)
					}
				}),

			30000
		)
		return dfd.promise()
	}

	const sendWidgetInit = function() {
		const dfd = $.Deferred().resolve()
		const convertedInstance = translateForApiVersion(instance)
		startTime = new Date().getTime()
		sendToWidget(
			'initWidget',
			widgetType === '.swf'
				? [qset, convertedInstance]
				: [qset, convertedInstance, BASE_URL, MEDIA_URL]
		)
		if (!$scope.isPreview) {
			heartbeatIntervalId = setInterval(sendAllPendingLogs, PLAYER.LOG_INTERVAL) // if not in preview mode, set the interval to send logs
		}

		return dfd.promise()
	}

	var sendToWidget = function(type, args) {
		switch (widgetType) {
			case '.swf':
				return widget[type].apply(widget, args)
			case '.html':
				return widget.contentWindow.postMessage(
					JSON.stringify({ type, data: args }),
					STATIC_CROSSDOMAIN
				)
		}
	}

	const onLoadFail = msg => _alert(`Failure: ${msg}`, null, true)

	const embed = function() {
		let enginePath
		const dfd = $.Deferred()

		widgetType = instance.widget.player.slice(instance.widget.player.lastIndexOf('.'))

		if (instance.widget.player.substring(0, 4) === 'http') {
			// allow player paths to be absolute urls
			enginePath = instance.widget.player
		} else {
			// link to the static widget
			enginePath = WIDGET_URL + instance.widget.dir + instance.widget.player
		}

		if (instance.widget.width > 0) {
			$('.preview-bar').width(instance.widget.width)
		}

		switch (widgetType) {
			case '.swf':
				embedFlash(enginePath, '10', dfd)
				break
			case '.html':
				embedHTML(enginePath, dfd)
				break
		}
		return dfd.promise()
	}

	var embedFlash = function(enginePath, version, dfd) {
		// register global callbacks for ExternalInterface calls
		window.__materia_sendStorage = sendStorage
		window.__materia_onWidgetReady = onWidgetReady
		window.__materia_sendPendingLogs = sendAllPendingLogs
		window.__materia_end = end
		window.__materia_addLog = addLog
		const params = { menu: 'false', allowFullScreen: 'true', AllowScriptAccess: 'always' }
		const attributes = { id: PLAYER.EMBED_TARGET }
		const express = BASE_URL + 'assets/flash/expressInstall.swf'
		let width = '100%'
		let height = '100%'
		const flashvars = {
			inst_id: $scope.inst_id,
			GIID: $scope.inst_id,
			URL_WEB: BASE_URL,
			URL_GET_ASSET: 'media/'
		}

		if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
			width = '99.7%'
			height = '99.7%'
		}

		embedDoneDfD = dfd
		$scope.type = 'flash'
		$scope.$apply()
		return swfobject.embedSWF(
			enginePath,
			PLAYER.EMBED_TARGET,
			width,
			height,
			String(version),
			express,
			flashvars,
			params,
			attributes
		)
	}

	var embedHTML = function(enginePath, dfd) {
		embedDoneDfD = dfd

		$scope.type = 'html'
		$scope.htmlPath = enginePath + '?' + instance.widget.created_at
		if (instance.widget.width > 0) {
			$(`#${PLAYER.EMBED_TARGET}`).width(instance.widget.width)
		}
		if (instance.widget.height > 0) {
			$(`#${PLAYER.EMBED_TARGET}`).height(instance.widget.height)
		}

		// build a link element to deconstruct the static url
		// this helps us match static url against the event origin
		const a = document.createElement('a')
		a.href = STATIC_CROSSDOMAIN
		const expectedOrigin = a.href.substr(0, a.href.length - 1)

		const _onPostMessage = function(e) {
			if (e.origin === expectedOrigin) {
				const msg = JSON.parse(e.data)
				switch (msg.type) {
					case 'start':
						return onWidgetReady()
					case 'addLog':
						return addLog(msg.data)
					case 'end':
						return end(msg.data)
					case 'sendStorage':
						return sendStorage(msg.data)
					case 'sendPendingLogs':
						return sendAllPendingLogs()
					case 'alert':
						return _alert(msg.data, 'Warning!', false)
					case 'setHeight':
						return setHeight(msg.data[0])
					case 'initialize':
						break
					default:
						throw new Error(`Unknown PostMessage received from player core: ${msg.type}`)
				}
			} else {
				throw new Error(
					`Post message Origin does not match.  Expected: ${expectedOrigin}, Actual: ${e.origin}`
				)
			}
		}

		// setup the postmessage listener
		if (typeof addEventListener !== 'undefined' && addEventListener !== null) {
			addEventListener('message', _onPostMessage, false)
		}
		return $scope.$apply()
	}

	const getWidgetInstance = function() {
		const dfd = $.Deferred()

		if ($scope.type === 'noflash') {
			dfd.reject('Flash Player required.')
		}

		widgetSrv.getWidget($scope.inst_id).then(widgetInstances => {
			if (widgetInstances.length < 1) {
				dfd.reject('Unable to get widget info.')
			}
			instance = widgetInstances[0]
			const type = instance.widget.player.split('.').pop()
			const version = parseInt(instance.widget.flash_version, 10)

			// Fullscreen flag set as an optional parameter in widget install.yaml; have to dig into instance widget's meta_data object to find it
			// can't use array.includes() since it's necessary to ensure comparison is case insensitive
			for (let feature of Array.from(instance.widget.meta_data.features)) {
				if (feature.toLowerCase() === 'fullscreen') {
					$scope.allowFullScreen = true
				}
			}

			if (type === 'swf' && swfobject.hasFlashPlayerVersion(String(version)) === false) {
				$scope.type = 'noflash'
				dfd.reject('Newer Flash Player version required.')
			} else {
				if (instance.widget.width > 0) {
					$('.center').width(instance.widget.width)
				}
				if (instance.widget.height > 0) {
					$('.center').height(instance.widget.height)
				}
				dfd.resolve()
			}

			return $('.widget').show()
		})

		$scope.$apply()

		return dfd.promise()
	}

	const startPlaySession = function() {
		const dfd = $.Deferred()

		switch (false) {
			case $scope.type !== 'noflash':
				dfd.reject('Flash Player Required.')
				break
			case !$scope.isPreview:
				dfd.resolve()
				break
			default:
				// get the play id from the embedded variable on the page:
				play_id = PLAY_ID

				if (play_id != null) {
					dfd.resolve()
				} else {
					dfd.reject('Unable to start play session.')
				}
		}

		return dfd.promise()
	}

	const getQuestionSet = function() {
		const dfd = $.Deferred()
		// TODO: if bad qSet : dfd.reject('Unable to load questions.')
		Materia.Coms.Json.send('question_set_get', [$scope.inst_id, play_id], function(result) {
			qset = result
			return dfd.resolve()
		})

		return dfd.promise()
	}

	var pushPendingLogs = function() {
		if (logPushInProgress) {
			return
		}
		logPushInProgress = true

		// This shouldn't happen, but its a sanity check anyhow
		if (pendingQueue.length === 0) {
			logPushInProgress = false
			return
		}

		return Materia.Coms.Json.send('play_logs_save', pendingQueue[0].request, function(result) {
			retryCount = 0 // reset on success
			if ($scope.alert.fatal) {
				$scope.alert.fatal = false
			}
			if (result != null && result.score_url != null) {
				scoreScreenURL = result.score_url
			} else if (result != null && result.type === 'error') {
				if (result.msg) {
					_alert(result.msg, 'Something went wrong...', true)
				} else {
					_alert(
						"Your play session is no longer valid! This may be due to logging out, your session expiring, or trying to access another Materia account simultaneously. You'll need to reload the page to start over.",
						'Something went wrong...',
						true
					)
				}
			}

			const previous = pendingQueue.shift()
			previous.promise.resolve()

			logPushInProgress = false

			if (pendingQueue.length > 0) {
				return pushPendingLogs()
			}
		}).fail(function() {
			retryCount++
			let retrySpeed = PLAYER.RETRY_FAST

			if (retryCount > PLAYER.RETRY_LIMIT) {
				retrySpeed = PLAYER.RETRY_SLOW
				_alert(
					"Connection to Materia's server was lost. Check your connection or reload to start over.",
					'Something went wrong...',
					true
				)
			}

			return setTimeout(function() {
				logPushInProgress = false
				return pushPendingLogs()
			}, retrySpeed)
		})
	}

	var sendPendingPlayLogs = function() {
		const dfd = $.Deferred()

		if (pendingLogs.play.length > 0) {
			const args = [play_id, pendingLogs.play]
			if ($scope.isPreview) {
				args.push($scope.inst_id)
			}
			pendingQueue.push({ request: args, promise: dfd })
			pushPendingLogs()

			pendingLogs.play = []
		} else {
			dfd.resolve()
		}

		return dfd.promise()
	}

	var sendPendingStorageLogs = function() {
		const dfd = $.Deferred()

		if (!$scope.isPreview && pendingLogs.storage.length > 0) {
			Materia.Coms.Json.send('play_storage_data_save', [play_id, pendingLogs.storage], () =>
				dfd.resolve()
			)
			pendingLogs.storage = []
		} else {
			dfd.resolve()
		}

		return dfd.promise()
	}

	// converts current widget/instance structure to the one expected by the player
	var translateForApiVersion = function(inst) {
		// switch based on version expected by the widget
		let output
		switch (parseInt(inst.widget.api_version)) {
			case 1:
				output = {
					startDate: inst.open_at,
					playable: inst.widget.is_playable,
					embedUrl: inst.embed_url,
					engineName: inst.widget.name,
					endDate: inst.close_at,
					GRID: inst.widget.id,
					type: inst.widget.type,
					dateCreate: inst.created_at,
					version: '',
					playUrl: inst.play_url,
					QSET: inst.qset,
					isDraft: inst.is_draft,
					height: inst.widget.height,
					dir: inst.group,
					storesData: inst.widget.is_storage_enabled,
					name: inst.name,
					engineID: inst.widget.id,
					GIID: inst.id,
					flVersion: inst.flash_version,
					isQSetEncrypted: inst.widget.is_qset_encrypted,
					cleanName: inst.widget.clean_name,
					attemptsAllowed: inst.attempts,
					recordsScores: inst.widget.is_scorable,
					width: inst.widget.width,
					isAnswersEncrypted: inst.widget.is_answer_encrypted,
					cleanOwner: '',
					editable: inst.widget.is_editable,
					previewUrl: inst.preview_url,
					userID: inst.user_id,
					scoreModule: inst.widget.score_module
				}
				break
			case 2:
				output = inst
				break
			default:
				output = inst
		}
		return output
	}

	var setHeight = function(h) {
		const min_h = instance.widget.height
		if (h > min_h) {
			return $('.center').height(h)
		} else {
			return $('.center').height(min_h)
		}
	}

	var showScoreScreen = function() {
		if (scoreScreenURL === null) {
			if ($scope.isPreview) {
				scoreScreenURL = `${BASE_URL}scores/preview/${$scope.inst_id}`
			} else if (isEmbedded) {
				scoreScreenURL = `${BASE_URL}scores/embed/${$scope.inst_id}#play-${play_id}`
			} else {
				scoreScreenURL = `${BASE_URL}scores/${$scope.inst_id}#play-${play_id}`
			}
		}

		if (!$scope.alert.fatal) {
			return (window.location = scoreScreenURL)
		}
	}

	window.onbeforeunload = function(e) {
		if (instance.widget.is_scorable === '1' && !$scope.isPreview && endState !== 'sent') {
			return 'Wait! Leaving now will forfeit this attempt. To save your score you must complete the widget.'
		} else {
			return undefined
		}
	}

	var _alert = function(msg, title = null, fatal) {
		if (fatal == null) {
			fatal = false
		}
		return $scope.$apply(function() {
			$scope.alert.msg = msg
			if (title !== null) {
				$scope.alert.title = title
			}
			return ($scope.alert.fatal = fatal)
		})
	}

	return $timeout(() =>
		$.when(getWidgetInstance(), startPlaySession())
			.pipe(getQuestionSet)
			.pipe(embed)
			.pipe(sendWidgetInit)
			.pipe(startHeartBeat)
			.fail(onLoadFail)
	)
})

// Tiny directive that handles applying the "allowfullscreen" attribute to the player iframe
// since the attribute does not take a parameter, it isn't as easy as allowfullscreen = {{allowFullScreen}} on the actual DOM element
app.directive('fullscreenDir', () => ({
	restrict: 'A',
	link($scope, $element, $attrs) {
		return $scope.$watch('allowFullScreen', function(newVal, oldVal) {
			if (newVal === true) {
				return $attrs.$set('allowfullscreen', '')
			}
		})
	}
}))
