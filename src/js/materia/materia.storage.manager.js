/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Storage').Manager = (function() {

	const _tables = [];

	// Adds a StorageTable to the currently managed list of tables. StorageTables
	// are used to store arbitrary information pertaining to a Widget.
	// @id The name of the table to insert (used to insert to it later)
	// @columns The names of the columns for this table
	const addTable = function(tableName, ...columns) {
		let table;
		try {
			return getTable(tableName);
		} catch (error) {
			table = Materia.Storage.Table();
			table.init(tableName, columns);
			return _tables.push(table);
		}
		finally {
			if (table == null) {
				throw new Error(`Table '${tableName}' already exists`);
				return false;
			}
			return true;
		}
	};

	// Inserts a row into the the table with the given ID. Make sure the number
	// of arguments after tableId matches the number of columns that belong to this
	// table
	// @param tableId The name of the table to insert the values to
	// @param values The values to insert to the table
	const insert = function(tableName, ...values ) {
		const tableId = clean(tableName);
		const table = getTable(tableId);
		if (table == null) { // throw error if not found
			throw new Error(`Data table '${tableId}'' does not exist.`);
			return null;
		}
		// Insert the row into the appropriate table
		const result = table.insert(values);
		return Materia.Engine.sendStorage(result);
	};

	var getTable = function(tableId) {
		tableId = clean(tableId);
		// Search for the Table
		for (let table of Array.from(_tables)) {
			if (table.getId() === tableId) { return table; }
		}
			
		throw new Error(`Data table '${tableId}' does not exist.`);
		return null;
	};

	var clean = function(name) {
		name      = String(name);
		let cleanName = name.replace(/^([ ]+)/, '');
		cleanName = cleanName.replace(/\s+$/g, '');
		cleanName = cleanName.replace(/\s/g, '_');

		if (['userName', 'firstName', 'lastName', 'timestamp', 'playID'].includes(cleanName)) {
			throw new Error(`Column name "${name}" is a protected keyword`);
		}

		return cleanName;
	};

	return {
		addTable,
		clean,
		insert,
		getTable
	};
})();