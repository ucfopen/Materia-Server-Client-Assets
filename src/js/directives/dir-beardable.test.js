describe('beardable Directive', function() {
	let _scope
	let _compile
	let _timeout
	let createElementSpy = jest.spyOn(document, 'createElement')
	let headAppendSpy = jest.spyOn(document.head, 'appendChild')
	let windowEventListenerSpy = jest.spyOn(window, 'addEventListener')
	let html = '<div beardable>text</div>'
	global.STATIC_CROSSDOMAIN = 'static_domain'
	global.window.localStorage = { beardMode: 'false' }

	let keyEvent = (code, unsetWhich = false) => {
		var e = new Event('keydown')
		e.keyCode = code
		e.which = code
		e.altKey = false
		e.ctrlKey = true
		e.shiftKey = false
		e.metaKey = false
		e.bubbles = true
		if (unsetWhich) delete e.which
		return e
	}

	beforeEach(() => {
		createElementSpy.mockClear()
		headAppendSpy.mockClear()
		windowEventListenerSpy.mockClear()
		require('./dir-beardable')
		inject(function($compile, $rootScope, $timeout) {
			_compile = $compile
			_scope = $rootScope.$new()
			_timeout = $timeout
		})
	})

	afterEach(() => {
		let css = document.getElementById('beard_css')
		if (css) css.parentElement.removeChild(css)
	})

	it('is disabled when beardmode is off and listens for keydown', function() {
		window.localStorage.beardMode = false
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)

		_scope.$digest()
		expect(createElementSpy).not.toHaveBeenLastCalledWith('link')
		expect(windowEventListenerSpy).toHaveBeenLastCalledWith('keydown', expect.any(Function))
	})

	it('is enabled when beardmode is on and listens for keydown', function() {
		global.window.localStorage.beardMode = 'true'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(createElementSpy).toHaveBeenLastCalledWith('link')
		expect(headAppendSpy).toHaveBeenCalled()
		expect(windowEventListenerSpy).toHaveBeenLastCalledWith('keydown', expect.any(Function))
	})

	it('enables with the right key events', function() {
		global.window.localStorage.beardMode = 'false'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(66))
		expect(document.getElementById('beard_css')).toBeNull()
		window.dispatchEvent(keyEvent(65))
		expect(document.getElementById('beard_css')).not.toBeNull()
	})

	it('disables with the right key events are entered', function() {
		global.window.localStorage.beardMode = 'true'
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(document.getElementById('beard_css')).not.toBeNull()
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(66))
		expect(document.getElementById('beard_css')).not.toBeNull()
		window.dispatchEvent(keyEvent(65))
		expect(document.getElementById('beard_css')).toBeNull()
	})

	it('konami code resets when messed up', function() {
		global.window.localStorage = { beardMode: 'false' }
		let element = angular.element(html)
		let compiled = _compile(element)(_scope)
		_scope.$digest()

		expect(document.getElementById('beard_css')).toBeNull()
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(66))
		window.dispatchEvent(keyEvent(66)) // this second a should cause the final b to reset
		window.dispatchEvent(keyEvent(10))
		expect(document.getElementById('beard_css')).toBeNull()

		// start over
		window.dispatchEvent(keyEvent(38, true))
		window.dispatchEvent(keyEvent(38))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(40))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(37))
		window.dispatchEvent(keyEvent(39))
		window.dispatchEvent(keyEvent(66))
		expect(document.getElementById('beard_css')).toBeNull()
		window.dispatchEvent(keyEvent(65))
		expect(document.getElementById('beard_css')).not.toBeNull()
	})
})
