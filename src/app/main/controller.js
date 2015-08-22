angular
  .module('adventureplanner.main')
  .controller('MainCtrl', function ($scope, $window, $http) {
    'use strict';
    
    var myId = 'OICKGWOXVDITIP00YRSWBKZ2JCBE0EIU1KI3GJDMZE1LYZ3O';
    var mySecret = 'GJ3CMLRXSKTJH1QS5YBADM422IJG5IIJP0Y55DH2ATBDHTPM';

    var lat = '37.794';
    var longi = '-122.408';
    // var latLong = '37.794,-122.408';
    var offset = Math.floor((Math.random() * 20) + 1 );
    
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

    // var weatherRequest = 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + longi;

    var buildWeatherRequest = function(lat, lng) {
      return 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat + '&lon=' + lng;
    }
    
    var apiCall = function (url, callback, index) {
        $http.get(url).success(function(data) {
          callback(data, index);
        });
    };

    // var randNum = function (max) {
    //   return Math.floor((Math.random() * max) + 1 );
    // };

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

    var initWeatherCallback = function (data) {
      $scope.currentCondition = data.weather[0]['description'];
      $scope.currentTemp = data.main.temp;
      console.log(data);
    };


     var weatherCallback = function (data, i) {
      var locationCondition = data.weather[0]['description'];
      var locationTemp = data.main.temp;

      $scope.places[i].condition = locationCondition;
      $scope.places[i].temp = locationTemp;
    };

    var wRequest = buildWeatherRequest(lat, longi);
    apiCall(wRequest, initWeatherCallback);

    apiCall(locationRequest, locationCallback);






    // $scope.todos = JSON.parse($window.localStorage.getItem('todos') || '[]');
    // $scope.$watch('todos', function (newTodos, oldTodos) {
    //   if (newTodos !== oldTodos) {
    //     $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
    //   }
    // }, true);

    // $scope.add = function () {
    //   var todo = {label: $scope.label, isDone: false};
    //   $scope.todos.push(todo);
    //   $window.localStorage.setItem('todos', JSON.stringify(angular.copy($scope.todos)));
    //   $scope.label = '';
    // };

    // $scope.check = function () {
    //   this.todo.isDone = !this.todo.isDone;
    // };
  


  });
