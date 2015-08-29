'use strict'

angular
  .module('adventureplanner.main')
  .factory('dataService', function dataService ( venueService, weatherService, nearCityService) {
    var instance = {
      getVenues: getVenues,
      queryOtherCities: queryOtherCities,
      venues: '',
      currentLocation: '',
      citySearchRadius: 60,
      userSearchTerm: 'mountain',
      lat: '39.0349',
      lng: '-77.1014'
    };

    return instance;

    //////////////

    function queryOtherCities () {
      var params = {
        citySearchRadius: instance.citySearchRadius,
        lat: instance.lat,
        lng: instance.lng
      };
      console.log('boo');
      nearCityService.get(params);
    }
    
    function getVenues () {
      
      var params = {
        query: instance.userSearchTerm,
        // lat: instance.lat, //uncomment to use custom for network calls 
        // lng: instance.lng
      };

      instance.queryOtherCities();
      
      return venueService.get(params)
        .then(function (response) {
					instance.currentLocation = response.data.response.headerFullLocation;
					instance.venues = response.data.response.groups[0].items;
					
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
			if (!params) { params = {}; }
			var lat = params.hasOwnProperty('lat') ? params.lat : '37.794';
			var lng = params.hasOwnProperty('lng') ? params.lng : '-122.408';
			return 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + lng;
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
                 '&client_secret=' +
                 params.secret +
                 '&v=20130815&' +
                 'll=' + params.lat + ',' + params.lng +
                 '&query=' + params.query +
                 '&offset=' + params.offset +
                 '&radius=130000' +
                 '&sortByDistance=1';
    }

    function venueParams ( params ) {
      if (!params) { params = {}; }
      var max        = params.hasOwnProperty('max')   ? params.max   : 20;
      var queryVenue = params.hasOwnProperty('query') ? params.query : 'mountain';
      var lat        = params.hasOwnProperty('lat')   ? params.lat   : '37.7974';
      var lng        = params.hasOwnProperty('lng')   ? params.lng   : '-122.4160';
      
      function _randNum () {
        return Math.floor((Math.random() * max) + 1 );
      }
      return {
        id: 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O',
        secret: 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM',
        lat: lat,
        lng: lng,
        offset: _randNum(20),
        query: queryVenue
      };
    }
  })
  .factory('nearCityService', function nearCityService ($http) {
    
    var service = {
      get: get,
      // findBoundaries: findBoundaries,
      buildRequest: buildRequest
    };
    
    return service;
    
    //////////////
    
    function get ( params ) {
      // Todo take in paramas latLng then calculate bounding box and pass it to buildRequest
      return $http.get(buildRequest());
    }

    // function findBoundaries (params) {



    // }

    function buildRequest () {
      var north = '38.2';
      var south = '36.3';
      var east = '-121';
      var west = '-123';

      return 'http://api.geonames.org/citiesJSON?north='+ north + '&south=' + south +'&east=' + east + '&west=' + west + '&lang=de&username=sturpon711';
    }

  });