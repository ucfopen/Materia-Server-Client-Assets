const app = angular.module('materia')
app.service('AssetSrv', function () {
	const deleteAsset = (asset) =>
		Materia.Coms.Json.del(`/api/asset/delete/${encodeURIComponent(asset.id)}`, asset)
	const restoreAsset = (asset) =>
		Materia.Coms.Json.del(`/api/asset/restore/${encodeURIComponent(asset.id)}`, asset)

	return {
		deleteAsset,
		restoreAsset
	}
})
