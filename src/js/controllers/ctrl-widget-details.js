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
			'Users provide a typed response or associate a predefined answer wih each question.',
		'Multiple Choice':
			'Users select a response from a collection of possible answers to questions provided by the widget.',
		'Mobile Friendly': 'Designed with HTML5 to work on mobile devices like the iPad and iPhone',
		Fullscreen: 'This widget may be allowed to temporarily take up your entire screen.'
	}

	const _tooltipObject = txt => ({
		text: txt,
		show: false,
		description:
			tooltipDescriptions[txt] || 'This feature has no additional information associated with it.'
	})

	// Populates the details page with content
	// @object The current widget.
	var _populateDefaults = function(widget) {
		const { clean_name } = widget
		
		// const creator_guide = widget.creator_guide.replace('_helper-docs/src/', '')
		// const player_guide = widget.player_guide.replace('_helper-docs/src/', '')
		const regex_guide_type = /.*\/(.*\..*)/g
		const creator_guide = regex_guide_type.exec(widget.creator_guide)[1]
		regex_guide_type.lastIndex = 0
		const player_guide = regex_guide_type.exec(widget.player_guide)[1]
		
		$scope.widget = {
			name: widget.name,
			icon: Materia.Image.iconUrl(widget.dir, 394),
			subheader: widget.meta_data['subheader'],
			about: widget.meta_data['about'],
			demourl: document.location.pathname + '/demo',
			creatorurl: document.location.pathname + '/create',
			supported_data: widget.meta_data['supported_data'].map(_tooltipObject),
			features: widget.meta_data['features'].map(_tooltipObject),
			creator_guide: document.location.pathname + '/' + creator_guide,
			player_guide: document.location.pathname + '/' + player_guide
		}

		$scope.show = true

		if (widget.meta_data['about'] === 'undefined') {
			$scope.widget.about = 'No description available.'
		}

		$scope.widget.screenshots = []

		$scope.widget.scr

		SCREENSHOT_AMOUNT.forEach(i => {
			$scope.widget.screenshots.push({
				a: Materia.Image.screenshotUrl(widget.dir, i),
				img: Materia.Image.screenshotThumbUrl(widget.dir, i)
			})
		})

		Please.$apply()
	}

	// expose to scope

	$scope.widget = { icon: `${STATIC_CROSSDOMAIN}img/default/default-icon-275.png` }
	$scope.goback = {
		text: 'Go back to the widget catalog',
		url: '/widgets'
	}

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
