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
app.filter('highlight', $sce => (text, search) => {
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
})

app.filter(
	'multiword',
	() =>
		function(input, searchText, AND_OR) {
			searchText = searchText || ''
			if (searchText === '') return input

			const splitted = searchText.toLowerCase().split(/\s+/)
			const regexp_and = `(?=.*${splitted.join(')(?=.*')})`
			const regexp_or = searchText.toLowerCase().replace(/\s+/g, '|')
			const re = new RegExp(AND_OR === 'AND' ? regexp_and : regexp_or, 'i')

			return input.filter(item => re.test(item.searchCache))
		}
)
