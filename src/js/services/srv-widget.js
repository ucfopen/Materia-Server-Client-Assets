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
const app = angular.module('materia')
app.service('widgetSrv', function(selectedWidgetSrv, dateTimeServ, $q, $rootScope, $window) {
	const deferred = $q.defer()
	let _widgets = []
	const _widgetIds = {}
	let gotAll = false
	const widgetTemplate = null
	const cache = null

	const sortWidgets = () => _widgets.sort((a, b) => b.created_at - a.created_at)

	const getWidgets = () => {
		const deferred = $q.defer()

		if (_widgets.length === 0 || !gotAll) {
			gotAll = true
			_getFromServer().then(widgets => {
				_widgets = widgets.slice(0)
				sortWidgets()
				deferred.resolve(_widgets)
			})
		} else {
			deferred.resolve(_widgets)
		}

		return deferred.promise
	}

	const getWidget = (id = null) => {
		const deferred = $q.defer()

		if (!id && _widgets.length !== 0) {
			// return all widgets if no id was requested and we have some
			deferred.resolve(_widgets)
		} else if (id && _widgetIds[id] != null) {
			// return the requested widget if we have it
			deferred.resolve(_widgetIds[id])
		} else {
			// we dont have any widgets or the requested one, get it/them
			_getFromServer(id).then(widgets => {
				deferred.resolve(id ? _widgetIds[id] : _widgets)
			})
		}

		return deferred.promise
	}

	const getWidgetInfo = id => {
		const deferred = $q.defer()
		if (id !== null) id = [[id]]
		Materia.Coms.Json.send('widgets_get', id, data => {
			deferred.resolve(data)
		})
		return deferred.promise
	}

	const getWidgetsByType = type => {
		const deferred = $q.defer()
		if (type === null) {
			type = 'featured'
		}
		Materia.Coms.Json.send('widgets_get_by_type', [type], data => {
			deferred.resolve(data)
		})
		return deferred.promise
	}

	const saveWidget = _params => {
		const deferred = $q.defer()
		const defaults = {
			qset: null,
			is_draft: null,
			open_at: null,
			close_at: null,
			attempts: null,
			guest_access: null,
			embedded_only: null
		}

		let params = Object.assign({}, defaults, _params)

		if (params.inst_id != null) {
			// limit args to the the following params
			let args = [
				params.inst_id,
				params.name,
				params.qset,
				params.is_draft,
				params.open_at,
				params.close_at,
				params.attempts,
				params.guest_access,
				params.embedded_only
			]
			Materia.Coms.Json.send('widget_instance_update', args, widget => {
				if (widget != null) {
					// replace our widget in place
					let match = _widgets.findIndex(w => w.id === widget.id)
					if (match !== -1) {
						_widgets[match] = widget
						_widgetIds[widget.id] = widget
					}
					deferred.resolve(widget)
				}
			})
		} else {
			let args = [params.widget_id, params.name, params.qset, params.is_draft]
			Materia.Coms.Json.send('widget_instance_new', args, widget => {
				if (widget != null) {
					// add to widgets
					_widgets.push(widget)
					_widgetIds[widget.id] = widget
					deferred.resolve(widget)
				}
			})
		}

		return deferred.promise
	}

	// @TODO: rename to a more accurate name
	// gets an instance by id fom the server
	// sorts widgets
	// broadcasts the update
	// and updates the url @TODO: this shouldn't be part of this service
	const addWidget = inst_id => {
		return getWidget(inst_id).then(widget => {
			_widgets.push(widget)
			sortWidgets()
			$rootScope.$broadcast('widgetList.update')
			updateHashUrl(widget.id)
		})
	}

	const removeWidget = inst_id => {
		let selectedIndex
		let index = -1
		_widgets = _widgets.filter((widget, i) => {
			if (widget.id === inst_id) {
				index = i
				return false
			}
			return true
		})

		if (index === -1) {
			// not found
			return
		}
		if (index === 0) {
			// first item, when it's gone, select the first one again
			selectedIndex = 0
		} else {
			// select the item after the one we delete
			selectedIndex = index - 1
		}

		const newSelectedWidget = _widgets[selectedIndex]
		if (newSelectedWidget) {
			updateHashUrl(newSelectedWidget.id)
			sortWidgets()
		}
		$rootScope.$broadcast('widgetList.update')
	}

	var _getFromServer = optionalId => {
		const deferred = $q.defer()
		if (optionalId != null) {
			optionalId = [[optionalId]]
		}
		Materia.Coms.Json.send('widget_instances_get', optionalId, widgets => {
			_widgets = []

			if (widgets != null && widgets.length != null) {
				for (
					let i = 0, end = widgets.length, asc = 0 <= end;
					asc ? i < end : i > end;
					asc ? i++ : i--
				) {
					const w = widgets[i]
					_widgetIds[w.id] = w
					_widgets.push(w)
					w.searchCache = `${w.id} ${w.widget.name} ${w.name}`.toLowerCase()
				}
			}

			deferred.resolve(_widgets)
		})

		return deferred.promise
	}

	var updateHashUrl = widgetId => ($window.location.hash = `/${widgetId}`)

	const convertAvailibilityDates = (startDateInt, endDateInt) => {
		let endDate, endTime, open_at, startTime
		startDateInt = ~~startDateInt
		endDateInt = ~~endDateInt
		endDate = endTime = 0
		open_at = startTime = 0

		if (endDateInt > 0) {
			endDate = dateTimeServ.parseObjectToDateString(endDateInt)
			endTime = dateTimeServ.parseTime(endDateInt)
		}

		if (startDateInt > 0) {
			open_at = dateTimeServ.parseObjectToDateString(startDateInt)
			startTime = dateTimeServ.parseTime(startDateInt)
		}

		return {
			start: {
				date: open_at,
				time: startTime
			},
			end: {
				date: endDate,
				time: endTime
			}
		}
	}

	// @TODO navigation should be moved out of this method
	const selectWidgetFromHashUrl = () => {
		if ($window.location.hash) {
			let selID = $window.location.hash.substr(1)
			if (selID.substr(0, 1) === '/') {
				selID = selID.substr(1)
			}

			getWidget(selID).then(widget => {
				if (widget) {
					selectedWidgetSrv.set(widget)
				} else {
					selectedWidgetSrv.notifyAccessDenied()
				}
			})
		}
	}

	$window.addEventListener('hashchange', selectWidgetFromHashUrl, false)

	return {
		getWidgets,
		getWidgetsByType,
		getWidget,
		getWidgetInfo,
		sortWidgets,
		saveWidget,
		addWidget,
		removeWidget,
		updateHashUrl,
		selectWidgetFromHashUrl,
		convertAvailibilityDates
	}
})
