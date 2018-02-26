describe('Materia.Coms.Json', function() {
	beforeEach(() => {
		global.API_LINK = 'my_api_url'
		require('../materia-namespace')
		require('./materia.coms.json.js')
	})

	it('defines expected public methods', () => {
		let coms = Namespace('Materia.Coms').Json
		expect(coms.send).toBeDefined()
		expect(coms.isError).toBeDefined()
		expect(coms.post).toBeDefined()
		expect(coms.get).toBeDefined()
		expect(coms.setGateway).toBeDefined()
	})

	it('defines expected public methods', () => {
		let coms = Namespace('Materia.Coms').Json
		expect(coms.send).toBeDefined()
		expect(coms.isError).toBeDefined()
		expect(coms.post).toBeDefined()
		expect(coms.get).toBeDefined()
		expect(coms.setGateway).toBeDefined()
	})
})
