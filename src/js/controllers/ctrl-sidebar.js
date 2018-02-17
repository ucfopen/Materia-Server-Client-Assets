/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Handles all of the calls for the sidebar
const app = angular.module('materia');
// The sidebar on My Widgets
app.controller('SidebarController', ($scope, widgetSrv) =>
	$scope.setSelected = id => widgetSrv.updateHashUrl(id)
);

