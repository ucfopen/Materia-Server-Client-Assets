const app = angular.module('materia')

app.controller('MediaImportCtrl', function ($scope, $window, $timeout, AssetSrv) {
	const SORTING_NONE = false
	const SORTING_ASC = 'asc'
	const SORTING_DESC = 'desc'
	let isHiddenClick = false

	const sortString = (field, a, b) => a[field].toLowerCase().localeCompare(b[field].toLowerCase())
	const sortNumber = (field, a, b) => a[field] - b[field]

	const SORT_OPTIONS = [
		{
			sortMethod: sortString.bind(null, 'name'), // bind the field name to the sort method
			name: 'Title',
			field: 'name',
			status: SORTING_ASC,
		},
		{
			sortMethod: sortString.bind(null, 'type'), // bind the field name to the sort method
			name: 'Type',
			field: 'type',
			status: SORTING_NONE,
		},
		{
			sortMethod: sortNumber.bind(null, 'timestamp'), // bind the field name to the sort method
			name: 'Date',
			field: 'timestamp',
			status: SORTING_NONE,
		},
	]

	// generic media type definitions and substitutions for compatibility
	const MIME_MAP = {
		// generic types, preferred
		image: ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'],
		audio: ['audio/mp3', 'audio/mpeg', 'audio/mpeg3'],
		video: [], // placeholder
		model: ['model/obj'],

		// incompatibility prevention, not preferred
		jpg: ['image/jpg'],
		jpeg: ['image/jpeg'],
		gif: ['image/gif'],
		png: ['image/png'],
		mp3: ['audio/mp3', 'audio/mpeg', 'audio/mpeg3'],
		obj: ['application/octet-stream', 'model/obj'],
	}

	const REQUESTED_FILE_TYPES = $window.location.hash.substring(1).split(',')

	const COMS = Materia.Coms.Json
	COMS.setGateway(API_LINK)

	// all files before filtering
	let _allFiles = []

	const onMediaSelect = (media) => {
		if (isHiddenClick === false) {
			$window.parent.Materia.Creator.onMediaImportComplete([media])
		}
		isHiddenClick = false
	}

	const onCancel = () => {
		$window.parent.Materia.Creator.onMediaImportComplete(null)
	}

	const toggleSortOrder = (sortOption) => {
		if (!sortOption) return


		const currentStatus = sortOption.status

		// reset all other sorting statusus
		$scope.sortOptions.forEach((option) => {
			option.status = SORTING_NONE
		})

		// select the next status in order
		// NONE -> ASC -> DESC -> ASC -> DESC
		switch (currentStatus) {
			case SORTING_NONE:
			case SORTING_DESC:
				sortOption.status = SORTING_ASC
				break

			case SORTING_ASC:
				sortOption.status = SORTING_DESC
				break
		}

		$scope.currentSort = sortOption
		_sortFiles()
	}

	const _sortFiles = () => {
		// do nothing?
		if (!$scope.currentSort || $scope.currentSort.status === SORTING_NONE) return

		// sort using the field's sort method
		$scope.displayFiles.sort($scope.currentSort.sortMethod)

		// reverse if descending
		if ($scope.currentSort.status === SORTING_DESC) $scope.displayFiles.reverse()
	}

	const showDeleted = () => {

		if ($scope.isDeleted === true) {
			$scope.displayFiles = _allFiles
		}
		else {
			$scope.displayFiles = _allFiles.filter((asset) => asset.is_deleted === '0')
		}

		_sortFiles()
	}

	const filterDisplay = () => {
		showDeleted()

		const search = $scope.filter.toLowerCase().trim()
		if (!search) return

		const filtered = $scope.displayFiles.filter((file) => {
			//combine file name and type for simplified filtering
			const simplified = file.name.replace(/\s/g, '').toLowerCase() + file.type + file.created
			return simplified.includes(search)
		})

		$scope.displayFiles = filtered
	}

	// just picks the first selected image
	const uploadFile = (e) => {
		const file =
			(e.target.files && e.target.files[0]) || (e.dataTransfer.files && e.dataTransfer.files[0])

		if (file) _getFileData(file, _upload)
	}

	// Load and/or select file from list of previous uploads.
	const _loadAllMedia = (file_id) => {
		// result is a array of objects containing each assets information.
		COMS.send('assets_get', []).then((result) => {
			if (!result || result.msg || result.length == 0) return

			// convert REQUESTED_FILE_TYPES into Allowed Mime Types
			let allowedFileExtensions = []
			REQUESTED_FILE_TYPES.forEach((type) => {
				if (MIME_MAP[type]) {
					//split the file type out of the full mime type for each allowed mime type
					let extractedTypes = []
					MIME_MAP[type].forEach((subtype) => {
						extractedTypes = [...extractedTypes, subtype.split('/')[1]]
					})
					allowedFileExtensions = [...allowedFileExtensions, ...extractedTypes]
				}
			});

			const allowedResult = []
			result.forEach((res) => {
				if (
					res.remote_url != null &&
					res.status !== 'upload_success' &&
					res.status !== 'migrated_asset'
				) {
					return
				}

				if (allowedFileExtensions.indexOf(res.type) > -1) {
					// the id used for asset url is actually remote_url
					// if it exists, use it instead
					res.id = res.remote_url != null ? res.remote_url : res.id

					// file uploaded - if this result's id matches, stop processing and select this asset now
					if (file_id != null && res.id === file_id && allowedFileExtensions.includes(res.type)) {
						$window.parent.Materia.Creator.onMediaImportComplete([res])
					}

					//extract everything ahead of the .ext extension as the filename
					const fileName = res.title.split('.').shift()
					const creationDate = new Date(res.created_at * 1000)
					const dateString = [
						creationDate.getMonth(),
						creationDate.getDate(),
						creationDate.getFullYear(),
					].join('/')

					allowedResult.push({
						id: res.id,
						type: res.type,
						name: fileName,
						created: dateString,
						timestamp: res.created_at,
						thumb: _thumbnailUrl(res.id, res.type),
						is_deleted: res.is_deleted,
					})
				}
			})

			_allFiles = allowedResult
			showDeleted()
			$scope.$apply()
		})
	}

	const deleteAsset = (media) => {
		isHiddenClick = true

		// if is deleted update the local and server version.
		if (media.is_deleted == 0) {
			AssetSrv.deleteAsset(media)
			media.is_deleted = '1'
		}
		else {
			AssetSrv.restoreAsset(media)
			media.is_deleted = '0'
		}
	}

	const _thumbnailUrl = (data, type) => {
		switch (type) {
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
				return `${MEDIA_URL}/${data}/thumbnail` // image types return a thumbnail version of the image
			case 'obj':
				return '/img/model.png' // model formats return the placeholder model thumbnail
			case 'mp3':
			case 'wav':
			case 'ogg':
				return '/img/audio.png' // audio formats return the placeholder audio thumbnail
		}
	}

	const _getFileData = (file, callback) => {
		const dataReader = new FileReader()
		// File size is measured in bytes
		if (file.size > 60000000) {
			alert(
				`The file being uploaded has a size greater than 60MB. Please choose a file that is no greater than 60MB.`
			)
			return
		}

		dataReader.onload = (event) => {
			const src = event.target.result
			const mime = _getMimeType(src)
			if (mime == null) return

			callback({
				name: file.name,
				mime,
				ext: file.name.split('.').pop(),
				size: file.size,
				src,
			})
		}

		dataReader.readAsDataURL(file)
	}

	const _getMimeType = (dataUrl) => {
		let allowedFileExtensions = []

		REQUESTED_FILE_TYPES.forEach((type) => {
			if (MIME_MAP[type]) {
				allowedFileExtensions = [...allowedFileExtensions, ...MIME_MAP[type]]
			}
		})

		const mime = dataUrl.split(';')[0].split(':')[1]

		if (mime == null || allowedFileExtensions.indexOf(mime) === -1) {
			alert(
				'This widget does not support the type of file provided. ' +
				`The allowed types are: ${REQUESTED_FILE_TYPES.join(', ')}.`
			)
			return null
		}
		return mime
	}

	// converts image data uri to a blob for uploading
	const _dataURItoBlob = (dataURI, mime) => {
		// convert base64/URLEncoded data component to raw binary data held in a string
		let byteString
		const dataParts = dataURI.split(',')
		if (dataParts[0].indexOf('base64') >= 0) {
			byteString = atob(dataParts[1])
		} else {
			byteString = unescape(dataParts[1])
		}

		const intArray = new Uint8Array(byteString.length)
		for (const i in byteString) {
			intArray[i] = byteString.charCodeAt(i)
		}
		return new Blob([intArray], { type: mime })
	}

	// upload to either local server or s3
	const _upload = (fileData) => {
		const fd = new FormData()

		fd.append('name', fileData.name)
		fd.append('Content-Type', fileData.mime)
		fd.append('file', _dataURItoBlob(fileData.src, fileData.mime), fileData.name)

		const request = new XMLHttpRequest()

		request.onload = (oEvent) => {
			const res = JSON.parse(request.response) //parse response string

			if (res.error) {
				alert(`Error code ${res.error.code}: ${res.error.message}`)
				$window.parent.Materia.Creator.onMediaImportComplete(null)
				return
			}

			// reload media to select newly uploaded file
			_loadAllMedia(res.id)
		}

		request.open('POST', MEDIA_UPLOAD_URL)
		request.send(fd)
	}

	// creator can send a message with file data
	const _onPostMessage = (event) => {
		// does the event look like an image message?
		let json = JSON.parse(event.data)
		if (!json.name || !json.ext || !json.src) return

		// cancel media loading
		$timeout.cancel(initialLoadTimeout)

		// Disable mouse events
		document
			.getElementsByClassName('import')[0]
			.setAttribute('style', 'pointer-events: none; opacity: 0.5')

		_upload(json)
	}

	const _announceReady = () => {
		// announce to the creator that the importer is available, if waiting to auto-upload
		let msg = {
			type: 'readyForDirectUpload',
			source: 'media-importer',
			data: '',
		}
		$window.parent.postMessage(JSON.stringify(msg), '*')
	}

	// expose to $scope
	$scope.select = onMediaSelect
	$scope.cancel = onCancel
	$scope.sortBy = toggleSortOrder
	$scope.filterFiles = filterDisplay
	$scope.uploadFile = uploadFile
	$scope.deleteAsset = deleteAsset
	$scope.sortOptions = SORT_OPTIONS
	$scope.displayFiles = []
	$scope.currentSort = SORT_OPTIONS[0] // initialize using the first sort option
	$scope.filter = null
	$scope.isDeleted = false
	$scope.showDeleted = showDeleted

	// initialize
	$window.addEventListener('message', _onPostMessage, false)
	_announceReady()
	const initialLoadTimeout = $timeout(() => {
		_loadAllMedia()
	}, 200) // load media soon
})
