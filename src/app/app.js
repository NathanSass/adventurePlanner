

angular.module('adventureplanner', [
  'ngRoute',
  'adventureplanner.main'
])
.filter('kelvinToF', function() {
  'use strict';
  return function(kelvin) {

    return (parseFloat(kelvin) - 273.15) * 1.8000 + 32.00;
  };
})
.filter('metersToMiles', function() {
  'use strict';
  return function(meters) {

    return meters / 1609.344;
  };
})
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
