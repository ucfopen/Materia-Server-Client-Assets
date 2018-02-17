/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
// The modal that exports score CSVs on My Widgets
app.controller('ExportScoresController', function($scope, selectedWidgetSrv) {
	$scope.checkedAll = false;
	$scope.semesters = [];

	// Builds the initial version of the popup window
	const buildPopup = function() {
		const wgt = $scope.selected.widget;
		$scope.selectedId = wgt.id;

		if (($scope.selected.scores.list.length === 0) || !$scope.selected.hasScores) {
			$scope.exportOpts = ['Questions and Answers'];
		} else {
			let scores_only;
			if (wgt.guest_access) { scores_only = 'All Scores'; } else { scores_only = 'High Scores'; }
			$scope.exportOpts = [scores_only, 'Full Event Log', 'Questions and Answers'];
			if ((wgt.widget.meta_data.playdata_exporters != null ? wgt.widget.meta_data.playdata_exporters.length : undefined) > 0) { $scope.exportOpts = $scope.exportOpts.concat(wgt.widget.meta_data.playdata_exporters); }
		}

		$scope.exportType = $scope.exportOpts[0];
		return getScores();
	};

	// Finds all the scores with a given game instance id
	var getScores = () =>
		Materia.Coms.Json.send('score_summary_get', [$scope.selectedId], function(summary) {
			// Show export modal in callback because otherwise the text changes once the
			// callback is done
			$scope.show.exportModal = true;
			// Fill in the semesters from the server
			$scope.semesters = [];
			for (let s of Array.from(summary)) {
				const label = `${s.year} ${s.term}`;
				const id = `${s.year}_${s.term}`;
				$scope.semesters.push({
					label,
					id,
					checked: false
				});
			}

			// First semester is checked by default
			$scope.semesters[0].checked = true;
			$scope.onSelectedSemestersChange();
			return $scope.$apply();
		})
	;

	// Updates the header of the popup and the ids for the download button
	const updateDownloadInfo = function(checkedSemesters) {
		// Get the labels from the checked Semesters
		const labels = checkedSemesters.map(e => e.label);
		$scope.header = labels.join(", ");
		$scope.selectedSemesters = labels.join(",").replace(/\s/g, '-');
		if (checkedSemesters.length >=3) {
			return $scope.header = checkedSemesters[0].label + " and " + (checkedSemesters.length-1) + " more";
		}
	};

	// Updates the checkAll option depending on how many semesters are checked
	const updateCheckAll = checkedSemesters => $scope.checkedAll = checkedSemesters.length === $scope.semesters.length;

	// Called when semesters are checked or unchecked
	// Gets the checked semesters for the download information and checkAll
	$scope.onSelectedSemestersChange = function() {
		// Get the objects that have checked: true
		const checked = $scope.semesters.filter(e => e.checked);
		updateDownloadInfo(checked);
		return updateCheckAll(checked);
	};

	// Check or uncheck all semesters
	$scope.checkAll = function() {
		// Grab all of the checked semesters
		const checked = $scope.semesters.filter(e => e.checked);
		angular.forEach($scope.semesters, semester =>
			// If all of the semesters are checked, uncheck them all
			semester.checked = checked.length !== $scope.semesters.length
		);
		return $scope.onSelectedSemestersChange();
	};

	// Show or hide the semesters slideout
	$scope.showOptions = () => $scope.options = !$scope.options;

	return Namespace('Materia.MyWidgets').Csv =
		{buildPopup};
});
