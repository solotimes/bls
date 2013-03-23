var app = angular.module('Paper', ['paper.filters', 'paper.services', 'paper.directives'])
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.when('/recording', {templateUrl: '/templates/recording.html', controller: 'RecordingCtrl'});
    $routeProvider.when('/marking', {templateUrl: '/templates/marking.html', controller: 'MarkingCtrl'});
    $routeProvider.otherwise({templateUrl: '/templates/recording.html', controller: 'RecordingCtrl'});
  }]);