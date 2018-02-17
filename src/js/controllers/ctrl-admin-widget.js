/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.controller('adminWidgetController', function($scope, adminSrv) {

	$scope.selectedFileName = 'No File Selected';
	$scope.widgets = [];

	$scope.save = function(widget) {
		const update = {
			id: widget.id,
			clean_name: widget.clean_name,
			in_catalog: widget.in_catalog,
			is_editable: widget.is_editable,
			is_scorable: widget.is_scorable,
			is_playable: widget.is_playable,
			about: widget.meta_data.about,
			excerpt: widget.meta_data.excerpt,
			demo: widget.meta_data.demo
		};
		return adminSrv.saveWidget(update, function(response) {
			widget.errorMessage = [];
			for (let prop in response) {
				const stat = response[prop];
				if (stat !== true) { widget.errorMessage.push(stat); }
			}
			if (widget.errorMessage.len === 0) { delete widget.errorMessage; }
			return $scope.$apply();
		});
	};

	const displayWidgets = () =>
		adminSrv.getWidgets(function(widgets) {
			for (let i = 0; i < widgets.length; i++) {
				const widget = widgets[i];
				widget.icon = Materia.Image.iconUrl(widget.dir, 60);
			}

			$scope.widgets = widgets;
			return $scope.$apply();
		})
	;

	// since the file input is hidden, watch events on it so we can put selected filenames elsewhere
	document.getElementById('widget_uploader').addEventListener('change', function(e) {
		$scope.selectedFileName = 'No File Selected';
		if ((this.files != null ? this.files.length : undefined) > 0) {
			$scope.selectedFileName = this.files[0].name;
		}
		return $scope.$apply();
	});

	return displayWidgets();
});