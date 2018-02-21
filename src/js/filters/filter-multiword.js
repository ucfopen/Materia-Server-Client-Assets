const app = angular.module('materia')

app.filter('multiword', () => (input, searchText) => {
	searchText = searchText || ''
	if (searchText === '') return input

	const splitted = searchText.toLowerCase().split(/\s+/)
	const regexp_and = `(?=.*${splitted.join(')(?=.*')})`
	const re = new RegExp(regexp_and, 'i')

	return input.filter(item => re.test(item.searchCache))
})
