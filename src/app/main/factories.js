'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', function dataService ( venueService, weatherService, nearCityService) {
    var instance = {
      citySearchRadius: 60,
      currentLocation: '',
      getVenues: getVenues,
      lat: '39.0349',
      // lng: '-122.408' //SF
      lng: '-77.1014', //DC
      max: 20,
      queryOtherCities: queryOtherCities,
      userSearchTerm: 'mountain',
      venues: '',
    };

    return instance;

    //////////////

    function queryOtherCities () {
      var params = {
        citySearchRadius: instance.citySearchRadius,
        lat: instance.lat,
        lng: instance.lng
      };
      nearCityService.get(params);
    }
    
    function getVenues () {
      
      var params = {
        query: instance.userSearchTerm,
        lat: instance.lat, //uncomment to use custom for network calls 
        lng: instance.lng
      };

      instance.queryOtherCities();
      
      return venueService.get(params)
        .then(function (response) {
					instance.currentLocation = response.data.response.headerFullLocation;
					instance.venues          = response.data.response.groups[0].items;
					
					mapWeatherWithVenue(instance.venues);
        
        });
    }

		function mapWeatherWithVenue (venues) {
			
			var params = { lat: '', lng: '', i: 0 };
			
			venues.forEach( function (place) {
        
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
			return 'http://api.openweathermap.org/data/2.5/weather?lat='+ params.lat + '&lon=' + params.lng;
		}
  
  })
  .factory('venueService', function venueService ($http) {
    
    var service = {
      get: get,
      venueParams: venueParams
    };
    
    return service;
    
    //////////////
    
    function get(params) {
      var venueUrl = _buildVenueRequest (venueParams(params));
      return $http.get(venueUrl);
    }

    function _buildVenueRequest (params) {
      return 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 params.id +
                 '&client_secret='  +
                 params.secret      +
                 '&v=20130815&'     +
                 'll=' + params.lat + ',' + params.lng +
                 '&query='  + params.query  +
                 '&offset=' + params.offset +
                 '&radius=130000' +
                 '&sortByDistance=1';
    }

    function venueParams ( params ) {
      
      function _randNum () {
        return Math.floor((Math.random() * params.max) + 1 );
      }
      return {
        id: 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O',
        secret: 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM',
        lat: params.lat,
        lng: params.lng,
        offset: _randNum(20),
        query: params.query
      };
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
        'north='  + boundaries.n +
        '&south=' + boundaries.s +
        '&east='  + boundaries.e +
        '&west='  + boundaries.w +
        '&lang=de&username=sturpon711';
    }

  });