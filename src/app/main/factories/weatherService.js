'use strict'

angular
  .module('adventureplanner.main')
	.factory('weatherService', function weatherService ( $http ) {
		var service = {
			get: get
		};

		return service;

		//////////////

		function get(params) {
			if (!params.hasOwnProperty('i')) { // not needed for init function
				params.i = undefined;
			}
			var request = buildWeatherRequest(params);
			return $http({
				url: request, 
				method: "GET",
				params: { i: params.i }
			});
		}

		function buildWeatherRequest (params) {
			return 'http://api.openweathermap.org/data/2.5/weather?lat=' + params.lat + '&lon=' + params.lng;
		}
  
  });