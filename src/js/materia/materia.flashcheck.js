// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Determines if Flash is installed and what version
Namespace('Materia').Flashcheck = (function() {
	let _flashVersionObj = null;
	// Returns the flash version, false if not installed.
	const getFlashVersion = function(callback) {
		let return_val;
		_flashVersionObj = swfobject.getFlashPlayerVersion();

		if (_flashVersionObj.major !== 0) {
			return_val = _flashVersionObj;
		} else {
			return_val = false;
		}

		if (callback != null) { return callback(return_val); }
	};


	return {flashInstalled : getFlashVersion};
})();
