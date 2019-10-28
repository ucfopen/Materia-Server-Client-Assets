const app = angular.module('materia')
app.controller('qsetHistoryCtrl', function($scope, $sce) {
	$scope.saves = []

	const _setup = () => {
		let id = _getInstId()
		_getQsetHistory(id).then(result => {
			if (!result) return false
			result.forEach(qset => {
				console.log(qset)

				save = {
					id: qset.id,
					data: qset.data,
					version: qset.version,
					count: _readQuestionCount(qset.data),
					created_at: new Date(parseInt(qset.created_at) * 1000).toLocaleString()
				}
				$scope.saves.push(save)
			})
			$scope.$apply()
			console.log($scope.saves)
		})
	}

	const _readQuestionCount = qset => {
		console.log(qset)
		let items = qset.items
		if (items.items) items = items.items

		return items.length
	}

	const _getQsetHistory = inst_id => {
		return Materia.Coms.Json.send('question_history_get', [inst_id])
	}

	const _getInstId = () => {
		const l = document.location.href
		const id = l.substring(l.lastIndexOf('=') + 1)
		return id
	}

	$scope.loadSaveData = id => {
		console.log('selected id: ' + id)

		$scope.saves.forEach(save => {
			if (id == save.id) {
				console.log('found qset for that ID')
				return window.parent.Materia.Creator.onQsetHistorySelectionComplete(
					JSON.stringify(save.data),
					save.version
				)
			}
		})
	}

	$scope.closeDialog = e => {
		e.stopPropagation()
		return window.parent.Materia.Creator.onQsetHistorySelectionComplete(null)
	}

	_setup()
})
