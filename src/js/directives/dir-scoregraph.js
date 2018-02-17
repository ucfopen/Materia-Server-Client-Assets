// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('scoreGraph', selectedWidgetSrv =>
	({
		restrict: 'A',
		link($scope, $element, $attrs) {

			const id = $attrs.id.split("_")[1];

			const scores = selectedWidgetSrv.getScoreSummaries();
			return scores.then(function(data) {
				const brackets = data.map[id].distribution;

				// Don't try creating a graph if there's nothing to put in it
				if (brackets) {
					// If we don't defer, Angular might overwrite our element
					setTimeout(() => Materia.MyWidgets.Statistics.createGraph($attrs.id, brackets)
					, 0);
					return null;
				}
			});
		}
	})
);
