'use strict';

angular.module('adventureplanner', [
  'ngRoute',
  'adventureplanner.main'
])
.filter('kelvinToF', function() {
  return function(kelvin) {

    return (parseFloat(kelvin) - 273.15) * 1.8000 + 32.00;
  };
})
.filter('metersToMiles', function() {
  return function(meters) {
    return meters / 1609.344;
  };
})
.config(function ($routeProvider) {
  $routeProvider.
    when('/home', {
      templateUrl: '/adventureplanner/main/displayPlaces.html',
      controller: 'MainCtrl',
      resolve: {
        getVenuesAndWeather: getVenuesAndWeather
      }
    }).
    when('/landing', {
      templateUrl: '/adventureplanner/main/landingPage.html',
      controller: 'landingCtrl',
    }).
    otherwise({
      redirectTo: '/landing'
    });
});

getVenuesAndWeather.$inject = ['dataService'];
function getVenuesAndWeather (dataService) {
  return dataService.init();
}