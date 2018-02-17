// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.service('widgetSrv', function(selectedWidgetSrv, dateTimeServ, $q, $rootScope, $window) {

	const deferred = $q.defer();
	let _widgets = [];
	const _widgetIds = {};
	const gotAll = false;
	const widgetTemplate = null;
	const cache = null;

	const sortWidgets = () => _widgets.sort((a,b) => b.created_at - a.created_at);

	const getWidgets = function() {
		if ((_widgets.length === 0) || !gotAll) {
			const _gotAll = true;
			return _getFromServer(null, function(widgets) {
				_widgets = widgets.slice(0);
				sortWidgets();
				return deferred.resolve(_widgets);
			});
		} else {
			return _widgets;
		}
	};

	const getWidget = function(id, callback) {
		const dfd = $.Deferred();
		if (_widgetIds[id] != null) {
			dfd.resolve(_widgetIds[id]);
		} else {
			_getFromServer(id, function(widgets) {
				dfd.resolve(widgets);
				if (callback) {
					return callback(widgets);
				}
			});
		}
		return dfd.promise();
	};

	const getWidgetInfo = function(id, callback) {
		if (id !== null) {
			id = [[id]];
		}
		return Materia.Coms.Json.send('widgets_get', id, callback);
	};

	const getWidgetsByType = function(type, callback) {
		if (type === null) { type = 'featured'; }
		return Materia.Coms.Json.send('widgets_get_by_type', [type], callback);
	};

	const saveWidgetTemplate = (obj, callback) => Materia.Coms.Json.send('widget_update', [obj], callback);

	const saveWidget = function(_params, callback) {
		const params = {
			qset: null,
			is_draft: null,
			open_at: null,
			close_at: null,
			attempts: null,
			guest_access: null,
			embedded_only: null
		};

		$.extend(params, _params);

		if (params.inst_id != null) {
			return Materia.Coms.Json.send('widget_instance_update', [params.inst_id, params.name, params.qset, params.is_draft, params.open_at, params.close_at, params.attempts, params.guest_access, params.embedded_only], function(widget) {
				if (widget != null) {
					for (let i = 0, end = _widgets.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
						if (_widgets[i] === widget.id) {
							_widgets[i] = widget;
							break;
						}
					}
					_widgetIds[widget.id] = widget;
					return callback(widget);
				}
			});
		} else {
			return Materia.Coms.Json.send('widget_instance_new', [params.widget_id, params.name, params.qset, params.is_draft], function(widget) {
				if (widget != null) {
					// add to widgets
					_widgets.push(widget);
					_widgetIds[widget.id] = widget;
					return callback(widget);
				}
			});
		}
	};

	const addWidget = inst_id =>
		getWidget(inst_id).then(function(widget) {
			_widgets.push(widget[0]);
			sortWidgets();
			$rootScope.$broadcast('widgetList.update', '');
			return updateHashUrl(widget[0].id);
		})
	;

	const removeWidget = function(inst_id) {
		let selectedIndex;
		let index = -1;
		_widgets = _widgets.filter(function(widget, i) {
			if (widget.id === inst_id) {
				index = i;
				return null;
			} else {
				return widget;
			}
		});

		if (index === -1) { return; }

		if (index === 0) {
			selectedIndex = 0;
		} else if (index > 0) {
			selectedIndex = index - 1;
		}

		const newWidget = _widgets[selectedIndex];
		if (newWidget) {
			updateHashUrl(newWidget.id);
			sortWidgets();
		}
		return $rootScope.$broadcast('widgetList.update', '');
	};

	var _getFromServer = function(optionalId, callback) {
		if (optionalId != null) { optionalId = [[optionalId]]; }

		return Materia.Coms.Json.send('widget_instances_get', optionalId, function(widgets) {
			_widgets = [];

			if ((widgets != null) && (widgets.length != null)) {
				for (let i = 0, end = widgets.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
					const w = widgets[i];
					_widgetIds[w.id] = w;
					_widgets.push(w);
					w.searchCache = `${w.id} ${w.widget.name} ${w.name}`.toLowerCase();
				}
			}

			return callback(_widgets);
		});
	};

	var updateHashUrl = widgetId => $window.location.hash = `/${widgetId}`;

	const convertAvailibilityDates = function(startDateInt, endDateInt) {
		let endDate, endTime, open_at, startTime;
		startDateInt = ~~startDateInt;
		endDateInt = ~~endDateInt;

		if (endDateInt > 0) {
			endDate = dateTimeServ.parseObjectToDateString(endDateInt);
			endTime = dateTimeServ.parseTime(endDateInt);
		} else {
			endDate = (endTime = 0);
		}

		if (startDateInt > 0) {
			open_at = dateTimeServ.parseObjectToDateString(startDateInt);
			startTime = dateTimeServ.parseTime(startDateInt);
		} else {
			open_at = (startTime = 0);
		}

		// return start, end datetime
		return {
			start: {
				date:open_at,
				time:startTime
			},
			end: {
				date:endDate,
				time: endTime
			}
		};
	};

	const selectWidgetFromHashUrl = function() {
		if ($window.location.hash) {
			let found = false;
			let selID = $window.location.hash.substr(1);
			if (selID.substr(0, 1) === "/") {
				selID = selID.substr(1);
			}

			for (let widget of Array.from(_widgets)) {
				if (widget.id === selID) {
					found = true;
					break;
				}
			}

			if (found) {
				return getWidget(selID).then(inst => selectedWidgetSrv.set(inst));
			} else {
				return selectedWidgetSrv.notifyAccessDenied();
			}
		}
	};

	$($window).bind('hashchange', selectWidgetFromHashUrl);

	return {
		getWidgets,
		getWidgetsByType,
		getWidget,
		getWidgetInfo,
		sortWidgets,
		saveWidgetTemplate,
		saveWidget,
		addWidget,
		removeWidget,
		updateHashUrl,
		selectWidgetFromHashUrl,
		convertAvailibilityDates
	};
});

