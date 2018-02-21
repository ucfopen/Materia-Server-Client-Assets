require('angular/angular.js');
require('angular-mocks/angular-mocks.js');

global.testResetAngular = () => {
	jest.resetModules()
	angular.mock.module('materia')
	angular.module('materia', [])
}

global.resetNamespace = () => {
	if(window["Materia"]){
		window["Materia"] = null
	}
}

global.testGetFilter = (filterName, load = true) => {
	if(load){
		require(`./src/js/filters/filter-${filterName}`)
	}

	let filter
	inject(function($filter) {
		filter = $filter(filterName)
	})
	return filter
}

// global.$ = require('jquery');

beforeEach(() => { testResetAngular(); resetNamespace(); });
