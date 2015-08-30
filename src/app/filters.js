'use strict';

angular.module('adventureplanner')
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
// .filter('weatherSort', function weatherSort () {
// 	return function(venues) {
// 		venues.sort(function(a,b){
// 			console.log("in weatherSort")
// 			if (a.weather.temp > b.weather.temp){
// 				return 1;
// 			} if (a.weather.temp < b.weather.temp) {
// 				return -1;
// 			} else {
// 				return 0;
// 			}

// 		});
// 	};
// });