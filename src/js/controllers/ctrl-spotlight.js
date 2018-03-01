const app = angular.module('materia')
app.controller('spotlightCtrl', function() {
	// find all the spotlights, assign them an id, and make a radio button for them
	Materia.Store.SlideShow.formatCycler(document.querySelectorAll('.store_main'))
})
