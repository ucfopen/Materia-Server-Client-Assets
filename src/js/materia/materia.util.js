/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').Util = (function() {

	// Use for cross side scripting prevention.
	const escapeUntrustedContent = text =>
		text
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot')
			.replace(/'/g, '&#x27')
			.replace(/\//g, '&#x2F')
	;

	return {escapeUntrustedContent};
})();