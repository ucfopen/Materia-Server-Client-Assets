const app = angular.module('materia')
app.controller('guideCtrl', function(Please, $scope, $q, widgetSrv) {
    let widget_info = null
    let instance = null
    let nameArr = null
    let guideType = null
    let guide = null

    // Refactor this: with regex
    if (window.location.pathname.includes("creatorGuide.html")) {
        nameArr = window.location.pathname.replace('/widgets/', '').replace('/creatorGuide.html', '').split('/')
        guideType = "creatorGuide"
    } else {
        nameArr = window.location.pathname.replace('/widgets/', '').replace('/playerGuide.html', '').split('/')
        guideType = "playerGuide"
        console.log(guideType)
    }

    const widgetID = nameArr
		.pop()
		.split('-')
        .shift()

    const embed = widgetData => {
        let path
        const findPath = (guide) => {
            if (guide.substring() === 'http') {
                return guide
            } else {
                return WIDGET_URL + widget_info.dir + guide
            }
        }

        if (widgetData != null ? widgetData.widget : undefined) {
			instance = widgetData
			widget_info = instance.widget
		} else {
			widget_info = widgetData
        }

        if (guideType == 'creatorGuide') {
            path = findPath(widget_info.creator_guide)
        } else {
            path = findPath(widget_info.player_guide)
        }
 
        $scope.helper = path
        Please.$apply()
    }

    widgetSrv.getWidgetInfo(widgetID).then(embed)
})