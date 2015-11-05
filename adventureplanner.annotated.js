angular.module('adventureplanner.main', []);

'use strict'

angular
  .module('adventureplanner.main')
	.factory('weatherService', ["$http", function weatherService ( $http ) {
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
				method: 'GET',
				params: { i: params.i }
			});
		}

		function buildWeatherRequest (params) {
			return 'http://api.openweathermap.org/data/2.5/weather?lat=' + params.lat + '&lon=' + params.lng + '&APPID=4233057dd5ff3c197d4ae39ae8b05582';
		}
  
  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .factory('venueService', ["$http", function venueService ($http) {
    
    var service = {
      get: get
    };
    
    return service;
    
    //////////////
    
    function get(params) {
      var request = buildVenueRequest (params);
      return $http.get(request);
    }

    function buildVenueRequest (params) {
      var id     = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
      var secret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

      function _randNum (max) {
        return Math.floor((Math.random() * max) + 1 );
      }
      
      return 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 id   +
                 '&client_secret='  +
                  secret            +
                 '&v=20130815&'     +
                 'll=' + params.lat + ','   + params.lng +
                 '&query='  + params.query  +
                 '&offset=' + _randNum(params.offset)    +
                 '&limit='  + params.limit  +
                 '&radius=130000'   +
                 '&sortByDistance=1';
    }
  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .factory('nearCityService', ["$http", function nearCityService ($http) {
    
    var service = {
      get: get,
      findBoundaries: findBoundaries,
      buildRequest: buildRequest
    };
    
    return service;
    
    //////////////
    
    function get ( params ) {
      var request = buildRequest(params);
      return $http.get(request);
    }

    function findBoundaries (params) {
      var lat  = parseFloat(params.lat);
      var lng  = parseFloat(params.lng);
      return {
        n: lat + 1.25,
        s: lat - 1.25,
        e: lng + 1.25,
        w: lng - 1.25
      };
    }

    function buildRequest ( params ) {
      var boundaries = service.findBoundaries(params);
      return 'http://api.geonames.org/citiesJSON?' +
        'north='    + boundaries.n   +
        '&south='   + boundaries.s   +
        '&east='    + boundaries.e   +
        '&west='    + boundaries.w   +
        '&maxRows=' + params.maxRows +
        '&lang=de&username=sturpon711';
    }

  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .factory('geolocator', ["$location", "$window", "$timeout", "dataService", function geolocator($location, $window, $timeout, dataService) {
    var service = {
      get: get,
      success: success
    };

    return service;
    
    //////////////

    function get () {
      if ($window.navigator.geolocation) {
          $window.navigator.geolocation.getCurrentPosition(success);
      }
      else {
        console.log("Geolocation is not supported by this browser.");
      }
    }

    function success (position){
      dataService.currentData.lat = position.coords.latitude;
      dataService.currentData.lng = position.coords.longitude;
      
      $timeout(function(){ 
        $location.path('home');
      },1);
    }
  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', ["venueService", "weatherService", "nearCityService", "$location", "$q", function dataService (venueService, weatherService, nearCityService, $location, $q) {
    var instance = {
			currentData: {
        name: '',
        temp: '',
        condition: '',
        lat: '',
        lng: ''
      },
      expandSearch: expandSearch,
      findDistance: findDistance,
      getVenues: getVenues,
      init: init,
      lat: '',
      lng: '',
      limit:  10,
      maxRows: 3,
      newSearch: newSearch,
      offset: 20,
      parseVenueData: parseVenueData,
      sortByTemp: sortByTemp,
      userSearchTerm: 'mountain',
      venues: [],
      // set venues(value) {
      //   this._venues = this._venues.concat(value);
      // },
      // get venues() {
      //   return this._venues;
      // },
      appData: []
    };

    return instance;
  
    //////////////
  
    function init () {
      var params = {
        lat: instance.currentData.lat,
        lng: instance.currentData.lng
      };
      weatherService.get(params).then(function(response){
        instance.currentData.temp      = response.data.main.temp;
        instance.currentData.condition = response.data.weather[0].main;
        instance.currentData.name = response.data.name;
      });
      instance.lat = params.lat;
      instance.lng = params.lng;
      getVenues();
    }

    function newSearch () {
      instance.venues = [];
      getVenues();
    }
    
    function expandSearch () {
      var params = {
        lat:     instance.lat,
        lng:     instance.lng,
        offset:  instance.offset,
        query:   instance.userSearchTerm,
        limit:   instance.limit,
        maxRows: instance.maxRows
      };
      return nearCityService.get(params).then(function(nearcities){
        nearcities.data.geonames.forEach(function(city){
          instance.lat  = city.lat;
          instance.lng  = city.lng;
          instance.getVenues();
        });
      });
    }

    function getVenues () {
      
      var params = {
        lat:    instance.lat,
        lng:    instance.lng,
        offset: instance.offset,
        query:  instance.userSearchTerm,
        limit:  instance.limit
      };
      
      return venueService.get(params)
        .then(function (response) {
          var newVenues   = parseVenueData(response.data.response.groups[0].items);
          instance.venues = instance.venues.concat(newVenues);
          return mapVenueWithWeatherAndDist(instance.venues); //what is convention with returns in .then()
        })
        .catch(function () {
          $location.path('landing');
        })
        .then(function(){
            if (instance.venues.length > 1) {
              instance.venues  = sortByTemp(instance.venues);
            }
            instance.appData = instance.venues;
            return instance.appData;
        });

    }

    function sortByTemp (venues) { // currently not used
			return venues.sort(function(a,b){
				// I wonder if this is more or less performant than a try/catch
				if (a.hasOwnProperty('weather') && b.hasOwnProperty('weather')) {
					if (a.weather.hasOwnProperty('temp') && b.weather.hasOwnProperty('temp')) {

						if (a.weather.temp < b.weather.temp){
							return 1;
						}
						if (a.weather.temp > b.weather.temp) {
							return -1;
						} else {
							return 0;
						}

					}
				}
			});
    };

    function parseVenueData (data){
      var newVenueArr = [];
      data.forEach(function(el, i){
        try {
          newVenueArr[i] = {
            name:  el.venue.name,
            blurb: el.tips[0].text,
            lat:   el.venue.location.lat,
            lng:   el.venue.location.lng
          };
        } catch(e){
          newVenueArr[i] = {
            name:  el.venue.name,
            lat:   el.venue.location.lat,
            lng:   el.venue.location.lng
          };
          console.log('error: ', el);
        }
      });
      return newVenueArr;
    }

		function mapVenueWithWeatherAndDist (venues) {

      var promises = [];

      venues.forEach(function (place, index) {

        var params   = {
          lat: place.lat,
          lng: place.lng,
          i: index
        };

        var dist = findDistance(place.lat, place.lng); // Not exactly part of this function but works here
        place.distance = dist;

        var promise = weatherService.get(params).then(
          function(response) {
            try {
              var index = response.config.params.i;
              instance.venues[index].weather = {
                temp: response.data.main.temp,
                condition: response.data.weather[0].main
              };
            } catch(e) {
              console.log('Error: ', instance.venues);
            }
          });

        promises.push(promise);

      });

      return $q.all(promises);
		}

    function findDistance (lat2, lng2) {
      var lat1 = instance.currentData.lat;
      var lng1 = instance.currentData.lng;
      var rad  = function(x) {
        return x * Math.PI / 180;
      };
      var R     = 6378137; // Earth’s mean radius in meter
      var dLat  = rad(lat2 - lat1);
      var dLong = rad(lng2 - lng1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d; // distance in meters
    }
  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .controller('landingCtrl', ["$scope", "$window", "dataService", "geolocator", function ($scope, $window, dataService, geolocator) {
    geolocator.get();
  }]);
'use strict'

angular
  .module('adventureplanner.main')
  .controller('MainCtrl', ["$scope", "$window", "dataService", function ($scope, $window, dataService) {
    $scope.service = dataService;
  }]);
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
.config(["$routeProvider", function ($routeProvider) {
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
}]);

getVenuesAndWeather.$inject = ['dataService'];
function getVenuesAndWeather (dataService) {
  return dataService.init();
}
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
.filter('weatherSort', function weatherSort () { // Not used, was throwing errors
	
	return function(venues) {
		return venues.sort(function(a,b){
			// I wonder if this is more or less performant than a try/catch
			if (a.hasOwnProperty('weather') && b.hasOwnProperty('weather')) {
				if (a.weather.hasOwnProperty('temp') && b.weather.hasOwnProperty('temp')) {
				
					if (a.weather.temp < b.weather.temp){
						return 1;
					}
					if (a.weather.temp > b.weather.temp) {
						return -1;
					} else {
						return 0;
					}
				
				}
			}
		});
	};
});
(function(module) {
try {
  module = angular.module('adventureplanner');
} catch (e) {
  module = angular.module('adventureplanner', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/adventureplanner/main/displayPlaces.html',
    '<h2>You are in: {{service.currentData.name}}</h2><p>It\'s {{service.currentData.temp | kelvinToF | number:1}} F and {{service.currentData.condition}}</p><form ng-submit="service.newSearch()" ng-controller="MainCtrl">What are you in the mood for: <input ng-model="service.userSearchTerm" name="text"> <input type="submit" id="submit" value="Submit"></form>Or<form ng-submit="service.expandSearch()" ng-controller="MainCtrl"><input type="submit" id="submit" value="Expand Current Search"></form><ul><h1>Results for {{service.userSearchTerm}}</h1><li ng-repeat="venue in service.appData"><h2>{{venue.name}}</h2><p>{{venue.weather.temp | kelvinToF | number:1}} F {{venue.weather.condition}} and {{venue.distance | metersToMiles | number:1}} miles</p><p>{{venue.blurb}}</p></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('adventureplanner');
} catch (e) {
  module = angular.module('adventureplanner', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('/adventureplanner/main/landingPage.html',
    '<h2>Getting your location . . .</h2>');
}]);
})();
