const app = angular.module('materia')
app.service('dateTimeServ', function() {
	const parseObjectToDateString = function(time) {
		const timeObj = new Date(time * 1000)
		const year = String(timeObj.getFullYear())
		return timeObj.getMonth() + 1 + '/' + timeObj.getDate() + '/' + year.substr(2)
	}

	const parseTime = function(time) {
		const timeObj = new Date(time * 1000)
		let amPm = 'am'
		let hour = timeObj.getHours()
		let minute = timeObj.getMinutes()

		if (minute < 10) {
			minute = `0${minute}`
		}

		if (hour > 11) {
			if (hour !== 12) {
				hour -= 12
			}
			amPm = 'pm'
		} else {
			if (hour === 0) {
				hour = '12'
			}
		}

		return `${hour}:${minute}${amPm}`
	}

	const fixTime = (time, servTime) => {
		const timeToFix = new Date(time).getTime()
		const serverDateFromPage = servTime

		// calculate client/server time difference
		const now = new Date()
		const clientUTCDate = new Date(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
			now.getUTCHours(),
			now.getUTCMinutes(),
			now.getUTCSeconds()
		)
		const serverUTCDate = new Date(serverDateFromPage)
		const clientUTCTimestamp = clientUTCDate.getTime()
		const serverUTCTimestamp = serverUTCDate.getTime()
		const offset = serverUTCTimestamp - clientUTCTimestamp

		const newDate = new Date(timeToFix + offset)
		const fullHour = newDate.getHours()
		const shortHour = fullHour % 12 === 0 ? 12 : fullHour % 12
		let fixedDateStr = shortHour + ':' + String(`00${newDate.getMinutes()}`).slice(-2)

		if (fullHour > 11) {
			fixedDateStr += 'pm'
		} else {
			fixedDateStr += 'am'
		}

		return fixedDateStr
	}

	return {
		parseObjectToDateString,
		parseTime,
		fixTime
	}
})
