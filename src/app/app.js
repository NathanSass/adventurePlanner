
angular.module('adventureplanner', [
  'ngRoute',
  'adventureplanner.main'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider.
    when('/home', {
      controller: 'MainCtrl',
      templateUrl: '/adventureplanner/main/displayPlaces.html'
    }).
    when('/todo', {
      controller: 'MainCtrl',
      templateUrl: '/adventureplanner/main/todo.html'
    }).
    otherwise({
      redirectTo: '/home'
    });
});
