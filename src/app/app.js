
angular.module('adventureplanner', [
  'ngRoute',
  'adventureplanner.todo'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/adventureplanner/todo/todo.html'
    })
    .otherwise({
      redirectTo: '/todo'
    });
});
