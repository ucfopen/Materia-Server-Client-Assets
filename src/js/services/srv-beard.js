// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// TODO: rip out redundant methods
const app = angular.module('materia');
app.service('beardServ', function() {

	const beards = ['dusty_full', 'black_chops', 'grey_gandalf', 'red_soul'];

	const getRandomBeard = () => beards[Math.floor(Math.random() * beards.length)];

	return {getRandomBeard};
});

