// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia').Image = (function() {

	const iconUrl = function(widgetDir, size) {
		if (window.devicePixelRatio === 2) {
			return WIDGET_URL+widgetDir+'img/icon-'+size+'@2x.png';
		} else {
			return WIDGET_URL+widgetDir+'img/icon-'+size+'.png';
		}
	};

	const screenshotUrl = (widgetDir, size) => WIDGET_URL+widgetDir+'img/screen-shots/'+size+'.png';

	const screenshotThumbUrl = (widgetDir, size) => WIDGET_URL+widgetDir+'img/screen-shots/'+size+'-thumb.png';


	return {
		iconUrl,
		screenshotUrl,
		screenshotThumbUrl
	};
})();
