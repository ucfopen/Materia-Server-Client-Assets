describe('escape filter', function() {
	var filter

	beforeEach(() => {
		filter = testGetFilter('escape')
	})

	it('OBJECT_TYPES to contain expected data', function() {
		expect(filter).not.toBeNull()
		expect(filter('<test>')).toBe('%3Ctest%3E')
	})
})
