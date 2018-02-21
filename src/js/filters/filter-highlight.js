const app = angular.module('materia')

const entityMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;'
}

const escapeHtml = string => String(string).replace(/[&<>"'\/]/g, s => entityMap[s])

// Highlights search matches, used on My Widgets sidebar
app.filter('highlight', function($sce) {
	return (text, search) => {
		text = escapeHtml(text)
		if (search) {
			const searchTerms = search.split(' ')
			for (search of searchTerms) {
				text = text.replace(new RegExp(`(${search})`, 'gi'), (a, b, c, d) => {
					const t = d.substr(c).split('<')
					if (t[0].indexOf('>') !== -1) {
						return a
					}
					return `<span class="highlighted">${a}</span>`
				})
			}
		}
		return $sce.trustAsHtml(text)
	}
})
