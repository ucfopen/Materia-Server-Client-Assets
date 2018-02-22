// const playStorageMock = {
//     "MentalRotationTable": [
//         {
//             "play": {
//                 "user": "0396856",
//                 "firstName": "Ian",
//                 "lastName": "Turgeon",
//                 "time": "1281571299",
//                 "cleanTime": "02/21/2018 12:07:12 EST",
//                 "play_id": "3qVT1axpqa6nFUNLDpld5RTRsNVlQOTJ0VklIc05PY01Tb3R4Zmk4dHI3akFxeGZkZGpoRW5xRm8"
//             },
//             "data": {
//                 "Mirrored": "D",
//                 "Picture": "2",
//                 "ReactionTime": "594",
//                 "RotationAngle": "135",
//                 "SubjectCorrect": "false",
//                 "exists_in_one": "value"
//             }
//         },
//         {
//             "play": {
//                 "user": "0396856",
//                 "firstName": "Ian",
//                 "lastName": "Turgeon",
//                 "time": "1281571300",
//                 "cleanTime": "02/21/2018 12:07:12 EST",
//                 "play_id": "3qVT1axpqa6nFUNLDpld5RTRsNVlQOTJ0VklIc05PY01Tb3R4Zmk4dHI3akFxeGZkZGpoRW5xRm8"
//             },
//             "data": {
//                 "Mirrored": "D",
//                 "Picture": "4",
//                 "ReactionTime": "190",
//                 "RotationAngle": "45",
//                 "SubjectCorrect": "false",
//                 "exists_in_two": "fun"
//             }
//         }
//     ]
// }

// const semesterDateRangesMock = [
//     {
//         "year": "2010",
//         "semester": "Fall",
//         "start": "1281571200",
//         "end": "1292543999"
//     },
//     {
//         "year": "2011",
//         "semester": "Spring",
//         "start": "1292544000",
//         "end": "1304639999"
//     },
//     {
//         "year": "2011",
//         "semester": "Summer",
//         "start": "1304640000",
//         "end": "1313038799"
//     },
//     {
//         "year": "2011",
//         "semester": "Fall",
//         "start": "1313038800",
//         "end": "1323910699"
//     },
//     {
//         "year": "2012",
//         "semester": "Spring",
//         "start": "1323910700",
//         "end": "1336089539"
//     },
//     {
//         "year": "2012",
//         "semester": "Summer",
//         "start": "1336089540",
//         "end": "1344297600"
//     },
//     {
//         "year": "2012",
//         "semester": "Fall",
//         "start": "1344297601",
//         "end": "1356912000"
//     }
// ]

describe('scoreData Directive', function() {
	let _scope
	let _compile
	let _q
	let _selectedWidgetSrv

	beforeEach(() => {
		require('../materia-constants')
		require('../services/srv-selectedwidget')
		require('./dir-scoredata.js')

		inject(function($compile, $rootScope, selectedWidgetSrv, $q) {
			_selectedWidgetSrv = selectedWidgetSrv
			_compile = $compile
			_scope = $rootScope.$new()
			_q = $q
		})
	})

	it('is initialized on the element', function() {
		let data = { '2050 Summer': { table1: null, table2: null } }

		let deferred = _q.defer()
		jest.spyOn(_selectedWidgetSrv, 'getStorageData').mockImplementation(() => deferred.promise)

		jest.spyOn(_selectedWidgetSrv, 'getMaxRows').mockImplementation(() => 777)

		let html = '<div score-data id="data_66" data-semester="2050 Summer" data-has-storage="true" >'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		deferred.resolve(data)
		_scope.$apply()

		expect(_scope.tables).toMatchObject({ table1: null, table2: null })
		expect(_scope.MAX_ROWS).toBe(777)
		expect(_scope.tableNames).toMatchObject(['table1', 'table2'])
		expect(_scope.selectedTable).toBe('table1')
	})
})
