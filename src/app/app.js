
angular.module('adventureplanner', [
  'ngRoute',
  'adventureplanner.main'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/adventureplanner/main/todo.html'
    })
    .otherwise({
      redirectTo: '/todo'
    });
});
