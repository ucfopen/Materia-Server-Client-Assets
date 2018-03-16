const app = angular.module('materia')
app.service('beardServ', function() {
	const beards = ['dusty_full', 'black_chops', 'grey_gandalf', 'red_soul']

	const getRandomBeard = () => beards[Math.floor(Math.random() * beards.length)]

	return { getRandomBeard }
})
