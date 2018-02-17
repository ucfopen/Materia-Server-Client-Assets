// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
Namespace('Materia.Storage').Table = function() {

	let _id = null;
	let _columns = [];
	let _rows = [];

	// Creates a new StorageTable for storing data to the server.
	// StorageTables are built to slightly mimic the functionality of database tables.
	// @param id The name of this StorageTable
	// @param columns The names of each of the columns for this table

	const init = function(id, columns) {
		_id = Materia.Storage.Manager.clean(id);
		_columns = [];
		_rows = [];
		for (let name of Array.from(columns)) {
			_columns.push(Materia.Storage.Manager.clean(name));
		}
		return null;
	};

	// Inserts a new row into this table.
	// @param values The values to insert into the table. Make sure the number
	// of arguments passed match the number of columns pertaining to this table.

	const insert = function(values) {
		// Make sure arguments match number of columns
		if (values.length === !_columns.length) {
			throw new Error(`StorageTable '${_id}' requires ${_columns.length} value(s) and received ${arguments.length}`);
			return;
		}

		// Create the row to add to the list of rows
		const result = {};

		for (let i in values) {
			const value = values[i];
			result[_columns[i]] = String(value);
		}

		_rows.push(result);
		// Send this row to the server
		return {
			name: _id,
			data: result
		};
	};

	const getValues = function() {
		const values = [];
		for (let row of Array.from(_rows)) {
			values.push(row);
		}
		return values;
	};

	const getId = () => _id;

	return {
		getId,
		init,
		insert,
		getValues
	};
};
