Namespace('Materia.Store').SlideShow = (() => {
	let spotlightCount = 0
	let lastSlideTo = 0

	const formatCycler = spotlights => {
		spotlightCount = spotlights.length
		// make a radio button and give the spotlights appropriate ids
		spotlights.forEach((spotlight, i) => {
			let checked = ''
			if (i !== 0) {
				spotlight.classList.add('hidden')
			} else {
				checked = 'checked="checked"'
			}

			spotlight.setAttribute('id', `spotlight_${i}`)
			$('.cycler').append(
				`<input type="radio" name="spotlight" id="slide_${i}" ${checked} class="radio_spotlight" />`
			)
		})

		// add a span after each input in the cycler
		let selected = ' spotlight_selected'
		$('.cycler')
			.children('input')
			.each(function() {
				$(this).hide()
				$(this).after(`<span class="span_next${selected}"></span>`)
				selected = ''
			})

		// figure out the cyler width
		const cyclerWidth = $('.span_next').outerWidth(true) * $('.span_next').length
		$('.cycler').width(cyclerWidth)

		// slide at a set interval
		const intervalID = setInterval(() => {
			goToSlide(lastSlideTo + 1)
		}, 12000)

		// add listeners to each span_next
		$('.span_next').click(function() {
			if ($(this).hasClass('spotlight_selected')) {
				return false
			}
			clearInterval(intervalID)
			const num = $(this)
				.prev()
				.attr('id')
				.substr(6) // slide_xx
			goToSlide(num)
		})
	}

	const goToSlide = slideNo => {
		slideNo = parseInt(slideNo, 10)
		if (slideNo >= spotlightCount) {
			slideNo = 0
		}

		const showing = document.querySelector('.store_main[style="display: block;"]')
		const changeTo = document.getElementById(`spotlight_${slideNo}`)

		const showingId = showing.getAttribute('id')
		const showingNum = parseInt(showingId.substr(10), 10) // spotlight_xx
		lastSlideTo = slideNo

		spotlightSelected($(`#slide_${slideNo}`).next())

		// these still use jquery
		if (showingNum > slideNo) {
			$(showing).hide('slide', { direction: 'right', speed: 'slow' })
			$(changeTo).show('slide', { direction: 'left', speed: 'slow' })
		} else {
			$(showing).hide('slide', { direction: 'left', speed: 'slow' })
			$(changeTo).show('slide', { direction: 'right', speed: 'slow' })
		}
	}

	// Cycles thorough the buttons to remove all selected clases, then adds the selected class to the button specified and checks that buttons input.
	const spotlightSelected = button => {
		$('.cycler')
			.children('span')
			.each(() => $(this).removeClass('spotlight_selected'))
		button
			.addClass('spotlight_selected')
			.prev()
			.attr('checked', 'checked')
	}

	return { formatCycler }
})()
