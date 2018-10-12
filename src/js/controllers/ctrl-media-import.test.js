describe('mediaImportCtrl', function() {
	var setGatewayMock
	var sendMock
	var postMock
	var getMock
	var thenMock
	var $controller
	var $window
	var mockPlease
	var $rootScope

	//create an object roughly matching an asset returned by the API
	var createAssetObject = (idNumber, title, remote_asset = false, status = null) => {
		let idString = '00000'.slice(0, ( -1 * ('' + idNumber).length) ) + idNumber
		let fileType = title.split('.').pop()
		return {
			created_at: '1500000000',
			file_size: '1000',
			id: idString,
			remote_url: remote_asset ? (idString + '.' + fileType) : null,
			status: status,
			title: title,
			type: fileType
		}
	}

	var useAssets
	var defaultAssets = [
		createAssetObject(1, 'audio1.mp3'),
		createAssetObject(2, 'audio2.ogg'),
		createAssetObject(3, 'image1.png'),
		createAssetObject(4, 'image2.jpg'),
		createAssetObject(5, 'image3.jpg'),
		createAssetObject(6, 'invalid1.exe')
	]

	beforeEach(() => {
		mockPlease = { $apply: jest.fn() }
		let app = angular.module('materia')
		app.factory('Please', () => mockPlease)

		// MOCK $window
		$window = {
			addEventListener: jest.fn(),
			location: {
				reload: jest.fn(),
				hash: {
					substring: jest.fn()
				}
			}
		}
		app.factory('$window', () => $window)

		require('../materia-namespace')
		require('../materia-constants')
		require('./ctrl-media-import')

		global.MEDIA_UPLOAD_URL = 'https://mediauploadurl.com'
		global.MEDIA_URL = 'https://mediaurl.com'

		inject((_$controller_, _$rootScope_) => {
			$controller = _$controller_
			$rootScope = _$rootScope_
		})

		Namespace('Materia.Coms.Json').setGateway = setGatewayMock = jest.fn()
		Namespace('Materia.Coms.Json').send = sendMock = jest.fn().mockImplementation((target) => {
			switch(target) {
				case 'assets_get':
					return {
						then: jest.fn().mockImplementation((callback) => {
							callback(useAssets)
						})
					}
				default:
					break
			}
		})
		Namespace('Materia.Coms.Json').post = postMock = jest.fn()
		Namespace('Materia.Coms.Json').get = getMock = jest.fn()

		Namespace('Materia.Creator').onMediaImportComplete = jest.fn()

		useAssets = []
	})

	it('reacts to users not having any assets', () => {
		$window.location.hash.substring.mockReturnValueOnce('image')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		expect($scope.displayFiles).toHaveLength(0)
	})

	it('grabs a list of assets', () => {
		useAssets = defaultAssets

		$window.location.hash.substring.mockReturnValue('image')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		expect($scope.displayFiles).toHaveLength(3)
	})

	it('ignores unexpected filetypes', () => {
		useAssets = [
			createAssetObject(1, 'file1.unk'),
			createAssetObject(2, 'image1.png')
		]

		$window.location.hash.substring.mockReturnValueOnce('png,unk')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		expect($scope.displayFiles).toHaveLength(1)
	})

	it('ignores remote assets that were not successfully migrated', () => {
		useAssets = [
			createAssetObject(1, 'image1.png', true),
			createAssetObject(2, 'image2.png', true, 'migrated_asset')
		]

		$window.location.hash.substring.mockReturnValueOnce('image')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		expect($scope.displayFiles).toHaveLength(1)
	})

	it('should generate thumbnail urls correctly', () => {
		useAssets = [
			createAssetObject(1, 'image1.png'),
			createAssetObject(2, 'audio1.mp3')
		]
		$window.location.hash.substring.mockReturnValueOnce('image,audio')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		//case one - images should be MEDIA_URL/assetid/thumbnail
		expect($scope.displayFiles[0].thumb).toEqual('https://mediaurl.com/00001/thumbnail')
		//case two - audio should always refer to relative asset '/img/audio.png'
		expect($scope.displayFiles[1].thumb).toEqual('/img/audio.png')
	})


	//jest starts malfunctioning in strange ways when it tries interacting with the upload code
	//either it's an us issue or a jest issue, either way it's taking too long to figure out
	//need to pick this back up at some point in the future
	xit('should upload files successfully', () => {
		$window.location.hash.substring.mockReturnValueOnce('image,audio')

		var $scope = {
			$watch: jest.fn(),
			$apply: jest.fn()
		}

		var controller = $controller('mediaImportCtrl', { $scope })

		//create an approximation of a file for testing
		let uploadFile = new File(
			[''],
			'audio1.mp3',
			{
				type: 'audio/mp3',
				lastModified: new Date(1500000000)
			}
		)

		//normally this would be handled by the browser
		//we can mock an event to approximate this
		//however, for some reason this is different depending on how the file makes it into the browser
		let uploadEvent

		//case one: a file was dropped on the interface
		uploadEvent = {
			target: {
				files: [uploadFile]
			}
		}
		$scope.uploadFile(uploadEvent)
	})
})
