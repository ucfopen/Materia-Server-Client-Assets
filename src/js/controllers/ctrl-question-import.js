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
app.controller('questionImporterCtrl', function($scope, $sce) {
	let $selectedAssets = [];
	let $table = null;

	const _setupTable = function() {
		// listener for selecting a question row
		$(document).on('click', '#question-table tbody tr', function(e) {
			const $checkbox = $(this).find(':checkbox');
			const $selected = $(this).toggleClass('row_selected').hasClass('row_selected');
			$checkbox.prop('checked', $selected);  // update checkbox

			// stop the bubbling to prevent the row's click event
			if (e.target.type === 'checkbox') { e.stopPropagation(); }

			// add or remove the item from the selected ids
			if ($selected) {
				return $selectedAssets.push($checkbox.prop('value'));
			} else {
				return $selectedAssets.splice($selectedAssets.indexOf( $checkbox.prop('value') ), 1);
			}
		});

		$('#submit-button').click(function(e) {
			e.stopPropagation();
			_loadSelectedQuestions($selectedAssets);
			return false;
		});

		$('#cancel-button').click(function(e) {
			e.stopPropagation();
			return window.parent.Materia.Creator.onQuestionImportComplete(null);
		});

		// when the url has changes, reload the questions
		$(window).bind('hashchange', _loadAllQuestions);

		// on resize, re-fit the table size
		$(window).resize(function() {
			$('div.dataTables_scrollBody').height($(window).height() - 150);
			return $table.fnAdjustColumnSizing();
		});

		// setup the table
		$table = $('#question-table').dataTable({
			paginate: false, // don't paginate
			lengthChange: true, // resize the fields
			autoWidth: true,
			processing: true, // show processing dialog
			scrollY: '500px',  // setup to be a scrollable table
			language: {
				search : '',
				infoFiltered: ' / _MAX_',
				info: 'showing: _TOTAL_'
			},
			// columsn to display
			columns: [
				{ data: 'text' },
				{ data: 'type' },
				{ data: 'created_at' },
				{ data: 'uses' }
			],
			// special sorting options
			sorting: [[2, 'desc']],
			// item renderers
			columnDefs: [{
					// date render
					render( data, type, full, meta ) {
						const d = new Date(data*1000);
						return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
					},
					targets: 2
				}
				, {
					// select box
					render( data, type, full, meta  ) {
						return `<input type="checkbox" name="id" value="${full.id}" > <span class="q">${data}</span>`;
					},
					targets: 0
				}
			]});

		// re-fit the table now
		return $('div.dataTables_scrollBody').height($(window).height()-150);
	};

	var _loadAllQuestions = function() {
		$selectedAssets = [];
		$('#question-table').dataTable().fnClearTable(); // clear the table
		// determine the types from the url hash string
		const questionTypes = _getType();
		// load
		return _getQuestions(null, questionTypes, function(result) {
			// to prevent error messages when result is null
			if ((result !== null) && !(Array.from(result).includes('msg')) && (result.length > 0)) {
				$('#question-table').dataTable().fnClearTable();
				return $('#question-table').dataTable().fnAddData(result);
			}
		});
	};

	var _getQuestions = (questionIds, questionTypes, callback) => Materia.Coms.Json.send('questions_get', [questionIds, questionTypes], callback);

	var _loadSelectedQuestions = questionIds =>
		_getQuestions(questionIds, null, function(result) {
			if ((result != null) && !('msg' in result) && (result.length > 0)) {
				return window.parent.Materia.Creator.onQuestionImportComplete(JSON.stringify(result));
			}
		})
	;

	var _getType = function() {
		const l = document.location.href;
		const type = l.substring(l.lastIndexOf('=')+1);
		return type;
	};

	_setupTable();
	return _loadAllQuestions();
});

