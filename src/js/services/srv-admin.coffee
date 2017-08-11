app = angular.module('materia')
app.service 'adminSrv', ->

	getWidgets = (callback) ->
		Materia.Coms.Json.get '/api/admin/widgets', callback

	saveWidget = (widget, callback) ->
		Materia.Coms.Json.post "/api/admin/widget/#{widget.id}", widget, callback

	searchUsers = (str, callback) ->
		Materia.Coms.Json.get "/api/admin/user_search/#{str}", callback

	lookupUser = (userId, callback) ->
		Materia.Coms.Json.get "/api/admin/user/#{userId}", callback

	saveUser = (obj, callback) ->
		Materia.Coms.Json.post "/api/admin/user/#{obj.id}", obj, callback

	getWidgets: getWidgets
	saveWidget: saveWidget
	searchUsers: searchUsers
	lookupUser: lookupUser
	saveUser: saveUser
