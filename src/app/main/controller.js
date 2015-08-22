angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, $http) {
    'use strict';
        
    var randNum = function (max) {
      return Math.floor((Math.random() * max) + 1 );
    };
    
    var locationRequestParams = {
      id: 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O',
      secret: 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM',
      lat: '37.794',
      lng: '-122.408',
      offset: randNum(20),
      query: $scope.userSearchTerm || 'mountain'
    };
    
    var buildLocationRequest = function (request) {
      return 'https://api.foursquare.com/v2/venues/explore?client_id=' +
                 request.id +
                 '&client_secret=' +
                 request.secret +
                 '&v=20130815&' +
                 'll=' + request.lat + ',' + request.lng +
                 '&query=' + request.query +
                 '&offset=' + request.offset +
                 '&radius=130000' +
                 '&sortByDistance=1';
    };

    var buildWeatherRequest = function(lat, lng) {
      return 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + lng;
    };
    
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

    $scope.triggerAdventureIdeas = function() {
      var lRequest = buildLocationRequest(locationRequestParams);
      console.log(lRequest);
      apiCall(lRequest, locationCallback);
    };

    var wRequest = buildWeatherRequest(locationRequestParams.lat, locationRequestParams.lng);
    apiCall(wRequest, weatherCallback);

    $scope.triggerAdventureIdeas();

  });