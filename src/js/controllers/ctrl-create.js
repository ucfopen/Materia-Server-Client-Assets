// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('createCtrl', function($scope, $sce, $timeout, widgetSrv, Alert) {
	$scope.alert = Alert;

	const HEARTBEAT_INTERVAL = 30000;
	// How far from the top of the window that the creator frame starts
	const BOTTOM_OFFSET = 145;
	// Where to embed flash
	const EMBED_TARGET   = "container";

	let creator       = null;
	let embedDoneDfd  = null;
	let heartbeat     = null;
	const importerPopup = null;
	let inst_id       = null;
	let instance      = null;
	let keepQSet      = null;
	let saveMode      = false;
	let type          = null;
	let widget_id     = null;
	let widget_info   = null;
	let widgetType    = null;

	// get the instance_id from the url if needed
	if (window.location.hash) { inst_id = window.location.hash.substr(1); }
	widget_id = window.location.href.match(/widgets\/([\d]+)/)[1];

	// Model properties
	$scope.saveStatus = 'idle';
	$scope.saveText = "Save Draft";
	$scope.previewText = "Preview";
	$scope.publishText = "Publish...";

	$scope.invalid = false;
	$scope.modal = false;

	// Model methods
	// send a save request to the creator
	$scope.requestSave = function(mode) {
		// hide dialogs
		$scope.popup = "";

		saveMode = mode;
		$scope.saveStatus = 'saving';
		switch (saveMode) {
			case 'publish':
				$scope.previewText = "Saving...";
				break;
			case 'save':
				$scope.saveText = "Saving...";
				break;
		}

		return sendToCreator('onRequestSave', [mode]);
	};

	// Popup a question importer dialog
	$scope.showQuestionImporter = function() {
		// must be loose comparison
		const types = widget_info.meta_data.supported_data;
		//the value passed on needs to be a list of one or two elements, i.e.
		//?type=QA or ?type=MC or ?type=QA,MC
		showEmbedDialog(`${BASE_URL}questions/import/?type=${encodeURIComponent(types.join())}`);
		return null; // else Safari will give the .swf data that it can't handle
	};

	$scope.onPublishPressed = function() {
		if ((inst_id != null) && (instance != null) && !instance.is_draft) {
			// Show the Update Dialog
			return $scope.popup = "update";
		} else {
			// Show the Publish Dialog
			return $scope.popup = "publish";
		}
	};

	$scope.cancelPublish = function(e, instant) {
		if (instant == null) { instant = false; }
		return $scope.popup = "";
	};

	$scope.cancelPreview = function(e, instant) {
		if (instant == null) { instant = false; }
		return $scope.popup = "";
	};

	// If Initialization Fails
	const onInitFail = function(msg) {
		stopHeartBeat();
		if (msg.toLowerCase() !== 'flash player required.') { return _alert(`Failure: ${msg}`); }
	};

	// Every 30 seconds, renew/check the session
	const startHeartBeat = function() {
		const dfd = $.Deferred().resolve();
		heartbeat = setInterval(() =>
			Materia.Coms.Json.send('session_author_verify', [null, false], function(data) {
				if (data !== true) {
					_alert('You have been logged out due to inactivity', 'Invalid Login', true, true);
					$scope.$apply();
					return stopHeartBeat();
				}
			})
		
		, HEARTBEAT_INTERVAL);

		return dfd.promise();
	};

	var stopHeartBeat = () => clearInterval(heartbeat);

	// Gets widget info when not editing an existing instance
	const getWidgetInfo = function() {
		const dfd = $.Deferred();
		widgetSrv.getWidgetInfo(widget_id, widgets => dfd.resolve(widgets));

		return dfd.promise();
	};

	// Gets the qset of a loaded instance
	const getQset = function() {
		const dfd = $.Deferred();
		Materia.Coms.Json.send('question_set_get', [inst_id], function(data) {
			if (((data != null ? data.title : undefined) === "Permission Denied") || (data.title === "error")) {
				$scope.invalid = true;
				$scope.$apply();
			} else {
				keepQSet = data;
			}
			return dfd.resolve();
		});

		return dfd.promise();
	};

	// Starts the Creator, sending required widget data
	const initCreator = function() {
		let args;
		const dfd = $.Deferred().resolve();
		
		if (inst_id != null) {
			args = [instance.name, instance.widget, keepQSet.data, keepQSet.version, BASE_URL];
			if (widgetType !== '.swf') { args.push(MEDIA_URL); } // Passing MEDIA_URL breaks the SWF, so omit it for Flash widgets! The intent is to sunset Flash support relatively soon after this code is committed.

			sendToCreator('initExistingWidget', args);
		} else {
			args = [widget_info, BASE_URL];
			if (widgetType !== '.swf') { args.push(MEDIA_URL); } //  Passing MEDIA_URL breaks the SWF, so omit it for Flash widgets! The intent is to sunset Flash support relatively soon after this code is committed.

			sendToCreator('initNewWidget', args);
		}

		return dfd.promise();
	};

	// Send messages to the creator, handles flash and html creators
	var sendToCreator = function(type, args) {
		switch (widgetType) {
			case '.swf':
				return creator[type].apply(creator, args);
			case '.html':
				return creator.contentWindow.postMessage(JSON.stringify({type, data:args}), STATIC_CROSSDOMAIN);
		}
	};

	// build a my-widgets url to a specific widget
	const getMyWidgetsUrl = instid => `${BASE_URL}my-widgets#${instid}`;

	// Embeds the creator
	const embed = function(widgetData) {
		let creatorPath;
		if (widgetData != null ? widgetData[0].widget : undefined) {
			instance    = widgetData[0];
			widget_info = instance.widget;
		} else {
			widget_info = widgetData[0];
		}

		$scope.nonEditable = widget_info.is_editable === "0";

		const dfd = $.Deferred();
		widgetType = widget_info.creator.slice(widget_info.creator.lastIndexOf('.'));

		// allow creator paths to be absolute urls
		if (widget_info.creator.substring(0,4) === 'http') {
			creatorPath = widget_info.creator;
		// link to the static widget
		} else {
			creatorPath = WIDGET_URL+widget_info.dir+widget_info.creator;
		}

		type = creatorPath.split('.').pop();
		$scope.loaded = true;
		$scope.type = type;
		$scope.$apply();

		switch (type) {
			case 'html':
				embedHTML(creatorPath, dfd);
				break;
			case 'swf':
				embedFlash(creatorPath, widget_info.flash_version, dfd);
				break;
		}

		// Prevent closing accidentally
		$(window).bind('beforeunload', function() {
			if (importerPopup != null) { return importerPopup.close(); }
		});

		return dfd.promise();
	};

	var embedHTML = function(htmlPath, dfd) {
		$scope.htmlPath = htmlPath + "?" + widget_info.created_at;
		$scope.$apply();
		embedDoneDfd = dfd;

		const onPostMessage = function(e) {
			const origin = `${e.origin}/`;
			if ((origin === STATIC_CROSSDOMAIN) || (origin === BASE_URL)) {
				const msg = JSON.parse(e.data);
				switch (msg.type) {
					case 'start': // The creator notifies us when its ready
						return onCreatorReady();
					case 'save': // The creator issued a save request
						return save(msg.data[0], msg.data[1], msg.data[2]); // instanceName, qset
					case 'cancelSave': // the creator canceled a save request
						return onSaveCanceled(msg.data[0]); // msg
					case 'showMediaImporter': // the creator wants to import media
						return showMediaImporter(msg.data);
					case 'setHeight': // the height of the creator has changed
						return setHeight(msg.data[0]);
					case 'alert':
						return _alert(msg.data);
					default:
						return _alert(`Unknown message from creator: ${msg.type}`);
				}
			} else {
				return _alert(`Error, cross domain restricted for ${origin}`);
			}
		};

		// setup the postmessage listener
		if (typeof addEventListener !== 'undefined' && addEventListener !== null) {
			return addEventListener('message', onPostMessage, false);
		}
	};

	var embedFlash = function(path, version, dfd) {
		// register global callbacks for ExternalInterface calls
		window.__materia_flash_onCreatorReady = onCreatorReady;
		window.__materia_flash_importMedia    = showMediaImporter;
		window.__materia_flash_save           = save;
		window.__materia_flash_cancelSave     = onSaveCanceled;

		// store this dfd so that we can keep things synchronous
		// it will be resolved by the engine once it's loaded via onCreatorReady
		embedDoneDfd = dfd;
		if (swfobject.hasFlashPlayerVersion('1') === false) {
			return $scope.$apply(() => $scope.type = "noflash");
		} else {
			// setup variable to send to flash
			const flashvars = {
				URL_WEB: BASE_URL,
				URL_GET_ASSET: `${BASE_URL}media/`,
				widget_id,
				inst_id
			};

			const params = {
				menu: 'false',
				allowFullScreen: 'true',
				AllowScriptAccess: 'always'
			};

			const attributes = {id: EMBED_TARGET, wmode: 'opaque' };
			const expressSwf = `${BASE_URL}assets/flash/expressInstall.swf`;
			let width      = '100%';
			let height     = '100%';

			// Needed to check for ie8 browsers to add a border to the swf object.
			if (typeof ie8Browser !== 'undefined' && ie8Browser !== null) {
				width = '99.7%';
				height = '99.7%';
			}

			return swfobject.embedSWF(path, EMBED_TARGET, width, height, version, expressSwf, flashvars, params, attributes);
		}
	};

	// Resizes the swf according to the window height
	const resizeCreator = function() {
		$('.center').height($(window).height() - BOTTOM_OFFSET);
		// This fixes a bug in chrome where the iframe (#container)
		// doesn't correctly fill 100% of the height. Doing this with
		// just CSS doesn't work - it needs to be done in JS
		return $('#container').css('position', 'relative');
	};

	// Show the buttons that interact with the creator
	const showButtons = function() {
		const dfd = $.Deferred().resolve();
		// change the buttons if this isnt a draft
		if (instance && !instance.is_draft) {
			$scope.publishText = "Update";
			$scope.updateMode = true;
		}
		enableReturnLink();
		$scope.showActionBar = true;
		$scope.$apply();
		return dfd.promise();
	};

	// Changes the Return link's functionality depending on use
	var enableReturnLink = function() {
		if (inst_id != null) {
			// editing
			$scope.returnUrl = getMyWidgetsUrl(inst_id);
			$scope.returnPlace = "my widgets";
		} else {
			// new
			$scope.returnUrl = `${BASE_URL}widgets`;
			$scope.returnPlace = "widget catalog";
		}
		return $scope.$apply();
	};

	const onPreviewPopupBlocked = function(url) {
		$scope.popup = "blocked";
		$scope.previewUrl = url;
		return $scope.$apply();
	};

	// When the creator says it's ready
	// Note this is psuedo public as it's exposed to flash
	var onCreatorReady = function() {
		creator = $('#container').get(0);
		// resize swf now and when window resizes
		$(window).resize(resizeCreator);
		resizeCreator();

		return embedDoneDfd.resolve(); // used to keep events synchronous
	};

	// Show an embedded dialog, as opposed to a popup
	var showEmbedDialog = url => $scope.iframeUrl = url;

	// move the embed dialog off to invisibility
	const hideEmbedDialog = function() {
		$scope.iframeUrl = "";
		$scope.modal = false;
		return setTimeout((function() {
			$scope.$apply();
		}), 0);
	};

	// Note this is psuedo public as it's exposed to flash
	var showMediaImporter = function(types) {
		showEmbedDialog(`${BASE_URL}media/import#${types.join(',')}`);
		$scope.modal = true;
		setTimeout((function() {
			$scope.$apply();
		}), 0);
		return null; // else Safari will give the .swf data that it can't handle
	};

	// save called by the widget creator
	// Note this is psuedo public as it's exposed to flash
	var save = function(instanceName, qset, version) {
		if (version == null) { version = 1; }
		return widgetSrv.saveWidget({
			widget_id,
			name: instanceName,
			qset: {version, data:qset},
			is_draft: saveMode !== 'publish',
			inst_id
		}
			, function(inst) {
				// did we get back an error message?
				if ((inst != null ? inst.msg : undefined) != null) {
					onSaveCanceled(inst);
					$scope.alert.fatal = inst.halt;
					return $scope.$apply();
				} else if ((inst != null) && (inst.id != null)) {
					// update this creator's url
					if (String(inst_id).length !== 0) { window.location.hash = `#${inst.id}`; }

					switch (saveMode) {
						case 'preview':
							var url = `${BASE_URL}preview/${inst.id}`;
							var popup = window.open(url);
							inst_id  = inst.id;
							if (popup != null) {
								$timeout(function() {
									if (!(popup.innerHeight > 0)) { return onPreviewPopupBlocked(url); }
								}
								, 200);
							} else {
								onPreviewPopupBlocked(url);
							}
							break;
						case 'publish':
							window.location = getMyWidgetsUrl(inst.id);
							break;
						case 'save':
							$scope.saveText = "Saved!";
							sendToCreator('onSaveComplete', [inst.name, inst.widget, inst.qset.data, inst.qset.version]);
							inst_id  = inst.id;
							instance = inst;
							$scope.saveStatus = 'saved';
							break;
					}

					$scope.$apply();
					return setTimeout(function() {
						$scope.saveText = "Save Draft";
						$scope.saveStatus = 'idle';
						return $scope.$apply();
					}
					, 5000);
				}
		});
	};

	// When the Creator cancels a save request
	// Note this is psuedo public as it's exposed to flash
	var onSaveCanceled = function(msg) {
		$scope.saveText = "Can Not Save!";

		if ((msg != null ? msg.msg : undefined) != null) {
			if (msg.halt != null) {
				_alert(`Unfortunately, your progress was not saved because \
${msg.msg.toLowerCase()}. Any unsaved progress will be lost.`, "Invalid Login", true, true);
				return stopHeartBeat();
			}
		} else {
			if (msg) { return _alert(`Unfortunately your progress was not saved because \
${msg.toLowerCase()}`, 'Hold on a sec', false, false); }
		}
	};

	var setHeight = h => $('#container').height(h);

	var _alert = function(msg, title= null, fatal, enableLoginButton) {
		if (fatal == null) { fatal = false; }
		if (enableLoginButton == null) { enableLoginButton = false; }
		return $scope.$apply(function() {
			$scope.alert.msg = msg;
			if (title !== null) { $scope.alert.title = title; }
			$scope.alert.fatal = fatal;
			return $scope.alert.enableLoginButton = enableLoginButton;
		});
	};

	// Exposed to the window object so that popups and frames can use this public functions
	Namespace("Materia").Creator = {
		// Exposed to the question importer screen
		onQuestionImportComplete(questions) {
			hideEmbedDialog();
			if (!questions) { return; }
			// assumes questions is already a JSON string
			questions = JSON.parse(questions);
			return sendToCreator('onQuestionImportComplete', [questions]);
		},

		// Exposed to the media importer screen
		onMediaImportComplete(media) {
			hideEmbedDialog();

			if (media !== null) {
				// convert the sparce array that was converted into an object back to an array (ie9, you SUCK)
				const anArray = [];
				for (let element of Array.from(media)) {
					anArray.push(element);
				}
				return sendToCreator('onMediaImportComplete', [anArray]);
			}
		}
	};

	// synchronise the asynchronous events
	if (inst_id != null) {
		return getQset().then(function() {
			if (!$scope.invalid) {
				return $.when(widgetSrv.getWidget(inst_id))
					.pipe(embed)
					.pipe(initCreator)
					.pipe(showButtons)
					.pipe(startHeartBeat)
					.fail(onInitFail);
			}
		});
	} else {
		return $.when(getWidgetInfo())
			.pipe(embed)
			.pipe(initCreator)
			.pipe(showButtons)
			.pipe(startHeartBeat)
			.fail(onInitFail);
	}
});
