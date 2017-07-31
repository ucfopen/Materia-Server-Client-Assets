Namespace('Materia.Store').SlideShow = do ->
	spotlightCount = 0
	lastSlideTo = 0

	formatCycler = (spotlights) ->
		spotlightCount = spotlights.length
		# make a radio button and give the spotlights appropriate ids
		for spotlight, i in spotlights
			checked = ''
			if i != 0 then spotlight.classList.add 'hidden'
			else checked = 'checked="checked"'

			spotlight.setAttribute('id', "spotlight_#{i}")
			$('.cycler').append('<input type="radio" name="spotlight" id="slide_'+i+'" '+checked+' class="radio_spotlight" />')

		# add a span after each input in the cycler
		selected = ' spotlight_selected'
		$('.cycler').children('input').each ->
			$(this).hide()
			$(this).after('<span class="span_next'+selected+'"></span>')
			selected = ''

		# figure out the cyler width
		cyclerWidth = $('.span_next').outerWidth(true) * $('.span_next').length
		$('.cycler').width(cyclerWidth)

		# slide at a set interval
		intervalID = setInterval((() -> goToSlide(lastSlideTo+1)), 12000)

		# add listeners to each span_next
		$('.span_next').click ->
			if($(this).hasClass('spotlight_selected')) then return false
			clearInterval(intervalID)
			num = $(this).prev().attr('id').substr(6) # slide_xx
			goToSlide(num)

	goToSlide = (slideNo) ->
		slideNo = parseInt(slideNo, 10)
		if slideNo >= spotlightCount then slideNo = 0

		showing = document.querySelector('.store_main[style="display: block;"]')
		changeTo = document.getElementById("spotlight_#{slideNo}")

		showingId = showing.getAttribute('id')
		showingNum = parseInt(showingId.substr(10), 10) # spotlight_xx
		lastSlideTo = slideNo

		spotlightSelected($("#slide_"+slideNo).next())

		# these still use jquery
		if showingNum > slideNo
			$(showing).hide('slide', {direction : 'right', speed: 'slow'})
			$(changeTo).show('slide', {direction : 'left', speed: 'slow'})
		else
			$(showing).hide('slide', {direction : 'left', speed: 'slow'})
			$(changeTo).show('slide', {direction : 'right', speed: 'slow'})

	# Cycles thorough the buttons to remove all selected clases, then adds the selected class to the button specified and checks that buttons input.
	spotlightSelected = (button) ->
		$('.cycler').children('span').each -> $(this).removeClass('spotlight_selected')
		button.addClass('spotlight_selected').prev().attr('checked', 'checked')

	formatCycler : formatCycler,
