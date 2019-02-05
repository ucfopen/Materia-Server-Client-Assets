const app = angular.module('materia')
app.controller('widgetDetailsController', function(Please, $scope, widgetSrv) {
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
	var _populateDefaults = widget => {
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
			width: widget.width,
			height: widget.height
		}

		_checkIfDemoFits()
		$scope.show = true

		if (widget.meta_data['about'] === 'undefined') {
			$scope.widget.about = 'No description available.'
		}

		$scope.widget.screenshots = SCREENSHOT_AMOUNT.map( i => {
			return {
				full: Materia.Image.screenshotUrl(widget.dir, i),
				thumb: Materia.Image.screenshotThumbUrl(widget.dir, i)
			}
		})
		$scope.demoScreenshot = `url(${$scope.widget.screenshots[0].full})`

		Please.$apply();
	}

	// checks if the demo will fit in the user's viewport
	// if so, embed the demo onto this page; hide otherwise
	const _checkIfDemoFits = () => {
		if (~~$scope.widget.width == 0) {
			return // don't allow widgets with scalable width
		}
		const sizeNeeded = ~~$scope.widget.width + 50
		const userWidth = document.documentElement.clientWidth
		if (userWidth > sizeNeeded) {
			$scope.demoFits = true
			if (sizeNeeded > 850) {
				document.querySelector(".widget .page").style.maxWidth = `${sizeNeeded}px`
			}
		}
	}

	const _pics = document.getElementById("pics-scroller");
	const _hammer = new Hammer(_pics, {})
	let _offset = 0
	_hammer.on('pan', e => {
		let x = e.deltaX + _offset;
		if (x > 0) x = x / 10 // overflow effect on left edge

		const rightEdge = _pics.children[2].offsetLeft * -1
		x = Math.max(x, rightEdge + (x-rightEdge)/10) // overflow right

		_pics.style.transition = ""
		_pics.style.transform = `translate3D(${x}px, 0, 0)`

		// snap to the closest image when released
		if (e.isFinal) {
			_offset = x
			snapClosest(x + e.overallVelocityX * 250)
		}
	})

	const snapClosest = (x, animate = true) => {
		if (_pics.children.length < 3) return // pics not loaded yet
		_offset = x
		let minDiff = 9999
		for (let i = 0; i < 3; i++) {
			const childOffset = _pics.children[i].offsetLeft * -1
			const diff = Math.abs(childOffset - x)
			if (diff < minDiff) {
				minDiff = diff
				_offset = childOffset
				$scope.selectedImage = i
			}
		}

		_pics.style.transform = `translate3D(${_offset}px, 0, 0)`
		if (animate) {
			_pics.style.transition = "ease transform 500ms"
		} else {
			_pics.style.transition = ""
		}

		Please.$apply();
	}

	const snapToImage = () => {
		const i = $scope.selectedImage
		if (_pics.children.length && _pics.children[i]) {
			_offset = _pics.children[i].offsetLeft * -1
			_pics.style.transform = `translate3D(${_offset}px, 0, 0)`
			_pics.style.transition = "ease transform 500ms"
		}
	}

	// expose to scope

	$scope.widget = { icon: `${STATIC_CROSSDOMAIN}img/default/default-icon-275.png` }
	$scope.goback = {
		text: 'Go back to the widget catalog',
		url: '/widgets'
	}
	$scope.showDemoCover = true
	$scope.demoFits = false
	$scope.selectedImage = 0
	$scope.showDemoClicked = () => {
		$scope.showDemoCover = false
		setTimeout(() => {window.onbeforeunload = () => undefined}, 10)
	}
	$scope.selectImage = i => $scope.selectedImage = i
	$scope.nextImage = i => $scope.selectedImage = ($scope.selectedImage + 1) % 3
	$scope.prevImage = i => $scope.selectedImage = ($scope.selectedImage + 2) % 3
	$scope.$watch('selectedImage', snapToImage)
	window.onresize = () => snapClosest(_offset, false);

	// initialize

	widgetSrv.getWidgetInfo(widgetID).then(widget => {
		_populateDefaults(widget)
		if (nameArr.length > 1) {
			$scope.goback = {
				url: '/',
				text: 'Go back to the front page'
			}
		}
	})
})
