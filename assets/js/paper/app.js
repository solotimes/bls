var app = angular.module('Paper', ['paper.filters', 'paper.services', 'paper.directives'])
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.when('/question/', {templateUrl: '/templates/question.html', controller: 'QuestionCtl'});
    // $routeProvider.when('/question/:qid', {templateUrl: '/templates/question.html', controller: 'QuestionCtl'});
    // $routeProvider.otherwise();
  }]);