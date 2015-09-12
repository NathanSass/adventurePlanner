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
					// Sort function here to get warmest weather first
					// instance.venues = sortByTemp(instance.venues)
          instance.appData = instance.venues;
          console.log('RELEASE DATA OBJECT REFERENCE'); //having double release sometimes
          return instance.appData;
        });

    }

    function sortByTemp (venues) { // currently not used
			venues.sort(function(a,b){
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
			
			venues.forEach(function (place, index) {
				var params   = {
					lat: place.lat,
					lng: place.lng,
					i: index
				};
        
        var dist = findDistance(place.lat, place.lng); // Not exactly part of this function but works here
        place.distance = dist; // not sure why this is here

        weatherService.get(params)
					.then(function(response) {
						try {
							var index = response.config.params.i;
							instance.venues[index].weather = {
								temp: response.data.main.temp,
							  condition: response.data.weather[0].main
							};
            } catch(e) {
							console.log('Error: ', instance.venues);
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
  });