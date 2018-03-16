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


global.API_LINK = '/api/'
global.BASE_URL = 'https://test_base_url.com/'
global.WIDGET_URL = 'widget_url/'
global.STATIC_CROSSDOMAIN = 'https://crossdomain.com/'
global.MEDIA_URL = 'https://mediaurl.com/'
global.getMockApiData = (type) => {
	return require(`./__test__/mockapi/${type}.json`)
}

// global.$ = require('jquery');

beforeEach(() => { testResetAngular(); resetNamespace(); });
