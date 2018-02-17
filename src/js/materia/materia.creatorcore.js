// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').CreatorCore = (function() {
	let _baseurl        = null;
	let _creatorClass   = null;
	let _lastHeight     = -1;
	let _mediaUrl       = null;
	let _resizeInterval = null;


	const PRESANITIZE_CHARACTERS = {
		'>': '',
		'<': ''
	};

	const _onPostMessage = function(e) {
		const msg = JSON.parse(e.data);
		switch (msg.type) {
			case 'initNewWidget':
				return _initNewWidget(msg.data[0], msg.data[1], msg.data[2], msg.data[3]);
			case 'initExistingWidget':
				return _initExistingWidget(msg.data[0], msg.data[1], msg.data[2], msg.data[3], msg.data[4], msg.data[5], msg.data[6]);
			case 'onRequestSave':
				return _tellCreator('onSaveClicked', [msg.data[0]]);
			case 'onSaveComplete':
				return _tellCreator('onSaveComplete', [msg.data[0], msg.data[1], msg.data[2], msg.data[3]]);
			case 'onMediaImportComplete':
				return _tellCreator('onMediaImportComplete', [msg.data[0]]);
			case 'onQuestionImportComplete':
				return _tellCreator('onQuestionImportComplete', [msg.data[0]]);
			default:
				return alert(`Error, unknown message sent to creator core: ${msg.type}`);
		}
	};

	var _tellCreator = function(method, args) {
		if (typeof _creatorClass[method] === 'function') {
			return _creatorClass[method].apply(undefined, args);
		} else {
			return alert(`Error, missing creator ${method} called.`);
		}
	};

	const _sendPostMessage = (type, data) => parent.postMessage(JSON.stringify({type, data}), '*');

	var _initNewWidget = function(widget, baseUrl, mediaUrl) {
		_baseurl = baseUrl;
		_mediaUrl = mediaUrl;
		return _tellCreator('initNewWidget', [widget]);
	};

	var _initExistingWidget = function(widget, title, qset, qsetVersion, baseUrl, mediaUrl) {
		_baseurl = baseUrl;
		_mediaUrl = mediaUrl;
		return _tellCreator('initExistingWidget', [widget, title, qset, qsetVersion]);
	};

	const start = function(creatorClass) {
		// setup the postmessage listener
		if (typeof addEventListener !== 'undefined' && addEventListener !== null) {
			addEventListener('message', _onPostMessage, false);
		} else if (typeof attachEvent !== 'undefined' && attachEvent !== null) {
			attachEvent('onmessage', _onPostMessage);
		}

		if ((creatorClass.manualResize != null) && (creatorClass.manualResize === false)) {
			_resizeInterval = setInterval(() => setHeight()
			, 300);
		}

		_creatorClass = creatorClass;
		return _sendPostMessage('start', null);
	};

	var alert = function(title, msg, type) {
		if (type == null) { type = 1; }
		return _sendPostMessage('alert', {title, msg, type});
	};

	const getMediaUrl = mediaId => `${_mediaUrl}/${mediaId}`;

	// replace a specified list of characters with their safe equivalents
	const _preSanitize = function(text) {
		for (let k in PRESANITIZE_CHARACTERS) {
			const v = PRESANITIZE_CHARACTERS[k];
			text = text.replace(new RegExp(k, 'g'), v);
		}
		return text;
	};

	const showMediaImporter = function(types) {
		if (types == null) { types = ['jpg','jpeg','gif','png']; }
		return _sendPostMessage('showMediaImporter', types);
	};

	const save = function(title, qset, version) {
		if (version == null) { version = '1'; }
		const sanitizedTitle = _preSanitize(title);
		return _sendPostMessage('save', [sanitizedTitle, qset, version]);
	};

	const cancelSave = msg => _sendPostMessage('cancelSave', [msg]);

	var setHeight = function(h) {
		if (!h) {
			h = $('html').height();
		}
		if (h !== _lastHeight) {
			_sendPostMessage('setHeight', [h]);
			return _lastHeight = h;
		}
	};

	const escapeScriptTags = text => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

	const disableResizeInterval = () => clearInterval(_resizeInterval);

	// Public Methods
	return {
		start,
		alert,
		getMediaUrl,
		showMediaImporter,
		cancelSave,
		save,
		disableResizeInterval,
		setHeight, // allows the creator to resize its iframe container to fit the height of its contents
		escapeScriptTags
	};
})();
