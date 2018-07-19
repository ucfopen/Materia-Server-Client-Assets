const app = angular.module('materia')

app.directive('fileDropper', function(){
	return {
		restrict: 'AE',
		link: function(scope, element) {
			element.bind('drag dragstart dragend dragover dragenter dragleave drop', function(event){
				event.preventDefault()
				switch (event.type) {
					case 'dragover':
					case 'dragenter': {
						element.addClass('drag-is-dragover')
						break
					}
					case 'dragleave':
					case 'dragend':
					case 'drop':
					default: {
						element.removeClass('drag-is-dragover')
						break
					}
				}
			})
		}
	}
})