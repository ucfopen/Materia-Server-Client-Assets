// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.MyWidgets').Tasks = (function() {

	const init = function(gateway) {};

	const copyWidget = (inst_id, newName, callback) => Materia.Coms.Json.send('widget_instance_copy', [inst_id, newName], callback);

	const deleteWidget = (inst_id, callback) => Materia.Coms.Json.send('widget_instance_delete', [inst_id], callback);

	return {
		init,
		copyWidget,
		deleteWidget
	};
})();
