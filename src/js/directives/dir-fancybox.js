const app = angular.module('materia')
app.directive('fancybox', function(Please, $compile, $timeout) {
	return {
		link: function($scope, element, attrs) {
			$(element).fancybox({
				onComplete() {
					$timeout(() => {
						$compile($('#fancybox-content'))($scope)
						Please.$apply()
						$.fancybox.resize()
					})
				}
			})
		}
	}
})
