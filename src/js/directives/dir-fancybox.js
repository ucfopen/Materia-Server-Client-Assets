const app = angular.module('materia')
app.directive('fancybox', function($compile, $timeout) {
	return {
		link: function($scope, element, attrs) {
			$(element).fancybox({
				onComplete() {
					$timeout(() => {
						$compile($('#fancybox-content'))($scope)
						$scope.$apply()
						$.fancybox.resize()
					})
				}
			})
		}
	}
})
