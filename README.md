# Materia Client Assets

This repository contains all the javascript and css needed for the Materia Server and some assets needed for the Materia Widget Development Kit.

Visit the [Materia Documentation](https://ucfopen.github.io/Materia-Docs) for more information.


# Conventions and Guidelines

## Angular

* Each module is in it's own file, in a directory matching the type of module it is
* use dashes to seperate words in file names
* tests use the same name of the module they are testing (`module.js` and `module.test.js`)
* file names start with the type of module it is: `filter-`, `dir-`, `ctrl-`, `srv-`
* reusable code that has a wider scope then a single module is placed in a service module


### Order of Code Angular Controllers

By convention, all controllers are written in a certain order from top to bottom:

1. Variables and constants used in the controller
2. Function defenitions, do define directly on $scope
3. Expose variables and methods to $scope
4. Initialize state


```javascript
const app = angular.module('materia')
app.controller('peopleController', function($scope) {
	// define vars and consts
	let _people = []

	// define functions
	const _sortNames = (a, b) => `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`)

	const getPeople () => {
		// load users from some place
		_people.sort(_sortNames)
		$scope.people = _people
	}

	// Expose on scope
	$scope.people = []
	$scope.getPeople = getPeople

	// initialize
	getPeople()
})
```
