// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const app = angular.module('materia')

app.controller('mediaImportCtrl', function($scope, $sce, $timeout, $window, $document) {
	let selectedAssets = []
	let data = []
	let assetIndices = []
	let dt = null
	let uploading = false
	let creator = null
	let _coms = null
	const _s3enabled = S3_ENABLED // explicitly localize globals
	const _mediaUploadUrl = MEDIA_UPLOAD_URL
	const _mediaUrl = MEDIA_URL
	const _baseUrl = BASE_URL

	var Uploader = (function() {
		let $dropArea = undefined
		Uploader = class Uploader {
			static initClass() {
				$dropArea = $('.drag-wrapper')

				$dropArea
					.on('drag dragstart dragend dragover dragenter dragleave drop', e => e.preventDefault())
					.on('dragover dragenter', () => $dropArea.addClass('drag-is-dragover'))
					.on('dragleave dragend drop', () => $dropArea.removeClass('drag-is-dragover'))
			}
			constructor(config1) {
				this.onFileChange = this.onFileChange.bind(this)
				this.config = config1
			}

			// when file is selected in browser
			onFileChange(event) {
				//accounts for drag'n'drop
				let fileList = event.target.files
				if ((fileList != null ? fileList[0] : undefined) == null) {
					fileList = event.dataTransfer.files
				}
				// just picks the first selected image
				if ((fileList != null ? fileList[0] : undefined) != null) {
					this.getFileData(fileList[0], fileData => {
						if (fileData != null) {
							// if s3 is enabled, get keys and then upload, o/w just upload
							if (this.config.s3enabled) {
								_coms.send('upload_keys_get', [fileData.name, fileData.size]).then(keyData => {
									if (keyData) {
										this.upload(fileData, keyData)
									}
								})
							} else {
								this.upload(fileData)
							}
						}
					})
				}
			}

			// get the data of the image
			getFileData(file, callback) {
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
					const mime = this.getMimeType(src)
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

			getMimeType(dataUrl) {
				const mime = dataUrl.split(';')[0].split(':')[1]

				// used to see if the file type is allowed
				const fileExtension = mime == null ? null : mime.split('/')[1]

				if (fileExtension == null || $scope.fileType.indexOf(fileExtension) === -1) {
					alert(`This widget does not support selected file type is not supported. \
The allowed types are: ${$scope.fileType.join(', ')}.`)
					return null
				}

				return mime
			}

			// converts image data uri to a blob for uploading
			dataURItoBlob(dataURI, mime) {
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
			upload(fileData, keyData) {
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
				fd.append('file', this.dataURItoBlob(fileData.src, fileData.mime), fileData.name)

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

							this.saveUploadStatus(fileData.ext, keyData.file_key, success, upload_error)
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
							return loadAllMedia(res.id) // todo: wait, but why? for file info?
						}
					}
				}

				request.open('POST', this.config.uploadUrl)
				return request.send(fd)
			}

			verifyUpload(keyData, fileData, attempt) {
				let error
				if (attempt == null) {
					attempt = 0
				}
				if (attempt > 4) {
					error = 'Error in the thumbnail generation lambda handler.'
					alert('There was an issue uploading this asset to Materia - Please try again.')
					this.saveUploadStatus(fileData.ext, keyData.file_key, false, error)
					return
				}

				const request_to_S3 = new XMLHttpRequest()

				request_to_S3.onreadystatechange = () => {
					if (request_to_S3.readyState === XMLHttpRequest.DONE) {
						if (request_to_S3.status === 200 || request_to_S3.status === 201) {
							return this.saveUploadStatus(fileData.ext, keyData.file_key, true)
						} else if (request_to_S3.status === 404) {
							return this.verifyUpload(keyData, fileData, attempt + 1)
						} else {
							error = 'Error in the thumbnail generation lambda handler.'
							alert('There was an issue uploading this asset to Materia - Please try again.')
							this.saveUploadStatus(fileData.ext, keyData.file_key, false, error)
							return
						}
					}
				}

				request_to_S3.open('HEAD', this.config.mediaUrl + '/' + keyData.file_key)

				// Wait longer for each attempt to avoid too many HEAD requests
				return setTimeout(function() {
					request_to_S3.send()
				}, attempt * 1000)
			}

			saveUploadStatus(fileType, fileURI, s3_upload_success, error = null) {
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
		}
		Uploader.initClass()
		return Uploader
	})()

	const config = {
		s3enabled: _s3enabled,
		uploadUrl: _mediaUploadUrl,
		mediaUrl: _mediaUrl
	}
	const uploader = new Uploader(config)

	// SCOPE VARS
	// ==========
	$scope.fileType = location.hash.substring(1).split(',')
	$scope.cols = ['Title', 'Type', 'Date'] // the column names used for sorting datatable

	// this column data is passed to view to automate table header creation,
	// without which datatables will fail to function
	$scope.dt_cols = [
		//columns expected from result, index 0-5
		{ data: 'id' },
		{ data: 'wholeObj' }, // stores copy of whole whole object as column for ui purposes
		{ data: 'remote_url' },
		{ data: 'title' },
		{ data: 'type' },
		{ data: 'file_size' },
		{ data: 'created_at' }
	]

	$scope.uploadFile = uploader.onFileChange

	// load up the media objects, optionally pass file id to skip labeling that file
	var loadAllMedia = function(file_id) {
		// clear the table
		selectedAssets = []
		assetIndices = []
		data = []
		const modResult = []

		$('#question-table')
			.dataTable()
			.fnClearTable()
		// determine the types from the url hash string
		let mediaTypes = getHash()
		if (mediaTypes) {
			mediaTypes = mediaTypes.split(',')
		}

		// load and/or select file for labelling
		return _coms.send('assets_get', []).then(result => {
			if (result && result.msg === undefined && result.length > 0) {
				data = result
				$('#question-table')
					.dataTable()
					.fnClearTable()
				// augment result for custom datatables ui
				for (let index = 0; index < result.length; index++) {
					const res = result[index]
					if (
						res.remote_url != null &&
						res.status !== 'upload_success' &&
						res.status !== 'migrated_asset'
					) {
						continue
					}

					if (Array.from($scope.fileType).includes(res.type)) {
						// the id used for asset url is actually remote_url
						// if it exists, use it instead
						res.id = res.remote_url != null ? res.remote_url : res.id

						// file uploaded - if this result's id matches, stop processing and select this asset now
						if (
							file_id != null &&
							res.id === file_id &&
							Array.from($scope.fileType).includes(res.type)
						) {
							$window.parent.Materia.Creator.onMediaImportComplete([res])
						}

						// make entire object (barring id) an attr to use as column in datatables
						const temp = {}
						for (let attr of Object.keys(res || {})) {
							if (attr !== 'id') {
								temp[attr] = res[attr]
							}
						}
						res['wholeObj'] = temp
						//Store data table index in asset-specific array for use when user clicks asset in GUI
						assetIndices.push(index)
						modResult.push(res)
					}
				}

				// Only add to table if there are items to add
				if (modResult.length > 0) {
					return $('#question-table')
						.dataTable()
						.fnAddData(modResult)
				}
			}
		})
	}

	var getHash = () => $window.location.hash.substring(1)

	// init
	const init = function() {
		$(document).on('click', '#question-table tbody tr[role=row]', function(e) {
			//get index of row in datatable and call onMediaImportComplete to exit
			$('.row_selected').toggleClass('row_selected')
			const index = $('#question-table')
				.dataTable()
				.fnGetPosition(this)
			//translates GUI's index of asset chosen to that of data table index
			selectedAssets = [data[assetIndices[index]]]
			return $window.parent.Materia.Creator.onMediaImportComplete(selectedAssets)
		})

		// todo: add cancel button
		$('#close-button').click(function(e) {
			e.stopPropagation()
			return $window.parent.Materia.Creator.onMediaImportComplete(null)
		})

		// sorting buttons found in sort bar
		$('.dt-sorting').click(function(e) {
			const el = $(this).next() //get neighbor
			if (el.hasClass('sort-asc') || el.hasClass('sort-desc')) {
				return el.toggleClass('sort-asc sort-desc')
			} else {
				el.addClass('sort-asc')
				return el.show()
			}
		})

		// on resize, re-fit the table size
		$(window).resize(() => dt.fnAdjustColumnSizing())

		// setup the table
		dt = $('#question-table').dataTable({
			paginate: false, // don't paginate
			lengthChange: true, // resize the fields
			autoWidth: false, //
			processing: true, // show processing dialog
			scrollY: 'inherit', // setup to be a scrollable table
			language: {
				search: '', // hide search label
				infoFiltered: '',
				info: '',
				infoEmpty: ''
			},
			// columns to display
			columns: $scope.dt_cols, //see global vars up top
			// special sorting options
			sorting: [[5, 'desc']], //sort by date by default
			// item renderers
			columnDefs: [
				{
					// thumbnail column
					render(data, type, full, meta) {
						if (
							full.type === 'jpg' ||
							full.type === 'jpeg' ||
							full.type === 'png' ||
							full.type === 'gif'
						) {
							// todo: poll, since we don't know when lambda resizing is finished

							let thumbUrl = `${_mediaUrl}/`

							if (_s3enabled) {
								const original_path_data = data.split('/')

								// separates filename and extension
								const image_key = original_path_data.pop().split('.')

								let extension = image_key.pop()

								// Maintains a standard extension
								if (extension === 'jpeg') {
									extension = 'jpg'
								}

								// thumbnails in Materia are 75x75 dimensions
								image_key.push(`75x75.${extension}`)
								original_path_data.push(image_key.join('-'))

								// creates final thumbnail path
								const thumbId = original_path_data.join('/')
								thumbUrl += `${thumbId}`
							} else {
								thumbUrl += `${data}/thumbnail`
							}
							return `<img src='${thumbUrl}'>`
						} else if (full.type === 'mp3' || full.type === 'wav') {
							return '<img src="/img/audio.png">'
						} else {
							return ''
						}
					},
					searchable: false,
					sortable: true,
					targets: 0
				},
				{
					// custom ui column containing a nested table of asset details
					render(data, type, full, meta) {
						if (Array.from($scope.fileType).includes(full.type)) {
							const sub_table = document.createElement('table')
							sub_table.width = '100%'
							sub_table.className = 'sub-table'

							const row = sub_table.insertRow()
							let cell = row.insertCell()

							let temp = document.createElement('div')
							temp.className = 'subtable-title'
							temp.innerHTML = data.title.split('.')[0]
							cell.appendChild(temp)

							temp = document.createElement('div')
							temp.className = 'subtable-type subtable-gray'
							temp.innerHTML = data.type
							cell.appendChild(temp)

							cell = row.insertCell()
							cell.className = 'subtable-date subtable-gray'
							const d = new Date(data.created_at * 1000)
							cell.innerHTML = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()

							return sub_table.outerHTML
						} else {
							return ''
						}
					},
					searchable: false,
					sortable: false,
					targets: 1
				},
				{
					// remaining columns are searchable but hidden
					visible: false,
					sortable: true,
					targets: [2, 3, 4, 5]
				}
			]
		})

		// add sort listeners to custom sort elements in sort-bar on view
		for (let i = 0; i < $scope.cols.length; i++) {
			const col = $scope.cols[i]
			dt.fnSortListener($(`#sort-${col}`), i + 2)
		}

		// add id for custom styling
		$('#question-table_filter input').attr('id', 'search-box')

		_coms = Materia.Coms.Json
		_coms.setGateway(API_LINK)
		return loadAllMedia()
	}

	return $timeout(init)
})
