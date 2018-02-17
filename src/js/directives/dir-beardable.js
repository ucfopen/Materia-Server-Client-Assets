// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
'use strict';

const app = angular.module('materia');
app.directive('beardable', () =>
	({
		restrict: 'A',
		controller($scope, $element, $attrs) {

			let beardMode = window.localStorage.beardMode === "true";
			let konami = '';

			const updateBeardCss = function() {
				const hasBeardCss = (document.getElementById('beard_css') != null);
				if (beardMode && !hasBeardCss) {
					const link = document.createElement("link");
					link.id = "beard_css";
					link.rel = "stylesheet";
					link.href = `${STATIC_CROSSDOMAIN}css/beard_mode.css`;
					return document.head.appendChild(link);
				} else if (hasBeardCss) {
					const css = document.getElementById('beard_css');
					return css.parentElement.removeChild(css);
				}
			};

			const konamiListener = function(event) {
				switch (event.which || event.keyCode) {
					case 38:
						if (konami !== 'u') { konami = ''; }
						konami += 'u';
						break;
					case 40:
						konami += 'd';
						break;
					case 37:
						konami += 'l';
						break;
					case 39:
						konami += 'r';
						break;
					case 66:
						konami += 'b';
						break;
					case 65:
						konami += 'a';
						break;
					default:
						konami = '';
				}

				if (konami === 'uuddlrlrba') {
					beardMode = !beardMode;
					updateBeardCss();

					return window.localStorage.beardMode = beardMode;
				}
			};

			window.addEventListener("keydown", konamiListener);

			return updateBeardCss();
		}
	})
);
