describe('dateTimeServ', function() {
	var _service
	var mockWindow
	var mockLocationSet
	var mockLocationGet

	beforeEach(() => {
		require('../materia-namespace')
		require('./srv-datetime')
		inject(function(dateTimeServ) {
			_service = dateTimeServ
		})
	})

	it('defines expected methods', () => {
		expect(_service.parseObjectToDateString).toBeDefined()
		expect(_service.parseTime).toBeDefined()
		expect(_service.fixTime).toBeDefined()
	})

	it('parseTime returns expected strings', () => {
		expect(_service.parseTime(1103155199)).toBe('6:59pm')
		expect(_service.parseTime(1103152100)).toBe('6:08pm')
		expect(_service.parseTime(1103159000)).toBe('8:03pm')

		expect(_service.parseTime(1103259000)).toBe('11:50pm')
		expect(_service.parseTime(1101159000)).toBe('4:30pm')
		expect(_service.parseTime(1103158800)).toBe('8:00pm')
		expect(_service.parseTime(1103259600)).toBe('12:00am')
	})

	it.skip('fixTime adjusts time based on server differences', () => {
		// @TODO: this function needs to be investigated
		// I believe we should just always make sure the server is storing UTC timestamps
		// and just display them in local time via js
		// which should require 0 time zone fixing in js, just load the utc time string
	})

	it('parseObjectToDateString returns time as expedted', () => {
		expect(_service.parseObjectToDateString(1103155199)).toBe('12/15/04')
		expect(_service.parseObjectToDateString(1103259000)).toBe('12/16/04')
		expect(_service.parseObjectToDateString(1101159000)).toBe('11/22/04')
		expect(_service.parseObjectToDateString(1103158800)).toBe('12/15/04')
	})
})
