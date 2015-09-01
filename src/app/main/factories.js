'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', function dataService (venueService, weatherService, nearCityService) {
    var instance = {
      currentData: {
        name: '',
        temp: '',
        condition: '',
        lat: '',
        lng: ''
      },
      expandSearch: expandSearch,
      init: init,
      getVenues: getVenues,
      lat: '',
      lng: '',
      limit:  5,
      offset: 20,
      maxRows: 3,
      newSearch: newSearch,
      userSearchTerm: 'mountain',
      venues: []
    };

    return instance;

    //////////////
    function init () {
      var params = {
        lat: instance.currentData.lat,
        lng: instance.currentData.lng
      };
      instance.currentData.name = 'CoolVille';
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
					// instance.currentLocation = response.data.response.headerFullLocation; // TODO: get this info from geolocation only
          var newVenues            = response.data.response.groups[0].items;
          instance.venues          = instance.venues.concat(newVenues);
          mapWeatherWithVenue(instance.venues);
        
        });
    }

		function mapWeatherWithVenue (venues) {
			
			var params   = { lat: '', lng: '', i: 0 };
			
			venues.forEach(function (place) {
        
        params.lat = place.venue.location.lat;
        params.lng = place.venue.location.lng;

        weatherService.get(params)
					.then(function(response) {
						
						instance.venues[params.i].weather = {
							temp: response.data.main.temp,
							condition: response.data.weather[0].main
						};
						
						params.i += 1;
					});
      });
		}
  })
	.factory('weatherService', function weatherService ( $http ) {
		var service = {
			get: get
		};

		return service;

		//////////////

		function get(params) {
			return $http.get(buildWeatherRequest(params));
		}

		function buildWeatherRequest (params) {
			return 'http://api.openweathermap.org/data/2.5/weather?lat=' + params.lat + '&lon=' + params.lng;
		}
  
  })
  .factory('venueService', function venueService ($http) {
    
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
  })
  .factory('nearCityService', function nearCityService ($http) {
    
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

  })
  .factory('geolocator', function geolocator($location, $window, $timeout, dataService) {
    var service = {
      get: get,
      success: success
    };

    return service;
    
    //////////////

    function get () {
      // $location.path('home')
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
  });