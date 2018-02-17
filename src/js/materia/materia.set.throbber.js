// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Set').Throbber = (function() {
	
	const startSpin = function(element, opts) {
		if ((typeof $ !== 'undefined' && $ !== null) && ($(element).spin != null)) {
			return $(element).spin(opts);
		}
	};

	const stopSpin = function(element) {
		if ((typeof $ !== 'undefined' && $ !== null) && ($(element).spin != null)) {
			return $(element).spin(false);
		}
	};

	return {
		startSpin,
		stopSpin
	};
})();
