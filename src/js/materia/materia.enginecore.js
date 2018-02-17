// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').Engine = (function() {
	let _baseUrl = null;
	let _instance = null;
	let _lastHeight = -1;
	let _mediaUrl = null;
	let _resizeInterval = null;
	let _widgetClass = null;

	const _onPostMessage = function(e) {
		const msg = JSON.parse(e.data);
		switch (msg.type) {
			case 'initWidget':
				_baseUrl = msg.data[2];
				_mediaUrl = msg.data[3];
				return _initWidget(msg.data[0], msg.data[1]);
			default:
				throw new Error(`Error: Engine Core received unknown post message: ${msg.type}`);
		}
	};

	const _sendPostMessage = (type, data) => parent.postMessage(JSON.stringify({type, data}), '*');

	// Called by Materia.Player when your widget Engine should start the user experience
	var _initWidget = function(qset, instance) {
		_widgetClass.start(instance, qset.data, qset.version);
		return _instance = instance;
	};

	const start = function(widgetClass) {
		// setup the postmessage listener
		switch (false) {
			case (typeof addEventListener === 'undefined' || addEventListener === null): addEventListener('message', _onPostMessage, false); break;
			case (typeof attachEvent === 'undefined' || attachEvent === null): attachEvent('onmessage', _onPostMessage); break;
		}

		if ((widgetClass.manualResize != null) && (widgetClass.manualResize === false)) {
			_resizeInterval = setInterval(() => setHeight()
			, 300);
		}

		_widgetClass = widgetClass;
		_sendPostMessage('initialize');
		return _sendPostMessage('start', null);
	};

	const sendStorage = function() {
		return _sendPostMessage('sendStorage', arguments[0]);
	};

	const addLog = function(type, item_id, text, value) {
		if (type == null) { type = ''; }
		if (item_id == null) { item_id = 0; }
		if (text == null) { text = ''; }
		return _sendPostMessage('addLog', {type, item_id, text, value});
	};

	const alert = function(title, msg, type) {
		if (type == null) { type = 1; }
		return _sendPostMessage('alert', {title, msg, type});
	};

	const getImageAssetUrl = mediaId => `${_mediaUrl}/${mediaId}`;

	const end = function(showScoreScreenAfter) {
		if (showScoreScreenAfter == null) { showScoreScreenAfter = true; }
		return _sendPostMessage('end', showScoreScreenAfter);
	};

	const sendPendingLogs = () => _sendPostMessage('sendPendingLogs', {});

	var setHeight = function(h) {
		if (!h) {
			h = parseInt(window.getComputedStyle(document.documentElement).height, 10);
		}
		if (h !== _lastHeight) {
			_sendPostMessage('setHeight', [h]);
			return _lastHeight = h;
		}
	};

	const disableResizeInterval = () => clearInterval(_resizeInterval);

	const escapeScriptTags = text => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

	return {
		start,
		addLog,
		alert,
		getImageAssetUrl,
		end,
		sendPendingLogs,
		sendStorage,
		disableResizeInterval,
		setHeight, // allows the widget to resize its iframe container to fit the height of its contents
		escapeScriptTags
	};
})();
