angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, $http) {
    'use strict';
    
    var myId = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
    var mySecret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

    var lat = '37.794';
    var longi = '-122.408';
    
    var randNum = function (max) {
      return Math.floor((Math.random() * max) + 1 );
    };
    var offset = randNum(20);
    
    var locationRequest = 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 myId +
                 '&client_secret=' +
                 mySecret +
                 '&v=20130815&' +
                 'll=' + lat + ',' + longi +
                 '&query=' + 'mountain' +
                 '&offset=' + offset +
                 '&radius=130000' +
                 '&sortByDistance=1';

    var buildWeatherRequest = function(lat, lng) {
      return 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + lng;
    }
    
    var apiCall = function (url, callback, index) {
        $http.get(url).success(function(data) {
          callback(data, index);
        });
    };


    var iterateOverLocations = function (places) {
      var lat, lng;
      places.forEach( function (place, i) {
        $scope.i = i;
        lat = place.venue.location.lat;
        lng = place.venue.location.lng;
        var wRequest = buildWeatherRequest (lat, lng);
        apiCall(wRequest, weatherCallback, i);
      });
    };

    var locationCallback = function (data){
      $scope.currentLocation = data.response.headerFullLocation;
      $scope.places = data.response.groups[0].items; //need venue.name
      iterateOverLocations ($scope.places);
    };


    var weatherCallback = function (data, i) {
      var locationCondition = data.weather[0]['description'];
      var locationTemp = data.main.temp;
      if (i >= 0) {
        $scope.places[i].condition = locationCondition;
        $scope.places[i].temp = locationTemp;
      } else {
        $scope.currentCondition = locationCondition;
        $scope.currentTemp = locationTemp;
      }

    };

    var wRequest = buildWeatherRequest(lat, longi);
    apiCall(wRequest, weatherCallback);

    apiCall(locationRequest, locationCallback);

  });