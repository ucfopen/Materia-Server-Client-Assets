/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Validate').Textfield = (function() {
	const resctrict = function(type, event) {

		// Allow: backspace, delete, tab and escape Ctrl+A
		switch (event.keyCode) {
			case 8:case 9:case 27:case 35:case 36:case 37:case 38:
				return true;
				break;
			case 65: // Ctrl+A
				return event.ctrlKey === true;
				break;
		}

		switch (type) {
			case 'numeric':
				// Ensure that it is a number and stop the keypress
				return !((event.charCode < 48) || (event.charCode > 57));
				break;
			case 'time':
				return !((event.charCode < 48) || (event.charCode > 58));
				break;
		}
		return false;
	};

	const numericOnly = event => resctrict('numeric', event);

	const timeOnly = event => resctrict('time', event);

	return {
		numericOnly,
		timeOnly
	};
})();