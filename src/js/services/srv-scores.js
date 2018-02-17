/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');
app.service('scoreSrv', () =>
	({
		getWidgetInstanceScores(inst_id, token, callback) {
			return Materia.Coms.Json.send('widget_instance_scores_get', [inst_id, token], callback);
		},

		getWidgetInstancePlayScores(play_id, preview_inst_id, callback) {
			return Materia.Coms.Json.send('widget_instance_play_scores_get', [play_id, preview_inst_id], callback);
		},

		getGuestWidgetInstanceScores(inst_id, play_id, callback) {
			return Materia.Coms.Json.send('guest_widget_instance_scores_get', [inst_id, play_id], callback);
		}
	})
);

