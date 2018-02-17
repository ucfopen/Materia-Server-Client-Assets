/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.service('selectedWidgetSrv', function($rootScope, $q, OBJECT_TYPES) {

	const STORAGE_TABLE_MAX_ROWS_SHOWN = 100;

	const selectedData = null;
	const storageData = null;
	const instId = null;

	// Refactored variables
	let _widget = null;
	let _dateRanges = null;
	let _scoreData = null;
	let _storageData = null;

	// get and set _widget
	const set = function(widget) {
		_scoreData = null;
		_storageData = null;
		_widget = widget;
		return $rootScope.$broadcast('selectedWidget.update');
	};

	const get = () => _widget;

	const getSelectedId = () => _widget.id;

	const getScoreSummaries = function() {
		const deferred = $q.defer();

		if (_scoreData) { deferred.resolve(_scoreData);
		} else {
			Materia.Coms.Json.send('score_summary_get', [_widget.id, true], function(data) {

				_scoreData = {
					list: [],
					map: {},
					last: undefined
				};

				if ((data !== null) && (data.length > 0)) {
					const o = {};
					const last = data[0].id;
					for (let d of Array.from(data)) {
						o[d.id] = d;
					}

					_scoreData = {
						list: data,
						map: o,
						last: data[0]
					};
				}

				return deferred.resolve(_scoreData);
			});
		}

		return deferred.promise;
	};

	const getUserPermissions = function() {
		const deferred = $q.defer();
		Materia.Coms.Json.send('permissions_get', [OBJECT_TYPES.WIDGET_INSTANCE, _widget.id], function(perms) {
			const permsObject = {
				user : perms.user_perms,
				widget: perms.widget_user_perms
			};

			return deferred.resolve(permsObject);
		});

		return deferred.promise;
	};

	const getPlayLogsForSemester = function(term, year) {
		const deferred = $q.defer();

		Materia.Coms.Json.send('play_logs_get', [_widget.id, term, year], function(logs) {

			const semesterKey = `${year}${term.toLowerCase()}`;

			const logsForSemester = [];

			angular.forEach(logs, function(log, key) {

				const timestamp = log.time;
				const logMeta = getSemesterFromTimestamp(timestamp);
				const semesterString = logMeta.year + logMeta.semester.toLowerCase();

				if (semesterString === semesterKey) {
					return logsForSemester.push(log);
				}
			});

			return deferred.resolve(logsForSemester);
		});
		return deferred.promise;
	};

	const getDateRanges = function() {
		const deferred = $q.defer();
		if (_dateRanges == null) {
			Materia.Coms.Json.send('semester_date_ranges_get', [], function(data) {
				_dateRanges = data;
				return deferred.resolve(data);
			});
		} else {
			deferred.resolve(_dateRanges);
		}
		return deferred.promise;
	};

	// getCurrentSemester = ->
	// 	return selectedData.year + ' ' + selectedData.term

	var getSemesterFromTimestamp = function(timestamp) {
		for (let range of Array.from(_dateRanges)) {
			if ((timestamp >= parseInt(range.start, 10)) && (timestamp <= parseInt(range.end, 10))) { return range; }
		}
		return undefined;
	};

	const getStorageData = function() {

		const deferred = $q.defer();

		if (_storageData != null) { deferred.resolve(_storageData);
		} else {
			Materia.Coms.Json.send('play_storage_get', [_widget.id], function(data) {

				_storageData = {};

				const temp = {};

				// process semester data and organize by table name
				angular.forEach(data, (tableData, tableName) => temp[tableName] = processDataIntoSemesters(tableData));

				// have to loop through each table present in the storage data
				angular.forEach(temp, (semesters, tableName) =>

					// have to loop through each semester contained within each table
					angular.forEach(semesters, function(semesterData, semesterId) {

						if (typeof _storageData[semesterId] === 'undefined') {
							_storageData[semesterId] = {};
						}

						if (semesterData.length > STORAGE_TABLE_MAX_ROWS_SHOWN) {
							_storageData[semesterId][tableName] = {truncated:true, total:semesterData.length, data:semesterData.slice(0, STORAGE_TABLE_MAX_ROWS_SHOWN)};
						} else {
							_storageData[semesterId][tableName] = {truncated:false, data:semesterData};
						}

						return _storageData[semesterId][tableName].data = normalizeStorageDataColumns(_storageData[semesterId][tableName].data);
					})
				);

				return deferred.resolve(_storageData);
			});
		}

		return deferred.promise;
	};

	var processDataIntoSemesters = function(logs) {
		const semesters = {};
		let timestamp = null;

		angular.forEach(logs, function(log, index) {

			timestamp = log.play.time;
			const logMeta = getSemesterFromTimestamp(timestamp);
			const semesterString = logMeta.year + ' ' + logMeta.semester.toLowerCase();

			if (!semesters[semesterString]) {
				semesters[semesterString] = [];
			}
			return semesters[semesterString].push(log);
		});

		return semesters;
	};

	//  storage data doesn't really enforce a schema.
	//  this function determines every field used throughout the
	//  storage data and then applies that schema to each item.
	var normalizeStorageDataColumns = function(rows) {
		//  go through all the rows and collect the fields used:
		curRow;
		const fields = {};
		for (var r of Array.from(rows)) {
			var curRow = r.data;
			for (let j of Array.from(curRow)) {
				if (typeof j === 'undefined') {
					j = null;
				}
			}
		}

		//  now go through each row again and add in the missing fields
		for (r of Array.from(rows)) {
			r.data = $.extend({}, fields, r.data);
		}

		return rows;
	};

	const getMaxRows = () => STORAGE_TABLE_MAX_ROWS_SHOWN;

	const updateAvailability = function(attempts, open_at, close_at, guest_access, embedded_only) {
		_widget.attempts = attempts;
		_widget.open_at = open_at;
		_widget.close_at = close_at;
		_widget.guest_access = guest_access;
		_widget.embedded_only = embedded_only;

		if (_widget.student_access && !guest_access) { _widget.student_access = false; }

		return $rootScope.$broadcast('selectedWidget.update');
	};

	const notifyAccessDenied = () => $rootScope.$broadcast('selectedWidget.notifyAccessDenied');

	return {
		set,
		get,
		getSelectedId,
		getScoreSummaries,
		getUserPermissions,
		getPlayLogsForSemester,
		getDateRanges,
		getSemesterFromTimestamp,
		getStorageData,
		getMaxRows,
		updateAvailability,
		notifyAccessDenied
	};
});

