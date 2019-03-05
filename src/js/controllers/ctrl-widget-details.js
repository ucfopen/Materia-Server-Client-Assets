const app = angular.module('materia')
app.controller('widgetDetailsController', function(Please, $scope, $window, widgetSrv) {
	const SCREENSHOT_AMOUNT = [1, 2, 3]
	const nameArr = window.location.pathname.replace('/widgets/', '').split('/')
	const widgetID = nameArr
		.pop()
		.split('-')
		.shift()

	const tooltipDescriptions = {
		Customizable:
			'As the widget creator, you supply the widget with data to make it relevant to your course.',
		Scorable: 'This widget collects scores, and is well suited to gauge performance.',
		Media: 'This widget uses image media as part of its supported data.',
		'Question/Answer':
			'Users provide a typed response or associate a predefined answer with each question.',
		'Multiple Choice':
			'Users select a response from a collection of possible answers to questions provided by the widget.',
		'Mobile Friendly': 'Designed with HTML5 to work on mobile devices like the iPad and iPhone.',
		Fullscreen: 'This widget may be allowed to temporarily take up your entire screen.'
	}

	const _tooltipObject = text => ({
		text,
		show: false,
		description:
			tooltipDescriptions[text] || 'This feature has no additional information associated with it.'
	})

	// Populates the details page with content
	// @object The current widget.
	const _populateDefaults = widget => {
		const { clean_name } = widget
		const date = new Date(widget['created_at'] * 1000)

		$scope.widget = {
			name: widget.name,
			icon: Materia.Image.iconUrl(widget.dir, 92),
			subheader: widget.meta_data['subheader'],
			about: widget.meta_data['about'],
			demourl: document.location.pathname + '/demo',
			creatorurl: document.location.pathname + '/create',
			supported_data: widget.meta_data['supported_data'].map(_tooltipObject),
			features: widget.meta_data['features'].map(_tooltipObject),
			created: date.toLocaleDateString(),
			width: ~~widget.width,
			height: ~~widget.height
		}

		const sizeNeeded = ($scope.widget.width || 700) + 150
		$scope.maxPageWidth = sizeNeeded + 'px'
		$scope.show = true

		if (widget.meta_data['about'] === 'undefined') {
			$scope.widget.about = 'No description available.'
		}

		$scope.widget.screenshots = SCREENSHOT_AMOUNT.map(i => {
			return {
				full: Materia.Image.screenshotUrl(widget.dir, i),
				thumb: Materia.Image.screenshotThumbUrl(widget.dir, i)
			}
		})
		$scope.demoScreenshot = `url(${$scope.widget.screenshots[0].full})`

		Please.$apply()
	}

	const isWideEnough = () => {
		if ($scope.widget.width == 0) {
			return false // don't allow widgets with scalable width
		}
		// 150 in padding/margins needed
		const sizeNeeded = ($scope.widget.width || 700) + 150
		$scope.maxPageWidth = sizeNeeded + 'px'
		const userWidth = document.documentElement.clientWidth
		return userWidth > sizeNeeded
	}

	const _pics = document.getElementById('pics-scroller')
	const _hammer = new Hammer(_pics)
	let _offset = 0
	_hammer.on('pan', e => {
		if (e.center.x == 0 && e.center.y == 0) {
			// fixes hammer/chrome issue with touch vertical scrolling
			// (see hammerjs issue #1050)
			return
		}

		// note: deltaX is positive when dragging right (ie going back)
		let x = e.deltaX + _offset

		// if the pan goes off the edge, divide the overflow amount by 10
		if (x > 0) x = x / 10 // overflow left

		const rightEdge = _pics.children[3].offsetLeft * -1
		x = Math.max(x, rightEdge + (x - rightEdge) / 10) // overflow right

		_pics.style.transition = ''
		_pics.style.transform = `translate3D(${x}px, 0, 0)`

		// snap to the closest image when released
		if (e.isFinal) {
			_offset = x
			snapClosest(x + e.overallVelocityX * 250)
		}
	})

	const snapClosest = (x, animate = true) => {
		if (_pics.children.length < 4) return // pics not loaded yet

		let minDiff = 9999
		for (let i = 0; i < 4; i++) {
			const childOffset = _pics.children[i].offsetLeft * -1
			const diff = Math.abs(childOffset - x)
			if (diff < minDiff) {
				minDiff = diff
				_offset = childOffset
				$scope.selectedImage = i
			}
		}

		_pics.style.transform = `translate3D(${_offset}px, 0, 0)`
		_pics.style.transition = animate ? 'ease transform 500ms' : ''
		Please.$apply()
	}

	// scroll to image at $scope.selectedImage (when arrows/dots are clicked)
	const snapToImage = () => {
		const i = $scope.selectedImage
		if (_pics.children.length && _pics.children[i]) {
			_offset = _pics.children[i].offsetLeft * -1
			_pics.style.transform = `translate3D(${_offset}px, 0, 0)`
			_pics.style.transition = 'ease transform 500ms'
		}
	}

	// expose to scope

	$scope.widget = { icon: `${STATIC_CROSSDOMAIN}img/default/default-icon-275.png` }
	$scope.showDemoCover = true
	$scope.selectedImage = 0
	$scope.showDemoClicked = () => {
		if (isWideEnough()) {
			$scope.demoHeight = $scope.widget.height + 48 + 'px'
			$scope.demoWidth = $scope.widget.width + 10 + 'px'
			$scope.showDemoCover = false

			// don't show player's onbeforeunload dialog
			setTimeout(() => {
				window.onbeforeunload = () => undefined
			}, 10)
		} else {
			$window.location = $scope.widget.demourl
		}
	}

	$scope.selectImage = i => ($scope.selectedImage = i)
	$scope.nextImage = i => ($scope.selectedImage = ($scope.selectedImage + 1) % 4)
	$scope.prevImage = i => ($scope.selectedImage = ($scope.selectedImage + 3) % 4)
	$scope.$watch('selectedImage', snapToImage)
	window.onresize = () => snapClosest(_offset, false)

	// initialize

	widgetSrv.getWidgetInfo(widgetID).then(widget => {
		_populateDefaults(widget)
	})
})
