const app = angular.module('materia')

app.controller('mediaImportCtrl', function($scope, $window){
	// generic media type definitions and substitutions for compatibility
	const MEDIA_SUBSTITUTIONS = {
		//generic types, preferred
		image: ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'],
		audio: ['audio/mp3', 'audio/mpeg', 'audio/mpeg3'],
		video: [], //placeholder
		//incompatibility prevention, not preferred
		jpg: ['image/jpg'],
		jpeg: ['image/jpeg'],
		gif: ['image/gif'],
		png: ['image/png'],
		mp3: ['audio/mp3', 'audio/mpeg', 'audio/mpeg3']
	}

	const CONFIG = {
		s3enabled: S3_ENABLED,
		uploadUrl: MEDIA_UPLOAD_URL,
		mediaUrl: MEDIA_URL
	}

	const COMS = Materia.Coms.Json
	COMS.setGateway(API_LINK)

	const TITLE_SORT = 0
	const TYPE_SORT = 1
	const DATE_SORT = 2

	const SORTING_NONE = false
	const SORTING_ASC = 'asc'
	const SORTING_DESC = 'desc'

	// SCOPE VARS
	$scope.fileTypes = location.hash.substring(1).split(',')
	$scope.sortOptions = [
		{
			type: TITLE_SORT,
			name: 'Title',
			field: 'name',
			status: SORTING_NONE
		},
		{
			type: TYPE_SORT,
			name: 'Type',
			field: 'type',
			status: SORTING_NONE
		},
		{
			type: DATE_SORT,
			name: 'Date',
			field: 'timestamp',
			status: SORTING_NONE
		}
	]

	// track all valid files separately from which files are currently displayed
	$scope.allFiles = []
	$scope.displayFiles = []

	$scope.currentSort = null
	$scope.filter = null

	$scope.cancel = function() {
		$window.parent.Materia.Creator.onMediaImportComplete(null)
	}

	$scope.sortBy = function(sortOption) {
		if (!sortOption) return
		$scope.sortOptions.forEach(function(option){
			if (option == sortOption) {
				switch (option.status) {
					case SORTING_NONE:
						option.status = SORTING_ASC
						break;
					case SORTING_ASC:
						option.status = SORTING_DESC
						break;
					case SORTING_DESC:
						option.status = SORTING_NONE
						break;
				}
			}
			else {
				option.status = SORTING_NONE
			}
		})
		$scope.currentSort = sortOption

		_sortFiles()
	}

	function _sortFiles() {
		if (!$scope.currentSort) return

		//normally we want larger values to rise
		//however if we're sorting in descending order we want them to sink
		//so we need to reverse the usual expectations of Array.sort()
		let lessThan = -1
		let greaterThan = 1
		switch ($scope.currentSort.status) {
			case SORTING_ASC:
			default:
				break;
			case SORTING_DESC:
				lessThan = 1
				greaterThan = -1
				break;
			case SORTING_NONE:
				return
		}

		$scope.displayFiles.sort(function(a,b){
			if (a[$scope.currentSort.field] < b[$scope.currentSort.field]) {
				return lessThan
			}
			if (a[$scope.currentSort.field] > b[$scope.currentSort.field]) {
				return greaterThan
			}
			return 0
		})
	}

	$scope.filterFiles = function() {
		$scope.displayFiles = $scope.allFiles
		_sortFiles()

		let search = $scope.filter.toLowerCase().trim()
		if (!search) return
		let filtered = $scope.displayFiles.filter(function(file){
			//combine file name and type for simplified filtering
			let simplified = file.name.replace(/\s/g, '').toLowerCase() + file.type;
			return simplified.includes(search);
		});
		$scope.displayFiles = filtered
	}

	$scope.uploadFile = function(event) {
		let fileList = event.target.files
		if ((fileList != null ? fileList[0] : undefined) == null) {
			fileList = event.dataTransfer.files
		}
		// just picks the first selected image
		if ((fileList != null ? fileList[0] : undefined) != null) {
			_getFileData(fileList[0], fileData => {
				if (fileData != null) {
					// if s3 is enabled, get keys and then upload, o/w just upload
					if (CONFIG.s3enabled) {
						COMS.send('upload_keys_get', [fileData.name, fileData.size]).then(keyData => {
							if (keyData) {
								_upload(fileData, keyData)
							}
						})
					} else {
						_upload(fileData)
					}
				}
			})
		}
	}

	function _loadAllMedia(file_id) {
		// determine the types from the url hash string
		let mediaTypes = $window.location.hash.substring(1)
		if (mediaTypes) mediaTypes = mediaTypes.split(',')

		// load and/or select file for labelling
		return COMS.send('assets_get', []).then(result => {
			if (result && result.msg === undefined && result.length > 0) {
				//we have a list of allowed mime types, assets are stored with file types only
				let allowedFileTypes = []
				$scope.fileTypes.forEach(type => {
					if (MEDIA_SUBSTITUTIONS[type]) {
						//split the file type out of the full mime type for each allowed mime type
						let extractedTypes = []
						MEDIA_SUBSTITUTIONS[type].forEach(subtype => {
							extractedTypes = [
								...extractedTypes,
								subtype.split('/')[1]
							]
						})

						allowedFileTypes = [
							...allowedFileTypes,
							...extractedTypes
						]
					}
				})

				let allowedResult = []
				result.forEach(function(res) {
					if (
						res.remote_url != null &&
						res.status !== 'upload_success' &&
						res.status !== 'migrated_asset'
					) {
						return
					}

					if (allowedFileTypes.indexOf(res.type) > -1) {
						// the id used for asset url is actually remote_url
						// if it exists, use it instead
						res.id = res.remote_url != null ? res.remote_url : res.id

						// file uploaded - if this result's id matches, stop processing and select this asset now
						if (
							file_id != null &&
							res.id === file_id &&
							allowedFileTypes.indexOf(res.type) > -1
						) {
							$window.parent.Materia.Creator.onMediaImportComplete([res])
						}

						//extract everything ahead of the .ext extension as the filename
						let fileName = res.title.match(/.*(?=\.)/i)[0]
						let creationDate = new Date(res.created_at*1000)
						let dateString = [creationDate.getMonth(),
							creationDate.getDate(),
							creationDate.getFullYear()
						].join('/')

						allowedResult.push({
							id: res.id,
							type: res.type,
							name: fileName,
							created: dateString,
							timestamp: res.created_at,
							thumb: _getThumbnail(res.id, res.type)
						})
					}
				})
				$scope.allFiles = allowedResult
				$scope.displayFiles = $scope.allFiles
				$scope.$apply()
			}
		})
	}

	function _getThumbnail(data, type) {
		switch(type) {
			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'gif':
				let thumbUrl = CONFIG.mediaUrl+'/'

				if (CONFIG.s3enabled) {
					const original_path_data = data.split('/')

					// separates filename and extension
					const image_key = original_path_data.pop().split('.')

					let extension = image_key.pop()

					// Maintains a standard extension
					if (extension === 'jpeg') extension = 'jpg'

					// thumbnails in Materia are 75x75 dimensions
					image_key.push(`75x75.${extension}`)
					original_path_data.push(image_key.join('-'))

					// creates final thumbnail path
					const thumbId = original_path_data.join('/')
					thumbUrl += `${thumbId}`
				} else {
					thumbUrl += `${data}/thumbnail`
				}
				return thumbUrl
			case 'mp3':
			case 'wav':
			case 'ogg':
				return '/img/audio.png'
			default:
				return ''
		}
	}

	_loadAllMedia()

	function _getFileData(file, callback) {
		const dataReader = new FileReader()

		// File size is measured in bytes
		if (file.size > 60000000) {
			alert(
				`The file being uploaded has a size greater than 60MB. Please choose a file that is no greater than 60MB.`
			)
			return null
		}

		dataReader.onload = event => {
			const src = event.target.result
			const mime = _getMimeType(src)
			if (mime == null) {
				return null
			}
			const fileData = {
				name: file.name,
				mime,
				ext: file.name.split('.').pop(),
				size: file.size,
				src
			}

			return callback(fileData)
		}

		return dataReader.readAsDataURL(file)
	}

	function _getMimeType(dataUrl) {
		let allowedMimeTypes = []

		$scope.fileTypes.forEach(type => {
			if (MEDIA_SUBSTITUTIONS[type]) {
				allowedMimeTypes = [
					...allowedMimeTypes,
					...MEDIA_SUBSTITUTIONS[type]
				]
			}
		})

		const mime = dataUrl.split(';')[0].split(':')[1]

		if (mime == null || allowedMimeTypes.indexOf(mime) === -1) {
			alert('This widget does not support selected file type is not supported. ' +
				`The allowed types are: ${$scope.fileTypes.join(', ')}.`)
			return null
		}

		return mime
	}

	// converts image data uri to a blob for uploading
	function _dataURItoBlob(dataURI, mime) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		let byteString
		const dataParts = dataURI.split(',')
		if (dataParts[0].indexOf('base64') >= 0) {
			byteString = atob(dataParts[1])
		} else {
			byteString = unescape(dataParts[1])
		}

		const intArray = new Uint8Array(byteString.length)
		for (let i in byteString) {
			intArray[i] = byteString.charCodeAt(i)
		}
		return new Blob([intArray], { type: mime })
	}

	// upload to either local server or s3
	function _upload(fileData, keyData) {
		const fd = new FormData()

		// for s3 uploading
		if (keyData != null) {
			// Normalize jpeg extension
			const splitFileKey = keyData.file_key.split('.')
			splitFileKey[1] = splitFileKey[1].toUpperCase() === 'JPG' ? 'jpeg' : splitFileKey[1]
			keyData.file_key = splitFileKey.join('.')

			fd.append('key', keyData.file_key)
			fd.append('acl', 'public-read')
			fd.append('Policy', keyData.policy)
			fd.append('Signature', keyData.signature)
			fd.append('AWSAccessKeyId', keyData.AWSAccessKeyId)
		} else {
			fd.append('name', fileData.name)
		}

		fd.append('Content-Type', fileData.mime)
		fd.append('success_action_status', '201')
		fd.append('file', _dataURItoBlob(fileData.src, fileData.mime), fileData.name)

		const request = new XMLHttpRequest()

		request.onload = oEvent => {
			if (keyData != null) {
				// s3 upload
				const success = request.status === 200 || request.status === 201

				if (!success) {
					// Parse the Error message received from amazonaws
					const parser = new DOMParser()
					const doc = parser.parseFromString(request.response, 'application/xml')
					const upload_error = doc.getElementsByTagName('Error')[0].childNodes[1].innerHTML

					_saveUploadStatus(fileData.ext, keyData.file_key, success, upload_error)
					alert('There was an issue uploading this asset to Materia - Please try again later.')
					return null
				}

				// Checks to see if the images made it to the S3 bucket serving media
				return this.verifyUpload(keyData, fileData)
			} else {
				// local upload
				const res = JSON.parse(request.response) //parse response string
				if (res.error) {
					alert(`Error code ${res.error.code}: ${res.error.message}`)
					return $window.parent.Materia.Creator.onMediaImportComplete(null)
				} else {
					// reload media to select newly uploaded file
					return _loadAllMedia(res.id)
				}
			}
		}

		request.open('POST', CONFIG.uploadUrl)
		return request.send(fd)
	}

	function _saveUploadStatus(fileType, fileURI, s3_upload_success, error = null) {
		const re = /\-(\w{5})\./
		const fileID = fileURI.match(re)[1] // id is in first capture group
		_coms
			.send('upload_success_post', [fileID, s3_upload_success, error])
			.then(update_success => {
				if (s3_upload_success) {
					const res = {
						id: fileURI,
						type: fileType
					}
					$window.parent.Materia.Creator.onMediaImportComplete([res])
				}
			})
	}

	function _verifyUpload(keyData, fileData, attempt) {
		let error
		if (attempt == null) {
			attempt = 0
		}
		if (attempt > 4) {
			error = 'Error in the thumbnail generation lambda handler.'
			alert('There was an issue uploading this asset to Materia - Please try again.')
			_saveUploadStatus(fileData.ext, keyData.file_key, false, error)
			return
		}

		const request_to_S3 = new XMLHttpRequest()

		request_to_S3.onreadystatechange = () => {
			if (request_to_S3.readyState === XMLHttpRequest.DONE) {
				if (request_to_S3.status === 200 || request_to_S3.status === 201) {
					return _saveUploadStatus(fileData.ext, keyData.file_key, true)
				} else if (request_to_S3.status === 404) {
					return _verifyUpload(keyData, fileData, attempt + 1)
				} else {
					error = 'Error in the thumbnail generation lambda handler.'
					alert('There was an issue uploading this asset to Materia - Please try again.')
					_saveUploadStatus(fileData.ext, keyData.file_key, false, error)
					return
				}
			}
		}

		request_to_S3.open('HEAD', CONFIG.mediaUrl + '/' + keyData.file_key)

		// Wait longer for each attempt to avoid too many HEAD requests
		return setTimeout(function() {
			request_to_S3.send()
		}, attempt * 1000)
	}
})
