'use strict'

angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, dataService) {
    $scope.service = dataService;
    $scope.filterByBestWeather = function ( venue) {
			if (venue.hasOwnProperty('weather')) {
				if (venue.weather.hasOwnProperty('temp')) {
					return venue.weather.temp;
				}
			}
    };
  });