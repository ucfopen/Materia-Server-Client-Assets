# Controller and accessory factory for Materia's modal resume dialog
app = angular.module 'materia'
app.controller 'resumeCtrl', ($scope, Resume) ->
    
    $scope.resume = Resume

app.factory 'Resume', ->
    title: ''
    msg: ''
    callback: null
