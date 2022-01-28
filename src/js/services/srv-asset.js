const app = angular.module('materia')
app.service('AssetSrv', function () {
	const deleteAsset = (asset) =>
		Materia.Coms.Json.del(`/api/asset/delete/${encodeURIComponent(asset.id)}`)
	const restoreAsset = (asset) =>
		Materia.Coms.Json.post(`/api/asset/restore/${encodeURIComponent(asset.id)}`)

	return {
		deleteAsset,
		restoreAsset
	}
})
