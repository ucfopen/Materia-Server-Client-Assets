/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia');

const entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

const escapeHtml = string => String(string).replace(/[&<>"'\/]/g, s => entityMap[s]);

// Highlights search matches, used on My Widgets sidebar
app.filter('highlight', $sce =>
	function(text, search) {
		text = escapeHtml(text);
		if (search) {
			const searchTerms = search.split(" ");
			for (search of Array.from(searchTerms)) {
				text = text.replace(new RegExp(`(${search})`, 'gi'), function(a, b, c, d) {
					const t = d.substr(c).split("<");
					if (t[0].indexOf(">") !== -1) {
						return a;
					}
					return `<span class="highlighted">${a}</span>`;
				});
			}
		}
		return $sce.trustAsHtml(text);
	}
);

app.filter('multiword', () =>
	function(input, searchText, AND_OR) {
		searchText = searchText || '';
		const returnArray = [];

		const splitted = searchText.toLowerCase().split(/\s+/);
		const regexp_and = `(?=.*${splitted.join(")(?=.*")})`;
		const regexp_or = searchText.toLowerCase().replace(/\s+/g, "|");
		const re = new RegExp((AND_OR === "AND" ? regexp_and : regexp_or), "i");

		for (let x = 0, end = input.length, asc = 0 <= end; asc ? x < end : x > end; asc ? x++ : x--) {
			if (re.test(input[x].searchCache) || (searchText === '')) {
				returnArray.push(input[x]);
			}
		}

		return returnArray;
	}
);

