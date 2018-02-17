/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Namespace function for defining namespaces
const app = angular.module('materia', ['ngModal']);
app.config($sceDelegateProvider => $sceDelegateProvider.resourceUrlWhitelist([ 'self', STATIC_CROSSDOMAIN + "**", BASE_URL + "**" ]));

window.API_LINK = '/api/json/';

window.isMobile = {
	Android() { return navigator.userAgent.match(/Android/i); },
	BlackBerry() { return navigator.userAgent.match(/BlackBerry/i); },
	iOS() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
	Opera() { return navigator.userAgent.match(/Opera Mini/i); },
	Windows() { return navigator.userAgent.match(/IEMobile/i); },
	any() { return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows()); }
};

// this code ensures that Opera runs onload/ready js events when navigating foward/back.
// http://stackoverflow.com/questions/10125701/
if ((typeof history !== 'undefined' && history !== null ? history.navigationMode : undefined) != null) {
	history.navigationMode = 'compatible';
}

