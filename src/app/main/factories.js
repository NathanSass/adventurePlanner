'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', function dataService (venueService, weatherService, nearCityService, $location) {
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
          var newVenues        = parseVenueData(response.data.response.groups[0].items);
          instance.venues          = instance.venues.concat(newVenues);
          mapWeatherWithVenue(instance.venues);
        })
        .catch(function () {
          $location.path('landing');
        });
    }

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
          console.log("error: ", el);
        }
      });
      return newVenueArr;
    }

		function mapWeatherWithVenue (venues) {
			
			var params   = { lat: '', lng: '', i: 0 };
			
			venues.forEach(function (place) {
        
        params.lat = place.lat;
        params.lng = place.lng;
        var dist = findDistance(place.lat, place.lng);
        place.distance = dist;

        weatherService.get(params)
					.then(function(response) {
            try {
              instance.venues[params.i].weather = {
                temp: response.data.main.temp,
                condition: response.data.weather[0].main
              };
            } catch(e) {
              console.log("Error: ", instance.venues, 'index: ', i);
            }
						params.i += 1;
					});
      });
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